# 📋 Récapitulatif Complet - Système de Paiement Akademos

## 🎯 Évolution du Projet

### Phase 1 : Abonnement Stripe Récurrent (Initial)
- Paiement récurrent via Stripe Subscriptions
- 5€/mois pour 1 élève + 2€/élève supplémentaire

### Phase 2 : Système de Crédit Prépayé (Actuel)
- Rechargement minimum 20€
- Déduction mensuelle automatique du crédit
- Alertes de solde faible

### Phase 3 : Système de Parrainage (Actuel)
- Code de parrainage unique par professeur
- 5€ de bonus au parrain quand le filleul fait son premier rechargement

### Phase 4 : Cron Job Automatique (Actuel)
- Prélèvement automatique le 1er de chaque mois
- Suspension automatique si solde insuffisant

---

## 📁 Tous les Fichiers Créés/Modifiés

### Configuration & Déploiement

| Fichier | Description | Statut |
|---------|-------------|--------|
| `vercel.json` | Configuration Vercel Cron | ✅ Créé |
| `.github/workflows/monthly-charge.yml` | Alternative GitHub Actions | ✅ Créé |
| `.env.local` | Secrets (Stripe + Cron) | ✅ Mis à jour |
| `test-cron.sh` | Script de test du cron | ✅ Créé |

### APIs Stripe & Paiement

| Fichier | Description | Statut |
|---------|-------------|--------|
| `app/api/stripe/create-checkout-session/route.ts` | Création session de rechargement (20€ min) | ✅ Créé |
| `app/api/stripe/webhook/route.ts` | Gestion des paiements + bonus parrainage | ✅ Créé |
| `app/api/stripe/monthly-charge/route.ts` | Déduction mensuelle automatique (cron) | ✅ Créé |
| `app/api/referral/route.ts` | Gestion des codes de parrainage | ✅ Créé |

### Composants React

| Fichier | Description | Statut |
|---------|-------------|--------|
| `components/SubscriptionManager.tsx` | Interface crédit + parrainage | ✅ Créé |

### Utilitaires

| Fichier | Description | Statut |
|---------|-------------|--------|
| `utils/subscriptionCheck.ts` | Vérification limites abonnement | ✅ Créé |

### Base de Données

| Fichier | Description | Statut |
|---------|-------------|--------|
| `database_credit_system.sql` | Migration système de crédit | ✅ Créé |
| `database_referral_system.sql` | Migration système de parrainage | ✅ Créé |

### Documentation

| Fichier | Description | Statut |
|---------|-------------|--------|
| `CREDIT_SYSTEM.md` | Doc complète système de crédit | ✅ Créé |
| `CRON_SETUP.md` | Doc complète configuration cron | ✅ Créé |
| `CRON_STRUCTURE.md` | Structure et flux du cron | ✅ Créé |
| `CRON_SUMMARY.md` | Résumé + requêtes SQL monitoring | ✅ Créé |
| `DEPLOYMENT_CRON.md` | Guide déploiement étape par étape | ✅ Créé |
| `QUICK_START_CRON.md` | Guide rapide 3 minutes | ✅ Créé |

---

## 🗄️ Modifications Base de Données

### Table `subscriptions` - Nouveaux champs

```sql
-- Système de crédit
credit_balance          NUMERIC DEFAULT 0           -- Solde de crédit en euros
monthly_cost            NUMERIC DEFAULT 0           -- Coût mensuel calculé
last_charge_date        TIMESTAMP                   -- Date du dernier prélèvement
next_charge_date        TIMESTAMP                   -- Date du prochain prélèvement
low_balance_alerted     BOOLEAN DEFAULT false       -- Alerte envoyée ?

-- Système de parrainage
referral_code           VARCHAR(8) UNIQUE           -- Code unique du professeur
referred_by             VARCHAR(8)                  -- Parrainé par quel code ?
referral_credited       BOOLEAN DEFAULT false       -- Bonus déjà donné ?
referral_count          INTEGER DEFAULT 0           -- Nombre de filleuls
referral_earnings       NUMERIC DEFAULT 0           -- Gains totaux de parrainage
```

---

## 🔐 Variables d'Environnement

### `.env.local` (Local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cron Job (Nouveau)
CRON_SECRET=QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=
```

### Vercel (Production)

**À ajouter manuellement** :
- ✅ `CRON_SECRET` (même valeur que local)

### GitHub Secrets (Optionnel)

**Si vous utilisez GitHub Actions** :
- `CRON_SECRET`
- `APP_URL`

---

## 📊 Flux Complet du Système

### 1. Inscription d'un Professeur

```
Professeur s'inscrit
    ↓
Entre code de parrainage (optionnel)
    ↓
Code validé via /api/referral (POST)
    ↓
Enregistré dans `referred_by`
```

### 2. Premier Rechargement

```
Professeur va dans Compte
    ↓
Entre montant ≥ 20€
    ↓
/api/stripe/create-checkout-session
    ↓
Redirigé vers Stripe Checkout
    ↓
Paiement réussi
    ↓
Webhook /api/stripe/webhook
    ↓
Crédit ajouté au solde
    ↓
SI code parrainage ET premier rechargement :
    → Parrain reçoit +5€
    → referral_credited = true
```

### 3. Prélèvement Mensuel

```
1er du mois à 00:00
    ↓
Vercel Cron déclenche /api/stripe/monthly-charge
    ↓
