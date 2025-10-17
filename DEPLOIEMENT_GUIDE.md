# 🚀 Guide de Déploiement - Pas à Pas

## 📋 Étape 1 : Migrations SQL dans Supabase (5 minutes)

### 1️⃣ Ouvrir Supabase

1. Aller sur https://supabase.com
2. Se connecter à votre compte
3. Sélectionner votre projet Akademos
4. Cliquer sur **SQL Editor** dans le menu de gauche

### 2️⃣ Exécuter la migration du système de crédit

1. Cliquer sur **"New query"**
2. Copier-coller le contenu du fichier `database_credit_system.sql` :

```sql
-- Migration pour le système de crédit prépayé
-- Date : 16 octobre 2025

-- Ajouter les colonnes pour le système de crédit
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS credit_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_charge_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_charge_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS low_balance_alerted BOOLEAN DEFAULT false;

-- Mettre à jour les commentaires des colonnes
COMMENT ON COLUMN subscriptions.credit_balance IS 'Solde de crédit en euros';
COMMENT ON COLUMN subscriptions.monthly_cost IS 'Coût mensuel calculé (5€ + 2€ par élève supplémentaire)';
COMMENT ON COLUMN subscriptions.last_charge_date IS 'Date du dernier prélèvement mensuel';
COMMENT ON COLUMN subscriptions.next_charge_date IS 'Date prévue du prochain prélèvement';
COMMENT ON COLUMN subscriptions.low_balance_alerted IS 'Si une alerte a été envoyée pour solde faible';
```

3. Cliquer sur **"Run"** (ou Ctrl/Cmd + Enter)
4. Vérifier qu'il y a un message de succès ✅

### 3️⃣ Exécuter la migration du système de parrainage

1. Cliquer sur **"New query"**
2. Copier-coller le contenu du fichier `database_referral_system.sql` :

```sql
-- Migration pour le système de parrainage
-- Date : 16 octobre 2025

-- Ajouter les colonnes pour le parrainage
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(8),
ADD COLUMN IF NOT EXISTS referral_credited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0;

-- Créer un index pour accélérer les recherches par code de parrainage
CREATE INDEX IF NOT EXISTS idx_subscriptions_referral_code ON subscriptions(referral_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_referred_by ON subscriptions(referred_by);

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR(8) := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM subscriptions WHERE referral_code = result) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON COLUMN subscriptions.referral_code IS 'Code de parrainage unique du professeur';
COMMENT ON COLUMN subscriptions.referred_by IS 'Code de parrainage utilisé lors de l''inscription';
COMMENT ON COLUMN subscriptions.referral_credited IS 'Si le bonus de parrainage a été crédité';
COMMENT ON COLUMN subscriptions.referral_count IS 'Nombre de filleuls parrainés';
COMMENT ON COLUMN subscriptions.referral_earnings IS 'Gains totaux en euros grâce au parrainage';
```

3. Cliquer sur **"Run"** (ou Ctrl/Cmd + Enter)
4. Vérifier qu'il y a un message de succès ✅

### 4️⃣ Vérifier que tout est bien créé

1. Dans Supabase, aller dans **Table Editor**
2. Sélectionner la table **subscriptions**
3. Vérifier que vous voyez les nouvelles colonnes :
   - ✅ `credit_balance`
   - ✅ `monthly_cost`
   - ✅ `last_charge_date`
   - ✅ `next_charge_date`
   - ✅ `low_balance_alerted`
   - ✅ `referral_code`
   - ✅ `referred_by`
   - ✅ `referral_credited`
   - ✅ `referral_count`
   - ✅ `referral_earnings`

---

## 📋 Étape 2 : Ajouter CRON_SECRET dans Vercel (2 minutes)

### 1️⃣ Ouvrir Vercel

1. Aller sur https://vercel.com
2. Se connecter à votre compte
3. Sélectionner votre projet **waiting_list** (ou le nom de votre projet)

### 2️⃣ Ajouter la variable d'environnement

1. Cliquer sur **Settings** (onglet en haut)
2. Dans le menu de gauche, cliquer sur **Environment Variables**
3. Cliquer sur le bouton **Add New**
4. Remplir le formulaire :

   ```
   Name:  CRON_SECRET
   Value: QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=
   ```

5. Cocher les environnements :
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**

6. Cliquer sur **Save**

