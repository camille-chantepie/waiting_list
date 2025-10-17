# 📋 Résumé : Configuration du Cron Job - Akademos

## ✅ Fichiers créés

| Fichier | Description | Statut |
|---------|-------------|--------|
| `vercel.json` | Configuration Vercel Cron (le 1er de chaque mois à minuit) | ✅ Créé |
| `.github/workflows/monthly-charge.yml` | Alternative GitHub Actions | ✅ Créé |
| `CRON_SETUP.md` | Documentation détaillée du système de cron | ✅ Créé |
| `DEPLOYMENT_CRON.md` | Guide de déploiement étape par étape | ✅ Créé |
| `test-cron.sh` | Script de test pour vérifier le cron | ✅ Créé |
| `.env.local` | Secret CRON_SECRET ajouté | ✅ Mis à jour |

---

## 🎯 Objectif

Automatiser le prélèvement mensuel des frais d'abonnement :
- **Fréquence** : Le 1er de chaque mois à minuit
- **Calcul** : 5€ pour 1 élève + 2€ par élève supplémentaire
- **Action** : Déduction automatique du crédit ou suspension si insuffisant

---

## 🚀 Ce qui a été configuré

### 1. Vercel Cron (Solution Recommandée)

**Fichier** : `vercel.json`
```json
{
  "crons": [{
    "path": "/api/stripe/monthly-charge",
    "schedule": "0 0 1 * *"
  }]
}
```

**Avantages** :
- ✅ Intégré nativement à Vercel
- ✅ Gratuit dans le plan Hobby
- ✅ Interface graphique pour les logs
- ✅ Peut être testé manuellement via le dashboard

### 2. GitHub Actions (Solution Alternative)

**Fichier** : `.github/workflows/monthly-charge.yml`

**Avantages** :
- ✅ Fonctionne même sans Vercel
- ✅ Gratuit (2000 minutes/mois)
- ✅ Peut être déclenché manuellement
- ✅ Logs détaillés dans GitHub

### 3. Sécurité

**Secret généré** : `QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=`

Ce secret est requis pour appeler l'API `/api/stripe/monthly-charge` :
- ✅ Ajouté dans `.env.local` pour les tests locaux
- ⏳ À ajouter dans Vercel Environment Variables
- ⏳ À ajouter dans GitHub Secrets (si vous utilisez GitHub Actions)

---

## 🧪 Tests Effectués

### Test Local ✅

```bash
curl -X POST http://localhost:3000/api/stripe/monthly-charge \
  -H "Authorization: Bearer QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=" \
  -H "Content-Type: application/json"
```

**Résultat** : ✅ Succès - 1 abonnement traité

---

## 📝 Prochaines étapes (À FAIRE)

### Étape 1 : Configurer Vercel

1. Se connecter à https://vercel.com
2. Sélectionner le projet `waiting_list`
3. **Settings** → **Environment Variables**
4. Ajouter :
   - **Name** : `CRON_SECRET`
   - **Value** : `QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=`
   - Cocher : Production, Preview, Development
5. Sauvegarder

### Étape 2 : Déployer

```bash
git add .
git commit -m "Add Vercel Cron for monthly charges"
git push origin main
```

Vercel déploiera automatiquement.

### Étape 3 : Vérifier le Cron

1. Aller dans le projet Vercel
2. Cliquer sur **Cron Jobs** (menu latéral)
3. Vérifier que le cron apparaît :
   - Path : `/api/stripe/monthly-charge`
   - Schedule : `0 0 1 * *`
4. Cliquer sur **Run** pour tester manuellement
5. Vérifier les logs

### Étape 4 : (Optionnel) Configurer GitHub Actions

Si vous voulez une solution de backup :

1. Aller dans GitHub → Settings → Secrets → Actions
2. Ajouter deux secrets :
   - `CRON_SECRET` : `QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=`
   - `APP_URL` : Votre URL Vercel (ex: `https://akademos.vercel.app`)
3. Le workflow sera actif automatiquement

---

## 🛠️ Utiliser le Script de Test