Pour chaque professeur actif :
    ├─ Compter élèves
    ├─ Calculer coût (5€ + 2€ par élève supp)
    ├─ Déduire du solde
    ├─ Mettre à jour dates
    └─ SI solde < 0 → Suspension
```

### 4. Alerte Solde Faible

```
Professeur se connecte
    ↓
SubscriptionManager charge les données
    ↓
SI solde < coût mensuel :
    → ⚠️ Affichage alerte orange
    → "Rechargez pour continuer"
```

### 5. Suspension pour Fonds Insuffisants

```
Prélèvement mensuel échoue
    ↓
Status → 'insufficient_funds'
    ↓
Professeur se connecte
    ↓
❌ Alerte rouge : "Abonnement suspendu"
    ↓
Ne peut plus ajouter d'élèves
    ↓
Doit recharger son compte
```

---

## 🎯 Tarification

### Calcul du Coût Mensuel

| Nombre d'élèves | Coût mensuel |
|-----------------|--------------|
| 0 élève | 5€ (minimum) |
| 1 élève | 5€ |
| 2 élèves | 7€ |
| 3 élèves | 9€ |
| 4 élèves | 11€ |
| 5 élèves | 13€ |
| N élèves | 5 + (N-1) × 2€ |

### Bonus de Parrainage

- **Parrain** : +5€ de crédit
- **Filleul** : Aucun bonus direct (mais aide son parrain !)
- **Conditions** : Filleul doit faire son 1er rechargement (min 20€)

---

## 🧪 Tests à Effectuer

### ✅ Tests Déjà Effectués

- [x] API monthly-charge fonctionne en local
- [x] Authentification Bearer token OK
- [x] Structure des fichiers complète

### ⏳ Tests à Faire (Après Déploiement)

- [ ] Cron visible dans Vercel Dashboard
- [ ] Test manuel du cron dans Vercel (bouton "Run")
- [ ] Vérification dans Supabase après exécution
- [ ] Test rechargement crédit avec Stripe test card
- [ ] Test système de parrainage (2 comptes)
- [ ] Test suspension automatique (mettre solde à 0)
- [ ] Test alertes dans l'interface SubscriptionManager

---

## 📝 Checklist de Déploiement

### Phase 1 : Configuration

- [x] Fichiers créés et testés localement
- [x] `CRON_SECRET` généré et ajouté à `.env.local`
- [x] Documentation complète rédigée
- [ ] **TODO : Ajouter `CRON_SECRET` dans Vercel**

### Phase 2 : Base de Données

- [ ] **TODO : Exécuter `database_credit_system.sql` dans Supabase**
- [ ] **TODO : Exécuter `database_referral_system.sql` dans Supabase**
- [ ] Vérifier que les colonnes sont bien créées

### Phase 3 : Déploiement

- [ ] **TODO : Commiter et pusher sur GitHub**
  ```bash
  git add .
  git commit -m "Add complete payment system with cron and referral"
  git push origin main
  ```
- [ ] Vérifier le déploiement dans Vercel
- [ ] Vérifier le cron dans l'onglet "Cron Jobs"

### Phase 4 : Tests Production

- [ ] Tester le cron manuellement dans Vercel
- [ ] Vérifier les logs (Functions → Logs)
- [ ] Créer un compte test et recharger 20€
- [ ] Vérifier dans Supabase que le crédit est ajouté
- [ ] (Optionnel) Tester le parrainage avec 2 comptes

### Phase 5 : Monitoring

- [ ] Ajouter les requêtes SQL de monitoring en favoris Supabase
- [ ] Configurer des alertes (optionnel)
- [ ] Documenter les procédures d'urgence

---

## 🚀 Commandes Rapides

```bash
# Démarrer le serveur local
npm run dev

# Tester le cron en local
./test-cron.sh local

# Tester le cron en production
./test-cron.sh production

# Déployer
git add .
git commit -m "Your message"
git push origin main

# Ou déployer directement
vercel --prod
```

---

## 📚 Où Trouver l'Info ?

| Question | Fichier à Consulter |
|----------|---------------------|
| Comment fonctionne le système de crédit ? | `CREDIT_SYSTEM.md` |
| Comment configurer le cron ? | `CRON_SETUP.md` |
| Comment déployer rapidement ? | `QUICK_START_CRON.md` |
| Quel est le flux d'exécution ? | `CRON_STRUCTURE.md` |
| Quelles sont les requêtes SQL ? | `CRON_SUMMARY.md` |
| Guide pas-à-pas complet ? | `DEPLOYMENT_CRON.md` |

---

## 🎉 Résultat Final

Une fois tout déployé, vous aurez :

✅ **Système de rechargement** : Profs peuvent recharger leur crédit (min 20€)
✅ **Déduction automatique** : Chaque 1er du mois, coût déduit automatiquement
✅ **Alertes intelligentes** : Prévient quand le solde est faible
✅ **Suspension automatique** : Si fonds insuffisants
✅ **Système de parrainage** : 5€ de bonus pour attirer de nouveaux profs
✅ **100% automatique** : Aucune intervention manuelle requise

---

## 🆘 Support & Troubleshooting

Voir `CRON_SETUP.md` section "En cas de problème" pour :
- Cron ne s'exécute pas
- Erreur 401 Unauthorized
- Erreur 500 Server Error
- Un professeur n'a pas été débité
- Webhook ne fonctionne pas
- Système de parrainage ne crédite pas

---

**📅 Dernière mise à jour** : 16 octobre 2025
**✨ Statut** : Prêt à déployer
**🔜 Prochaine étape** : Ajouter CRON_SECRET dans Vercel et déployer
