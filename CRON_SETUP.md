# Configuration du Cron Job - Prélèvements Mensuels

Ce document explique comment configurer les prélèvements mensuels automatiques pour le système de crédit Akademos.

## 🎯 Objectif

Déduire automatiquement chaque mois le coût des abonnements du solde de crédit des professeurs.

- **Fréquence** : Le 1er de chaque mois
- **Calcul** : 5€ pour 1 élève + 2€ par élève supplémentaire
- **Action** : Déduction du crédit ou suspension si solde insuffisant

---

## 📋 Solutions Disponibles

### ✅ Solution 1 : Vercel Cron (Recommandée)

**Avantages** :
- ✨ Configuration simplissime
- 🔒 Sécurisé par défaut
- 📊 Logs intégrés dans le dashboard Vercel
- 💰 Gratuit dans le plan Hobby

**Fichier** : `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/stripe/monthly-charge",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

**Configuration requise** :

1. **Ajouter la variable d'environnement dans Vercel** :
   - Aller dans votre projet Vercel
   - Settings → Environment Variables
   - Ajouter : `CRON_SECRET` = `votre-secret-securise-ici`
   - ⚠️ **Important** : Utilisez un secret fort (généré aléatoirement)

2. **Déployer sur Vercel** :
   ```bash
   git add vercel.json
   git commit -m "Add Vercel Cron for monthly charges"
   git push
   ```

3. **Vérifier dans le dashboard** :
   - Une fois déployé, allez dans l'onglet "Cron Jobs"
   - Vous devriez voir votre cron configuré
   - Vous pouvez le tester manuellement avec le bouton "Run"

**Schedule expliqué** :
- `0 0 1 * *` = À minuit (0h00) le 1er jour de chaque mois
- Format : `minute heure jour-du-mois mois jour-de-la-semaine`

---

### 🔄 Solution 2 : GitHub Actions (Alternative)

**Avantages** :
- 🆓 Gratuit pour les repos publics et privés (2000 min/mois)
- 🔧 Fonctionne même sans Vercel
- 🚀 Peut être lancé manuellement pour tester

**Fichier** : `.github/workflows/monthly-charge.yml`

**Configuration requise** :

1. **Ajouter les secrets GitHub** :
   - Aller dans Settings → Secrets and variables → Actions
   - Ajouter deux secrets :
     - `CRON_SECRET` : Le même secret que dans Vercel/env.local
     - `APP_URL` : L'URL de votre application (ex: `https://akademos.vercel.app`)

2. **Activer GitHub Actions** :
   - Les workflows sont automatiquement activés sur push
   - Vérifier dans l'onglet "Actions" de votre repo

3. **Tester manuellement** :
   - Aller dans Actions → "Monthly Subscription Charge"
   - Cliquer sur "Run workflow"
   - Sélectionner la branche et lancer

**Schedule** :
- `0 2 1 * *` = À 2h00 du matin UTC le 1er de chaque mois
- Décalé de 2h pour éviter les pics de charge

---

## 🧪 Tests

### Test local (développement)

```bash
# Assurez-vous que votre serveur Next.js tourne
npm run dev

# Dans un autre terminal, appelez l'API manuellement
curl -X POST http://localhost:3000/api/stripe/monthly-charge \
  -H "Authorization: Bearer votre-cron-secret-local" \
  -H "Content-Type: application/json"
```

**Réponse attendue** :
```json
{
  "success": true,
  "processed": 3,
  "results": [
    {
      "user_id": "uuid-1",
      "status": "charged",
      "old_balance": 50,
      "new_balance": 43,
      "cost": 7,
      "alert": false
    },
    {
      "user_id": "uuid-2",
      "status": "insufficient_funds",
      "balance": 3,
      "cost": 9
    }
  ]
}
```

### Test en production

**Avec Vercel Cron** :
1. Aller dans le dashboard Vercel
2. Onglet "Cron Jobs"
3. Cliquer sur "Run" à côté de votre cron
4. Vérifier les logs

**Avec GitHub Actions** :
1. Aller dans Actions → "Monthly Subscription Charge"
2. Cliquer sur "Run workflow"
3. Sélectionner la branche `main`
4. Attendre l'exécution et vérifier les logs

---

## 🔐 Sécurité

### Générer un CRON_SECRET fort

