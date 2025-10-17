# 🚀 Guide Rapide - Déploiement Cron Job

## ⏱️ 3 minutes pour déployer

### 📦 Ce qui est déjà fait

✅ Configuration Vercel Cron (`vercel.json`)
✅ Configuration GitHub Actions (`.github/workflows/`)
✅ Secret CRON_SECRET généré
✅ API de prélèvement testée et fonctionnelle
✅ Documentation complète créée

---

## 🎯 Ce qu'il reste à faire

### Étape 1 : Ajouter le secret dans Vercel (2 min)

1. Ouvrir https://vercel.com
2. Sélectionner votre projet
3. **Settings** → **Environment Variables**
4. Cliquer sur **Add New**

   ```
   Name:  CRON_SECRET
   Value: QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=
   
   ✅ Production
   ✅ Preview
   ✅ Development
   ```

5. Cliquer sur **Save**

---

### Étape 2 : Déployer (1 min)

```bash
git add .
git commit -m "Configure monthly cron job for subscription charges"
git push origin main
```

Vercel déploiera automatiquement votre projet.

---

### Étape 3 : Vérifier (1 min)

1. Retourner sur Vercel Dashboard
2. Cliquer sur **Cron Jobs** (menu de gauche)
3. Vous devriez voir :

   ```
   PATH: /api/stripe/monthly-charge
   SCHEDULE: 0 0 1 * *
   STATUS: ● Active
   LAST RUN: -
   ```

4. Cliquer sur **Run** pour tester
5. Vérifier les logs : **Functions** → **Logs**

---

## ✅ C'est fait !

Votre cron job est maintenant configuré et s'exécutera automatiquement **le 1er de chaque mois à minuit**.

---

## 🧪 Tester maintenant

### En local

```bash
# Démarrer Next.js si pas déjà fait
npm run dev

# Dans un autre terminal
./test-cron.sh local
```

### En production

```bash
./test-cron.sh production
# Entrer l'URL : https://votre-app.vercel.app
```

---

## 📊 Vérifier dans Supabase

Après le test, vérifier dans Supabase SQL Editor :

```sql
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  s.last_charge_date,
  s.status
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
ORDER BY s.last_charge_date DESC
LIMIT 10;
```

**Vous devriez voir** :
- ✅ `last_charge_date` mis à jour
- ✅ `credit_balance` diminué de `monthly_cost`
- ✅ `status` = 'active' ou 'insufficient_funds'

---

## 🆘 Problèmes ?

### Le cron n'apparaît pas dans Vercel

**Solution** : Vérifier que `vercel.json` est à la racine et redéployer

### Erreur 401 Unauthorized

**Solution** : Vérifier que `CRON_SECRET` est bien configuré dans Vercel

### Erreur 500

**Solution** : Vérifier les logs dans Vercel → Functions → Logs

---

## 📚 Documentation Complète

| Fichier | Usage |
|---------|-------|
| **DEPLOYMENT_CRON.md** | 📖 Guide détaillé de déploiement |
| **CRON_SETUP.md** | 🔧 Configuration complète avec FAQ |
| **CRON_STRUCTURE.md** | 🗂️ Structure et flux d'exécution |
| **CRON_SUMMARY.md** | 📋 Résumé avec exemples SQL |

---

## 🎉 Prochaine exécution

**Date** : 1er novembre 2025 à 00:00 UTC

D'ici là, vous pouvez tester autant de fois que vous voulez ! 🚀

---

**Besoin d'aide ?** Consultez `DEPLOYMENT_CRON.md` pour le guide complet.
