# Système de Crédit Prépayé - Akademos

## 🎯 Changement de modèle

Le système a été migré d'un **abonnement récurrent Stripe** vers un **système de crédit prépayé**.

## 💰 Fonctionnement

### Pour les professeurs :

1. **Rechargement initial**
   - Montant minimum : **20€**
   - Le crédit est ajouté instantanément au compte après paiement

2. **Déduction mensuelle automatique**
   - Chaque mois, le coût est automatiquement déduit du solde
   - Calcul : **5€ pour 1 élève + 2€ par élève supplémentaire**
   - Exemples :
     - 1 élève = 5€/mois
     - 2 élèves = 7€/mois
     - 5 élèves = 13€/mois

3. **Alertes automatiques**
   - ⚠️ Alerte si le solde ne couvre pas le mois prochain
   - ❌ Suspension si le solde est insuffisant lors du prélèvement

## 🗄️ Modifications de la base de données

### Nouveaux champs dans `subscriptions` :

```sql
-- Exécuter le script : database_credit_system.sql
credit_balance          numeric    -- Solde de crédit en euros
monthly_cost            numeric    -- Coût mensuel calculé
last_charge_date        timestamp  -- Date du dernier prélèvement
next_charge_date        timestamp  -- Date du prochain prélèvement
low_balance_alerted     boolean    -- Alerte envoyée pour solde faible
```

### Statuts possibles :

- `active` : Abonnement actif avec crédit suffisant
- `insufficient_funds` : Solde insuffisant, accès suspendu
- `suspended` : Compte suspendu manuellement

## 🔄 APIs modifiées

### 1. `/api/stripe/create-checkout-session` (POST)

**Avant** : Créait un abonnement récurrent Stripe  
**Maintenant** : Crée un paiement unique pour recharger le crédit

```json
{
  "userId": "uuid-du-professeur",
  "creditAmount": 50  // Minimum 20€
}
```

### 2. `/api/stripe/webhook` (POST)

**Avant** : Gérait les événements d'abonnement  
**Maintenant** : Gère `checkout.session.completed` pour ajouter le crédit

### 3. `/api/stripe/monthly-charge` (POST) - NOUVEAU

Déduction mensuelle automatique. À appeler via un cron job.

**Authentification** : Bearer token avec `CRON_SECRET`

**Fonctionnement** :
1. Récupère tous les abonnements actifs
2. Compte les élèves pour chaque professeur
3. Calcule le coût mensuel
4. Déduit du solde
5. Met à jour le statut si insuffisant

### 4. `/api/stripe/monthly-charge?userId=xxx` (GET) - NOUVEAU

Vérifie l'état du crédit pour un professeur spécifique.

**Réponse** :
```json
{
  "subscription": {...},
  "student_count": 3,
  "monthly_cost": 9,
  "current_balance": 45.50,
  "can_afford_next_month": true,
  "months_remaining": 5
}
```

## ⏰ Configuration du Cron Job

Le prélèvement mensuel doit être automatisé. Plusieurs options :

### Option 1 : Vercel Cron (Recommandé)

Créer `vercel.json` :
```json
{
  "crons": [{
    "path": "/api/stripe/monthly-charge",
    "schedule": "0 0 1 * *"
  }]
}
```

**Note** : Ajouter l'authentification dans le header.

### Option 2 : GitHub Actions

Créer `.github/workflows/monthly-charge.yml` :
```yaml
name: Monthly Charge
on:
  schedule:
    - cron: '0 0 1 * *'  # Le 1er de chaque mois à minuit
  workflow_dispatch:      # Permet l'exécution manuelle

jobs:
  charge:
    runs-on: ubuntu-latest
    steps:
      - name: Call Monthly Charge API
        run: |
          curl -X POST https://votre-domaine.com/api/stripe/monthly-charge \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option 3 : Cron externe (cron-job.org, EasyCron, etc.)

Configurer une requête POST mensuelle vers :
```
POST https://votre-domaine.com/api/stripe/monthly-charge
Headers: Authorization: Bearer votre-cron-secret
```

## 🎨 Interface utilisateur

### Composant `SubscriptionManager`

Affiche maintenant :
- ✅ Solde de crédit actuel
- 💰 Coût mensuel en fonction du nombre d'élèves
- 📅 Nombre de mois restants
- ⚠️ Alertes si solde insuffisant
- 🔄 Formulaire de rechargement (minimum 20€)
- 💡 Suggestions de montants (20€, 50€, 100€, 200€)

## 🔐 Variables d'environnement

Ajouter dans `.env.local` :

```env
# Existant
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NOUVEAU pour le cron job
CRON_SECRET=your-secure-random-string-here
```

## 📝 Migration des données existantes

Si vous avez déjà des professeurs avec des abonnements Stripe :

```sql
-- 1. Exécuter le script de migration
\i database_credit_system.sql