```bash
# Sur macOS/Linux
openssl rand -base64 32

# Ou en Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Exemple** : `vK8rX2mQ9pL4nB7sT6hY1wE3uA5zR0cF9gD8jM4kN6vP2qS7tU3xW1yV5o`

### Où stocker le secret ?

| Environnement | Emplacement |
|--------------|-------------|
| **Local** | `.env.local` (ne pas commit !) |
| **Vercel** | Settings → Environment Variables |
| **GitHub Actions** | Settings → Secrets → Actions |

⚠️ **Ne jamais commiter le `.env.local` dans Git !**

---

## 📊 Monitoring

### Vérifier les derniers prélèvements

```sql
-- Dans Supabase SQL Editor
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  s.last_charge_date,
  s.quota_used as nb_eleves,
  s.status
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.last_charge_date IS NOT NULL
ORDER BY s.last_charge_date DESC
LIMIT 20;
```

### Alertes importantes

```sql
-- Professeurs avec moins d'1 mois de crédit
SELECT 
  t.email,
  s.credit_balance,
  s.monthly_cost,
  ROUND(s.credit_balance / NULLIF(s.monthly_cost, 0), 1) as mois_restants
FROM subscriptions s
JOIN teachers t ON t.id = s.user_id
WHERE s.status = 'active'
  AND s.credit_balance < s.monthly_cost * 1.5
ORDER BY mois_restants ASC;
```

---

## ❓ FAQ

### Le cron ne s'exécute pas, que faire ?

**Vercel Cron** :
1. Vérifier que `vercel.json` est bien à la racine du projet
2. Vérifier que le projet est déployé sur Vercel
3. Vérifier dans Cron Jobs que le schedule est correct
4. Essayer de lancer manuellement

**GitHub Actions** :
1. Vérifier que le fichier est dans `.github/workflows/`
2. Vérifier que les secrets `APP_URL` et `CRON_SECRET` sont configurés
3. Vérifier dans l'onglet Actions si le workflow est activé
4. Regarder les logs en cas d'erreur

### Puis-je changer l'heure du prélèvement ?

Oui ! Modifiez le schedule :

```
"0 0 1 * *"  → Minuit le 1er
"0 6 1 * *"  → 6h du matin le 1er
"0 14 1 * *" → 14h le 1er
```

### Que se passe-t-il si un professeur n'a pas assez de crédit ?

1. Son statut passe à `insufficient_funds`
2. Il reçoit une alerte dans l'interface
3. Il ne peut plus ajouter de nouveaux élèves
4. Ses élèves actuels peuvent toujours accéder (pas de suppression)
5. Dès qu'il recharge, le statut repasse à `active`

### Puis-je lancer le cron plusieurs fois par mois ?

Oui, mais ce n'est pas recommandé. Le système est conçu pour un prélèvement unique par mois.

Si vous voulez tester :
```
"0 0 1,15 * *"  → Le 1er et le 15 de chaque mois
```

### Comment annuler un prélèvement fait par erreur ?

```sql
-- Rembourser un prélèvement
UPDATE subscriptions 
SET 
  credit_balance = credit_balance + MONTANT_A_REMBOURSER,
  status = 'active'
WHERE user_id = 'uuid-du-prof';
```

---

## ✅ Checklist de mise en production

- [ ] `vercel.json` créé avec le bon schedule
- [ ] `.github/workflows/monthly-charge.yml` créé (backup)
- [ ] `CRON_SECRET` généré (secret fort de 32+ caractères)
- [ ] Secret ajouté dans Vercel Environment Variables
- [ ] Secrets `APP_URL` et `CRON_SECRET` ajoutés dans GitHub
- [ ] Code déployé sur Vercel
- [ ] Cron vérifié dans le dashboard Vercel
- [ ] Test manuel effectué avec succès
- [ ] Base de données Supabase avec les nouveaux champs
- [ ] Monitoring SQL queries sauvegardées

---

## 🆘 Support

En cas de problème :

1. **Vérifier les logs** :
   - Vercel : Dashboard → Functions → Logs
   - GitHub : Actions → Workflow run → Logs

2. **Tester manuellement** l'endpoint avec curl

3. **Vérifier la base de données** avec les requêtes SQL ci-dessus

4. **Vérifier les secrets** sont bien configurés

---

**📅 Dernière mise à jour** : 16 octobre 2025
**🔗 Documentation complète** : Voir `CREDIT_SYSTEM.md`