Un script bash a été créé pour faciliter les tests :

```bash
# Test en local (serveur Next.js doit tourner)
./test-cron.sh local

# Test en production
./test-cron.sh production
```

Le script vérifie :
1. ✅ Que l'authentification est bien requise
2. ✅ Que le prélèvement fonctionne correctement
3. ✅ (Optionnel) L'état d'un utilisateur spécifique

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **CRON_SETUP.md** | Documentation complète du système de cron (FAQ, troubleshooting, exemples SQL) |
| **DEPLOYMENT_CRON.md** | Guide pas-à-pas pour le déploiement |
| **CREDIT_SYSTEM.md** | Documentation du système de crédit général |

---

## 🎯 Fonctionnement du Cron

### Ce qui se passe chaque 1er du mois :

1. **Récupération** de tous les abonnements actifs
2. **Comptage** du nombre d'élèves par professeur
3. **Calcul** du coût mensuel (5€ + 2€ par élève supplémentaire)
4. **Déduction** du solde de crédit
5. **Mise à jour** des dates et statuts
6. **Alerte** si le solde ne couvre pas le mois prochain
7. **Suspension** si le solde est insuffisant

### Exemples de résultats :

```json
{
  "success": true,
  "processed": 3,
  "results": [
    {
      "user_id": "abc-123",
      "status": "charged",
      "old_balance": 50,
      "new_balance": 43,
      "cost": 7,
      "alert": false
    },
    {
      "user_id": "def-456",
      "status": "charged",
      "old_balance": 12,
      "new_balance": 7,
      "cost": 5,
      "alert": true  // Alerte : solde < coût mensuel
    },
    {
      "user_id": "ghi-789",
      "status": "insufficient_funds",
      "balance": 3,
      "cost": 9  // Compte suspendu
    }
  ]
}
```

---

## 🔍 Monitoring

### Requêtes SQL utiles

```sql
-- Voir les derniers prélèvements
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  s.last_charge_date,
  s.status
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.last_charge_date IS NOT NULL
ORDER BY s.last_charge_date DESC
LIMIT 20;

-- Professeurs en alerte (solde faible)
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  ROUND(s.credit_balance / NULLIF(s.monthly_cost, 0), 1) as mois_restants
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.low_balance_alerted = true
ORDER BY mois_restants ASC;

-- Comptes suspendus
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  s.quota_used as nb_eleves
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.status = 'insufficient_funds';
```

---

## ⚡ Actions Rapides

### Lancer le cron manuellement

**En local** :
```bash
./test-cron.sh local
```

**En production via Vercel** :
1. Dashboard Vercel → Cron Jobs
2. Cliquer sur "Run"

**En production via GitHub Actions** :
1. GitHub → Actions
2. "Monthly Subscription Charge" → Run workflow

### Vérifier les logs

**Vercel** : Dashboard → Functions → Logs → Filtrer par `/api/stripe/monthly-charge`

**GitHub Actions** : Actions → Workflow run → Logs

---

## ✅ Checklist Finale

- [x] `vercel.json` créé
- [x] `.github/workflows/monthly-charge.yml` créé
- [x] `CRON_SECRET` généré et ajouté à `.env.local`
- [x] API `/api/stripe/monthly-charge` mise à jour
- [x] Tests locaux réussis
- [x] Documentation créée (CRON_SETUP.md, DEPLOYMENT_CRON.md)
- [x] Script de test créé (`test-cron.sh`)
- [ ] **TODO : Ajouter CRON_SECRET dans Vercel**
- [ ] **TODO : Déployer sur Vercel**
- [ ] **TODO : Tester le cron en production**
- [ ] **TODO : (Optionnel) Configurer GitHub Secrets**

---

## 🎉 Prochaine exécution automatique

**Date** : 1er novembre 2025 à 00:00:00 UTC

D'ici là, vous pouvez tester manuellement le cron pour vous assurer que tout fonctionne correctement !

---

**Questions ?** Consultez les fichiers de documentation ou testez avec `./test-cron.sh` ! 🚀
