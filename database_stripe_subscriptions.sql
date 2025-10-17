-- ============================================
-- MIGRATION STRIPE - Tables d'abonnement
-- ============================================

-- Créer la table subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT, -- active, canceled, past_due, etc.
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  quota_limit INTEGER DEFAULT 50,
  quota_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS sur subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir leur propre abonnement
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Fonction pour réinitialiser les quotas mensuellement (sera appelée par un webhook)
CREATE OR REPLACE FUNCTION reset_quota(sub_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET quota_used = 0,
      updated_at = now()
  WHERE id = sub_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le quota utilisé
CREATE OR REPLACE FUNCTION increment_quota(sub_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET quota_used = quota_used + 1,
      updated_at = now()
  WHERE id = sub_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si le quota est atteint
CREATE OR REPLACE FUNCTION check_quota(sub_id UUID)
RETURNS boolean AS $$
DECLARE
  current_quota subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO current_quota FROM subscriptions WHERE id = sub_id;
  
  IF current_quota IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN current_quota.quota_used < current_quota.quota_limit;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON subscriptions;

CREATE TRIGGER trigger_update_subscription_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================

SELECT 'Stripe subscriptions migration completed successfully!' as status;
