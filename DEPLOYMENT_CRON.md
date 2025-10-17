# 🚀 Guide de Déploiement - Cron Job Prélèvements Mensuels

## ✅ Ce qui a été fait

- ✅ Fichier `vercel.json` créé avec la configuration Vercel Cron
- ✅ Workflow GitHub Actions créé (`.github/workflows/monthly-charge.yml`)
- ✅ API `/api/stripe/monthly-charge` mise à jour pour accepter l'authentification
- ✅ Secret `CRON_SECRET` généré et ajouté à `.env.local`
- ✅ Tests locaux réussis ✨

---

## 📋 Prochaines étapes de déploiement

### 1️⃣ Ajouter le CRON_SECRET dans Vercel

1. **Se connecter à Vercel** : https://vercel.com
2. **Sélectionner votre projet** : `waiting_list` (ou le nom de votre projet)
3. **Aller dans Settings** → **Environment Variables**
4. **Ajouter une nouvelle variable** :
   - **Name** : `CRON_SECRET`
   - **Value** : `QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=`
   - **Environment** : Cocher `Production`, `Preview`, et `Development`
5. **Cliquer sur Save**

⚠️ **Important** : Gardez ce secret confidentiel, ne le partagez pas !

---

### 2️⃣ Déployer sur Vercel

```bash
# 1. Commiter tous les changements
git add .
git commit -m "Add Vercel Cron for monthly subscription charges"

# 2. Pousser sur GitHub (Vercel déploiera automatiquement)
git push origin main
```

**Ou déployer manuellement** :
```bash
vercel --prod
```

---

### 3️⃣ Vérifier le Cron dans Vercel

1. **Aller dans votre projet Vercel**
2. **Cliquer sur l'onglet "Cron Jobs"** (dans le menu latéral)
3. **Vous devriez voir** :
   - **Path** : `/api/stripe/monthly-charge`
   - **Schedule** : `0 0 1 * *` (le 1er de chaque mois à minuit)
   - **Status** : Active

4. **Tester manuellement** :
   - Cliquer sur le bouton **"Run"** à côté du cron
   - Vérifier les logs pour confirmer l'exécution

---

### 4️⃣ (Optionnel) Configurer GitHub Actions

Si vous voulez une solution de backup ou si vous n'utilisez pas Vercel :

1. **Aller dans votre dépôt GitHub**
2. **Settings** → **Secrets and variables** → **Actions**
3. **Ajouter deux secrets** :
   - `CRON_SECRET` : `QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=`
   - `APP_URL` : `https://votre-domaine.vercel.app` (remplacer par votre URL)

4. **Le workflow s'activera automatiquement** après le push

5. **Tester** :
   - Aller dans **Actions** → **Monthly Subscription Charge**
   - Cliquer sur **Run workflow**
   - Vérifier les logs

---

## 🧪 Tests en Production

### Test 1 : Vérification du Cron dans Vercel

1. Aller dans Vercel → Cron Jobs
2. Cliquer sur **"Run"** pour déclencher manuellement
3. Vérifier les logs dans **Functions** → **Logs**

**Réponse attendue** :
```json
{
  "success": true,
  "processed": N,
  "results": [...]
}
```

---

### Test 2 : Vérification dans Supabase

Après avoir lancé le cron, vérifier dans Supabase :

```sql
-- Voir les derniers prélèvements
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  s.last_charge_date,
  s.quota_used,
  s.status
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.last_charge_date IS NOT NULL
ORDER BY s.last_charge_date DESC
LIMIT 10;
```

**Vérifications** :
- ✅ `last_charge_date` est mis à jour
- ✅ `credit_balance` a diminué de `monthly_cost`
- ✅ Si solde insuffisant → `status = 'insufficient_funds'`

---

## 🎯 Schedule du Cron

Le cron est configuré pour s'exécuter **le 1er de chaque mois à minuit** :

```
"0 0 1 * *"
 │ │ │ │ │
 │ │ │ │ └─ Jour de la semaine (0-6) = * (tous)
 │ │ │ └─── Mois (1-12) = * (tous)
 │ │ └───── Jour du mois (1-31) = 1 (le premier)
 │ └─────── Heure (0-23) = 0 (minuit)
 └───────── Minute (0-59) = 0
```

**Exemples de modification** :
- `0 6 1 * *` → Le 1er à 6h du matin
- `0 0 1,15 * *` → Le 1er et le 15 de chaque mois à minuit
- `0 0 * * *` → Tous les jours à minuit (⚠️ pas recommandé)

