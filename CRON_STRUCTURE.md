# 🗂️ Structure des Fichiers - Configuration Cron

```
waiting_list/
│
├── 📄 vercel.json                          ⭐ Config Vercel Cron
│   └── Définit le cron : "0 0 1 * *"
│
├── 📄 .env.local                           🔒 Secrets locaux
│   └── CRON_SECRET=QXVIvvzS...
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 monthly-charge.yml           🔄 Alternative GitHub Actions
│
├── 📁 app/
│   └── 📁 api/
│       └── 📁 stripe/
│           └── 📁 monthly-charge/
│               └── 📄 route.ts             🎯 API de prélèvement
│
├── 📄 test-cron.sh                         🧪 Script de test
│
└── 📚 Documentation/
    ├── 📄 CRON_SUMMARY.md                  📋 Ce fichier - Résumé
    ├── 📄 CRON_SETUP.md                    📖 Guide complet
    ├── 📄 DEPLOYMENT_CRON.md               🚀 Guide de déploiement
    └── 📄 CREDIT_SYSTEM.md                 💰 Doc système de crédit
```

---

## 🔄 Flux d'Exécution du Cron

```
┌─────────────────────────────────────────────────────────────┐
│  📅 1er de chaque mois à 00:00 UTC                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──────────────────┬────────────────────┐
                     │                  │                    │
                     ▼                  ▼                    ▼
            ┌────────────────┐  ┌──────────────┐  ┌────────────────┐
            │ Vercel Cron    │  │ GitHub       │  │ Manuel         │
            │ (Production)   │  │ Actions      │  │ (Test)         │
            └───────┬────────┘  └──────┬───────┘  └───────┬────────┘
                    │                  │                   │
                    └──────────────────┼───────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────┐
                    │  🔐 Vérification Bearer Token        │
                    │  Authorization: Bearer CRON_SECRET   │
                    └──────────────┬───────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────────┐
                    │  📊 Récupérer tous les abonnements   │
                    │  WHERE status = 'active'             │
                    └──────────────┬───────────────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                              │
                    ▼                              ▼
        ┌────────────────────┐        ┌────────────────────┐
        │ Professeur A       │        │ Professeur B       │
        │ - 2 élèves         │        │ - 5 élèves         │
        │ - Solde: 45€       │        │ - Solde: 8€        │
        └─────────┬──────────┘        └──────────┬─────────┘
                  │                              │
                  ▼                              ▼
        ┌────────────────────┐        ┌────────────────────┐
        │ Calcul coût        │        │ Calcul coût        │
        │ 5 + (2-1) × 2 = 7€ │        │ 5 + (5-1) × 2 = 13€│
        └─────────┬──────────┘        └──────────┬─────────┘
                  │                              │
                  ▼                              ▼
        ┌────────────────────┐        ┌────────────────────┐
        │ ✅ Déduction        │        │ ❌ Solde insuffisant│
        │ Nouveau: 38€       │        │ Status: suspended  │
        │ Alerte: Non        │        │ Alerte: Oui        │
        └─────────┬──────────┘        └──────────┬─────────┘
                  │                              │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  📝 Mise à jour Supabase     │
                  │  - credit_balance            │
                  │  - last_charge_date          │
                  │  - next_charge_date          │
                  │  - status                    │
                  │  - low_balance_alerted       │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  ✅ Réponse JSON avec        │
                  │  résultats de chaque prof    │
                  └──────────────────────────────┘
```

---

## 🎯 Configuration par Environnement

### Développement Local

```bash
# .env.local
CRON_SECRET=QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=

# Tester
npm run dev
./test-cron.sh local
```

### Production Vercel

```
Vercel Dashboard
 └── Settings
     └── Environment Variables
         └── CRON_SECRET = QXVIvvzS...
             ├── ✅ Production
             ├── ✅ Preview
             └── ✅ Development

Vercel Dashboard
 └── Cron Jobs
     └── /api/stripe/monthly-charge
         ├── Schedule: 0 0 1 * *
         └── [Run] ← Tester manuellement
```