-- 2. Initialiser les crédits pour les professeurs existants
-- (Donner 3 mois de crédit gratuit par exemple)
UPDATE subscriptions s
SET credit_balance = (
  SELECT (5 + (COUNT(tsr.id) - 1) * 2) * 3
  FROM teacher_student_relations tsr
  WHERE tsr.teacher_id = s.user_id
    AND tsr.status = 'active'
),
monthly_cost = (
  SELECT 5 + (COUNT(tsr.id) - 1) * 2
  FROM teacher_student_relations tsr
  WHERE tsr.teacher_id = s.user_id
    AND tsr.status = 'active'
),
status = 'active',
last_charge_date = NOW(),
next_charge_date = NOW() + INTERVAL '1 month'
WHERE status IS NOT NULL;

-- 3. Annuler les abonnements Stripe existants (via dashboard ou API)
```

## ✅ Checklist de déploiement

- [ ] Exécuter `database_credit_system.sql` dans Supabase
- [ ] Ajouter `CRON_SECRET` dans les variables d'environnement
- [ ] Configurer le cron job (Vercel/GitHub Actions/autre)
- [ ] Tester le rechargement de crédit avec une carte de test
- [ ] Tester le prélèvement mensuel manuellement
- [ ] Vérifier les alertes de solde insuffisant
- [ ] Annuler les anciens abonnements Stripe récurrents
- [ ] Communiquer le changement aux professeurs existants

## 🧪 Tests

### Test du rechargement

```bash
# 1. Aller sur /teacher/account
# 2. Entrer un montant (ex: 50€)
# 3. Cliquer sur "Recharger"
# 4. Utiliser une carte de test : 4242 4242 4242 4242
# 5. Vérifier que le solde est mis à jour
```

### Test du prélèvement mensuel

```bash
# Appel manuel du cron
curl -X POST http://localhost:3000/api/stripe/monthly-charge \
  -H "Authorization: Bearer your-cron-secret"

# Vérifier dans Supabase que :
# - credit_balance a diminué
# - monthly_cost est correct
# - last_charge_date est mis à jour
```

### Test alerte solde insuffisant

```bash
# 1. Mettre un faible solde dans Supabase (ex: 3€)
# 2. Avoir 2+ élèves (coût > 5€)
# 3. Recharger la page /teacher/account
# 4. Vérifier que l'alerte orange apparaît
```

## 📊 Monitoring

Requêtes utiles pour monitorer :

```sql
-- Professeurs avec solde faible
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  s.credit_balance / NULLIF(s.monthly_cost, 0) as months_remaining
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.status = 'active'
  AND s.credit_balance < s.monthly_cost * 2
ORDER BY months_remaining ASC;

-- Historique des prélèvements
SELECT 
  t.email,
  s.monthly_cost,
  s.last_charge_date,
  s.next_charge_date,
  s.credit_balance
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.last_charge_date IS NOT NULL
ORDER BY s.last_charge_date DESC;

-- Professeurs en suspension
SELECT 
  t.email,
  s.status,
  s.credit_balance,
  s.monthly_cost,
  s.quota_used as nb_eleves
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.status = 'insufficient_funds';
```

## 🚨 Gestion des incidents

### Un professeur signale que son crédit n'a pas été ajouté

1. Vérifier dans Stripe Dashboard si le paiement est réussi
2. Vérifier les logs du webhook
3. Vérifier dans Supabase la valeur de `credit_balance`
4. Si nécessaire, ajuster manuellement :
```sql
UPDATE subscriptions 
SET credit_balance = credit_balance + MONTANT
WHERE user_id = 'uuid-du-prof';
```

### Le cron job ne s'exécute pas

1. Vérifier les logs Vercel/GitHub Actions
2. Tester manuellement l'endpoint
3. Vérifier que `CRON_SECRET` est correct
4. Lancer manuellement si nécessaire

### Alerte ne s'affiche pas

1. Vérifier `low_balance_alerted` dans la DB
2. Vérifier le calcul dans le composant
3. Forcer le rafraîchissement de la page

## 💡 Améliorations futures

- [ ] Envoi d'emails automatiques pour les alertes
- [ ] Historique des transactions visible dans l'interface
- [ ] Rechargement automatique quand le solde passe sous un seuil
- [ ] Système de bonus/réductions
- [ ] Dashboard d'administration pour gérer les crédits