---

## 📊 Monitoring Post-Déploiement

### Vérifications mensuelles à faire

Après chaque exécution du cron (début de mois) :

1. **Vérifier les logs Vercel**
   - Fonctions → Logs → Filtrer par `/api/stripe/monthly-charge`
   - S'assurer qu'il n'y a pas d'erreurs

2. **Vérifier dans Supabase**
   ```sql
   -- Compter les prélèvements du mois
   SELECT COUNT(*) 
   FROM subscriptions 
   WHERE DATE_TRUNC('month', last_charge_date) = DATE_TRUNC('month', CURRENT_DATE);
   ```

3. **Vérifier les comptes en alerte**
   ```sql
   -- Professeurs avec solde faible
   SELECT t.email, s.credit_balance, s.monthly_cost
   FROM subscriptions s
   JOIN teachers t ON t.id = s.user_id
   WHERE s.low_balance_alerted = true;
   ```

4. **Vérifier les suspensions**
   ```sql
   -- Comptes suspendus pour fonds insuffisants
   SELECT t.email, s.credit_balance, s.monthly_cost
   FROM subscriptions s
   JOIN teachers t ON t.id = s.user_id
   WHERE s.status = 'insufficient_funds';
   ```

---

## 🆘 En cas de problème

### Le cron ne s'exécute pas

**Vérifications** :
1. ✅ `vercel.json` est à la racine du projet
2. ✅ Le projet est bien déployé sur Vercel
3. ✅ La variable `CRON_SECRET` est configurée dans Vercel
4. ✅ Le cron apparaît dans l'onglet "Cron Jobs"

**Solution** :
- Redéployer le projet : `git push` ou `vercel --prod`
- Vérifier les logs Vercel pour voir les erreurs

---

### Erreur 401 Unauthorized

**Cause** : Le `CRON_SECRET` ne correspond pas

**Solution** :
1. Vérifier que `CRON_SECRET` est bien configuré dans Vercel
2. Vérifier qu'il correspond à celui dans `.env.local`
3. Redéployer après modification

---

### Erreur 500 Server Error

**Cause** : Problème dans l'API ou la base de données

**Solution** :
1. Vérifier les logs détaillés dans Vercel
2. Tester l'endpoint manuellement avec curl :
   ```bash
   curl -X POST https://votre-app.vercel.app/api/stripe/monthly-charge \
     -H "Authorization: Bearer QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA="
   ```
3. Vérifier que la table `subscriptions` a bien les nouveaux champs

---

### Un professeur n'a pas été débité

**Vérifications** :
```sql
SELECT * FROM subscriptions WHERE user_id = 'uuid-du-prof';
```

**Vérifier** :
- `status` = 'active' ? (sinon il n'est pas débité)
- `last_charge_date` est mis à jour ?
- `credit_balance` a diminué ?

**Solution manuelle** :
```sql
UPDATE subscriptions 
SET 
  credit_balance = credit_balance - monthly_cost,
  last_charge_date = NOW(),
  next_charge_date = NOW() + INTERVAL '1 month'
WHERE user_id = 'uuid-du-prof';
```

---

## 📝 Checklist Finale

Avant de marquer comme terminé :

- [ ] ✅ `CRON_SECRET` ajouté dans Vercel Environment Variables
- [ ] ✅ Code déployé sur Vercel (`git push`)
- [ ] ✅ Cron visible dans l'onglet "Cron Jobs" de Vercel
- [ ] ✅ Test manuel réussi (bouton "Run" dans Vercel)
- [ ] ✅ Vérification dans Supabase que les données sont mises à jour
- [ ] ✅ (Optionnel) Secrets GitHub configurés pour GitHub Actions
- [ ] ✅ Documentation lue et comprise (CRON_SETUP.md)

---

## 🎉 C'est tout !

Une fois ces étapes terminées, votre système de prélèvement mensuel sera **100% automatique** ! 

Le cron s'exécutera le 1er de chaque mois pour :
- ✅ Calculer le coût pour chaque professeur
- ✅ Déduire du solde de crédit
- ✅ Alerter si solde insuffisant
- ✅ Suspendre si nécessaire

**Prochaine exécution** : Le 1er novembre 2025 à minuit 🕛

---

**Questions ?** Consultez `CRON_SETUP.md` pour plus de détails !
