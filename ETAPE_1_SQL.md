# ✅ ÉTAPE 1 : Migrations SQL - À FAIRE MAINTENANT

## 🎯 Objectif
Ajouter les colonnes nécessaires dans votre base de données Supabase pour le système de crédit et de parrainage.

---

## 📝 Instructions Pas à Pas

### 1. Ouvrir Supabase

1. Aller sur **https://supabase.com**
2. Se connecter
3. Cliquer sur votre projet
4. Dans le menu de gauche, cliquer sur **SQL Editor** (icône </>)

---

### 2. Première Migration : Système de Crédit

1. Cliquer sur **"+ New query"** en haut à gauche

2. **Copier-coller ce code SQL** dans l'éditeur :

```sql
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
```

3. Cliquer sur **"RUN"** (ou appuyer sur `Ctrl+Enter` / `Cmd+Enter`)

4. ✅ **Vérifier le message de succès** en bas de l'écran :
   - Vous devriez voir : `Success. No rows returned`

---

### 3. Deuxième Migration : Système de Parrainage

1. Cliquer à nouveau sur **"+ New query"**

2. **Copier-coller ce code SQL** :

```sql
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
```

3. Cliquer sur **"RUN"**

4. ✅ **Vérifier le message de succès**

---

### 4. Vérifier que Tout est Bien Créé

1. Dans Supabase, cliquer sur **Table Editor** dans le menu de gauche
2. Sélectionner la table **`subscriptions`**
3. Regarder les colonnes - vous devriez voir :

**Nouvelles colonnes pour le crédit :**
- ✅ `credit_balance`
- ✅ `monthly_cost`
- ✅ `last_charge_date`
- ✅ `next_charge_date`
- ✅ `low_balance_alerted`

**Nouvelles colonnes pour le parrainage :**
- ✅ `referral_code`
- ✅ `referred_by`
- ✅ `referral_credited`
- ✅ `referral_count`
- ✅ `referral_earnings`

---

## ✅ Étape 1 Terminée !

Une fois que vous voyez toutes ces colonnes, **l'étape 1 est terminée** ! 🎉

**Prochaine étape** : Ouvrir le fichier `ETAPE_2_VERCEL.md`

---

## 🆘 En cas de problème

### Erreur : "relation subscriptions does not exist"
→ La table `subscriptions` n'existe pas encore. Vous devez d'abord créer votre structure de base de données.

### Erreur : "column already exists"
→ Pas de problème ! Le `IF NOT EXISTS` protège contre cette erreur. Continuer normalement.

### Erreur de syntaxe
→ Vérifier que vous avez bien copié TOUT le code SQL (du début à la fin)

---

**Temps estimé** : 3-5 minutes ⏱️
