-- Migration pour passer au système de crédit prépayé
-- À exécuter dans Supabase SQL Editor

-- Modifier la table subscriptions pour le système de crédit
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS credit_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_charge_date timestamp without time zone,
ADD COLUMN IF NOT EXISTS next_charge_date timestamp without time zone,
ADD COLUMN IF NOT EXISTS low_balance_alerted boolean DEFAULT false;

-- Mettre à jour les commentaires
COMMENT ON COLUMN public.subscriptions.credit_balance IS 'Solde de crédit disponible en euros';
COMMENT ON COLUMN public.subscriptions.monthly_cost IS 'Coût mensuel calculé en fonction du nombre d élèves';
COMMENT ON COLUMN public.subscriptions.last_charge_date IS 'Date du dernier prélèvement mensuel';
COMMENT ON COLUMN public.subscriptions.next_charge_date IS 'Date du prochain prélèvement mensuel';
COMMENT ON COLUMN public.subscriptions.low_balance_alerted IS 'Alerte envoyée pour solde insuffisant';

-- Le status peut maintenant être: 'active', 'insufficient_funds', 'suspended'
-- stripe_subscription_id n'est plus utilisé pour les abonnements récurrents
-- quota_limit reste le nombre d'élèves autorisés
-- quota_used reste le nombre d'élèves actuels