### 3️⃣ Vérifier

Vous devriez voir `CRON_SECRET` dans la liste des variables d'environnement ✅

---

## 📋 Étape 3 : Déployer le Code (3 minutes)

### 1️⃣ Vérifier que tout est prêt

Ouvrir un terminal dans le dossier du projet et vérifier :

```bash
# Vérifier que la compilation fonctionne
npm run build
```

Si ça compile avec succès ✅, continuer.

### 2️⃣ Commiter les changements

```bash
# Voir les fichiers modifiés
git status

# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Add credit system, referral system and monthly cron job"

# Pousser sur GitHub
git push origin main
```

### 3️⃣ Attendre le déploiement

1. Vercel va détecter automatiquement le push
2. Le déploiement va commencer (vous recevrez un email)
3. Attendre 2-3 minutes
4. Vérifier que le déploiement est réussi (email de confirmation)

---

## 📋 Étape 4 : Vérifier le Cron Job dans Vercel (2 minutes)

### 1️⃣ Aller dans Vercel Dashboard

1. Ouvrir https://vercel.com
2. Sélectionner votre projet
3. Dans le menu de gauche, chercher **"Cron Jobs"**

### 2️⃣ Vérifier le cron

Vous devriez voir :

```
PATH: /api/stripe/monthly-charge
SCHEDULE: 0 0 1 * *
STATUS: ● Active
```

### 3️⃣ Tester manuellement

1. Cliquer sur le bouton **"Run"** à côté du cron
2. Attendre quelques secondes
3. Vérifier les logs : cliquer sur **"View Logs"** ou aller dans **Functions** → **Logs**

Vous devriez voir un message comme :
```json
{
  "success": true,
  "processed": 1,
  "results": [...]
}
```

### 4️⃣ Vérifier dans Supabase

1. Retourner dans Supabase
2. **SQL Editor** → **New query**
3. Exécuter :

```sql
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  s.last_charge_date,
  s.status
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
ORDER BY s.updated_at DESC
LIMIT 5;
```

4. Vérifier que `last_charge_date` a été mis à jour ✅

---

## 🎉 C'est Terminé !

Votre système de crédit avec prélèvement mensuel automatique est maintenant **100% opérationnel** ! 🚀

### Ce qui fonctionne maintenant :

✅ **Rechargement de crédit** : Les profs peuvent recharger min 20€
✅ **Prélèvement automatique** : Chaque 1er du mois à minuit
✅ **Système de parrainage** : 5€ de bonus pour parrainer
✅ **Alertes automatiques** : Si solde faible
✅ **Suspension automatique** : Si fonds insuffisants

### Prochaine exécution automatique :

**📅 1er novembre 2025 à 00:00 UTC**

---

## 🧪 Tests Recommandés

### Test 1 : Rechargement de crédit

1. Aller sur votre site `/teacher/account`
2. Entrer 20€ dans le champ de rechargement
3. Cliquer sur "Recharger"
4. Utiliser une carte de test Stripe : `4242 4242 4242 4242`
5. Vérifier que le solde est mis à jour

### Test 2 : Système de parrainage

1. Créer un compte professeur
2. Aller dans `/teacher/account`
3. Récupérer votre code de parrainage
4. Créer un 2ème compte avec ce code
5. Faire un rechargement de 20€ avec le 2ème compte
6. Vérifier que le 1er compte a reçu +5€

### Test 3 : Prélèvement mensuel

Déjà testé dans l'étape 4 ci-dessus ✅

---

## 📚 Documentation

- **QUICK_START_CRON.md** : Guide rapide 3 minutes
- **DEPLOYMENT_CRON.md** : Guide complet de déploiement
- **CRON_SETUP.md** : Documentation technique
- **CREDIT_SYSTEM.md** : Fonctionnement du système de crédit
- **SYSTEM_OVERVIEW.md** : Vue d'ensemble complète

---

## 🆘 En cas de problème

| Problème | Solution |
|----------|----------|
| Migration SQL échoue | Vérifier que la table `subscriptions` existe |
| Cron n'apparaît pas | Vérifier que `vercel.json` est bien committé |
| Erreur 401 sur le cron | Vérifier que `CRON_SECRET` est configuré |
| Pas de crédit après paiement | Vérifier les logs du webhook dans Vercel |

---

**🎊 Félicitations ! Votre système est déployé !** 🎊
