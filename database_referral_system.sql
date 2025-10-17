-- Migration pour ajouter le système de parrainage
-- À exécuter dans Supabase SQL Editor

-- Ajouter les colonnes de parrainage à la table subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by text,
ADD COLUMN IF NOT EXISTS referral_credited boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_earnings numeric DEFAULT 0;

-- Créer un index pour les recherches par code de parrainage
CREATE INDEX IF NOT EXISTS idx_subscriptions_referral_code ON public.subscriptions(referral_code);

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Générer un code de 8 caractères (lettres majuscules et chiffres)
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM subscriptions WHERE referral_code = code) INTO exists;
    
    -- Si le code n'existe pas, le retourner
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Générer des codes de parrainage pour les professeurs existants qui n'en ont pas
UPDATE public.subscriptions
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Commentaires
COMMENT ON COLUMN public.subscriptions.referral_code IS 'Code de parrainage unique du professeur';
COMMENT ON COLUMN public.subscriptions.referred_by IS 'Code de parrainage du parrain (qui a recommandé ce professeur)';
COMMENT ON COLUMN public.subscriptions.referral_credited IS 'Le bonus de parrainage a-t-il été crédité au parrain ?';
COMMENT ON COLUMN public.subscriptions.referral_count IS 'Nombre de filleuls qui ont rechargé leur compte';
COMMENT ON COLUMN public.subscriptions.referral_earnings IS 'Total des gains de parrainage en euros';