### GitHub Actions (Backup)

```
GitHub Repository
 └── Settings
     └── Secrets and variables
         └── Actions
             ├── CRON_SECRET = QXVIvvzS...
             └── APP_URL = https://akademos.vercel.app

GitHub Repository
 └── Actions
     └── Monthly Subscription Charge
         └── [Run workflow] ← Tester manuellement
```

---

## 📊 États Possibles après Prélèvement

| État | Description | Actions |
|------|-------------|---------|
| ✅ **charged** | Déduction réussie | Solde mis à jour, tout fonctionne |
| ⚠️ **alert** | Solde < coût mensuel | Alerte affichée au prof, fonctionne encore |
| ❌ **insufficient_funds** | Solde insuffisant | Compte suspendu, prof doit recharger |
| 🔧 **error** | Erreur technique | Voir les logs, corriger manuellement |

---

## 🔐 Sécurité

### Le CRON_SECRET protège l'API

```
Sans token :
❌ 401 Unauthorized

Avec mauvais token :
❌ 401 Unauthorized

Avec bon token :
✅ 200 OK + Résultats
```

### Où est stocké le secret ?

```
Local:    .env.local              (git ignored)
Vercel:   Environment Variables   (chiffré)
GitHub:   Secrets                 (chiffré)
```

⚠️ **Ne JAMAIS** commiter le secret dans Git !

---

## 🧪 Commandes Rapides

```bash
# Test local
./test-cron.sh local

# Test production
./test-cron.sh production

# Vérifier les logs Vercel (après déploiement)
# → Dashboard Vercel → Functions → Logs

# Vérifier la base de données
# → Supabase → SQL Editor → Coller les requêtes du CRON_SUMMARY.md

# Déployer
git add .
git commit -m "Configure monthly cron job"
git push origin main
```

---

## 📈 Métriques à Surveiller

### Chaque Début de Mois

- ✅ **Nombre de prélèvements** : Tous les profs actifs ont été traités ?
- ⚠️ **Alertes de solde faible** : Combien de profs ont moins de 2 mois ?
- ❌ **Suspensions** : Combien de profs ont un solde insuffisant ?
- 📊 **Revenus totaux** : Somme des prélèvements du mois

### Requêtes SQL

Voir `CRON_SUMMARY.md` section "Monitoring" pour les requêtes complètes.

---

## 🎓 Compréhension Rapide

**Question** : Quand le cron s'exécute-t-il ?
**Réponse** : Le 1er de chaque mois à minuit (00:00 UTC)

**Question** : Que fait-il ?
**Réponse** : Déduit le coût mensuel du crédit de chaque professeur

**Question** : Comment tester ?
**Réponse** : `./test-cron.sh local` ou manuellement dans Vercel

**Question** : Que se passe-t-il si un prof n'a pas assez de crédit ?
**Réponse** : Son statut devient `insufficient_funds` et il est alerté

**Question** : Les élèves sont-ils supprimés si le prof est suspendu ?
**Réponse** : Non, les données restent, mais le prof ne peut plus ajouter d'élèves

---

## ✅ Prêt à Déployer !

Tous les fichiers sont configurés et testés localement. Il ne reste plus qu'à :

1. **Ajouter CRON_SECRET dans Vercel**
2. **Pousser le code** : `git push`
3. **Vérifier le cron** dans le dashboard Vercel
4. **Tester manuellement** avec le bouton "Run"

🎉 **C'est tout !** Le système sera 100% automatique ensuite.

---

Pour plus de détails, consultez :
- **DEPLOYMENT_CRON.md** : Guide étape par étape
- **CRON_SETUP.md** : Documentation complète avec FAQ
- **CREDIT_SYSTEM.md** : Fonctionnement du système de crédit
