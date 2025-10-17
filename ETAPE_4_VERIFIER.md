# ✅ ÉTAPE 4 : Vérifier le Cron Job dans Vercel

## 🎯 Objectif
Vérifier que le cron job est bien configuré et le tester manuellement.

---

## 📝 Instructions Pas à Pas

### 1. Ouvrir Vercel Dashboard

1. Aller sur **https://vercel.com**
2. Cliquer sur votre projet `waiting_list`
3. Attendre que le déploiement soit terminé (statut "Ready" ✅)

---

### 2. Aller dans Cron Jobs

1. Dans le **menu de gauche**, chercher **"Cron Jobs"**
2. Cliquer dessus

---

### 3. Vérifier le Cron

Vous devriez voir un cron job configuré :

```
PATH: /api/stripe/monthly-charge
SCHEDULE: 0 0 1 * *
STATUS: ● Active
```

**Signification du schedule** : `0 0 1 * *`
- S'exécute le **1er de chaque mois**
- À **00:00** (minuit UTC)

---

### 4. Tester Manuellement

1. À côté du cron, cliquer sur le bouton **"Run"** ou **"..."** → **"Run Now"**
2. Attendre quelques secondes
3. Vous devriez voir un message de confirmation

---

### 5. Vérifier les Logs

**Option A : Depuis Cron Jobs**
1. Cliquer sur **"View Logs"** ou **"View Last Run"**

**Option B : Depuis Functions**
1. Dans le menu de gauche, cliquer sur **"Functions"**
2. Cliquer sur **"Logs"**
3. Filtrer par `/api/stripe/monthly-charge`

**Ce que vous devriez voir** :
```json
{
  "success": true,
  "processed": 1,
  "results": [
    {
      "user_id": "...",
      "status": "charged",
      "old_balance": 0,
      "new_balance": 0,
      "cost": 5
    }
  ]
}
```

---

### 6. Vérifier dans Supabase (Optionnel)

1. Retourner sur **https://supabase.com**
2. Votre projet → **SQL Editor**
3. Nouvelle requête :

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

4. **RUN**
5. Vérifier que `last_charge_date` a été mis à jour

---

## 🎉 FÉLICITATIONS ! TOUT EST CONFIGURÉ ! 🎉

Votre système de crédit avec prélèvement mensuel automatique est maintenant **100% opérationnel** ! 🚀

---

## 📊 Ce Qui Fonctionne Maintenant

### ✅ Système de Crédit
- Les professeurs peuvent recharger leur crédit (minimum 20€)
- Le solde est affiché dans leur compte
- Des alertes apparaissent si le solde est faible

### ✅ Prélèvement Automatique
- **Chaque 1er du mois à minuit**, le système :
  - Compte les élèves de chaque prof
  - Calcule le coût (5€ + 2€ par élève supplémentaire)
  - Déduit automatiquement du solde
  - Suspend le compte si fonds insuffisants
  - Envoie des alertes si nécessaire

### ✅ Système de Parrainage
- Chaque prof a un code de parrainage unique
- Quand un nouveau prof entre ce code et recharge 20€
- Le parrain reçoit automatiquement 5€ de bonus

### ✅ Sécurité
- API protégée par CRON_SECRET
- Webhooks Stripe sécurisés
- Codes de parrainage uniques

---

## 📅 Prochaine Exécution Automatique

**Date** : 1er novembre 2025 à 00:00 UTC 🕛

---

## 🧪 Tests Recommandés

### Test 1 : Rechargement de Crédit

1. Aller sur votre site → `/teacher/account`
2. Se connecter comme professeur
3. Entrer `20` dans le champ de rechargement
4. Cliquer sur "Recharger"
5. Utiliser la carte de test Stripe : `4242 4242 4242 4242`
   - Date : n'importe quelle date future
   - CVC : n'importe quels 3 chiffres
6. Vérifier que le solde est mis à jour

### Test 2 : Code de Parrainage

1. Se connecter comme professeur
2. Aller dans `/teacher/account`
3. Regarder la section "Parrainage"
4. Votre code unique devrait s'afficher (ex: "ABC12345")
5. Vous pouvez le copier avec le bouton "Copier"

### Test 3 : Alertes de Solde

1. Dans Supabase, mettre artificiellement un solde bas :
```sql
UPDATE subscriptions 
SET credit_balance = 3 
WHERE user_id = 'votre-user-id';
```
2. Rafraîchir `/teacher/account`
3. Une alerte orange devrait apparaître

---

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| `DEPLOIEMENT_GUIDE.md` | Guide complet toutes étapes |
| `QUICK_START_CRON.md` | Guide rapide 3 minutes |
| `CREDIT_SYSTEM.md` | Fonctionnement du système de crédit |
| `CRON_SETUP.md` | Configuration technique du cron |
| `SYSTEM_OVERVIEW.md` | Vue d'ensemble complète |

---

## 🆘 Support & Troubleshooting

### Le cron ne s'exécute pas automatiquement

1. Vérifier que `vercel.json` est bien dans le repo
2. Vérifier que `CRON_SECRET` est configuré
3. Attendre le 1er du mois prochain
4. Ou tester manuellement avec le bouton "Run"

### Erreur 401 dans les logs

→ Le `CRON_SECRET` ne correspond pas. Vérifier dans Vercel → Settings → Environment Variables

### Erreur 500 dans les logs

→ Problème dans le code ou la base de données. Vérifier les logs détaillés dans Vercel

### Un professeur n'a pas été débité

→ Vérifier dans Supabase si son `status` est `'active'`. S'il est `'suspended'` ou autre, il ne sera pas débité.

### Pas de crédit après paiement Stripe

→ Vérifier les logs du webhook dans Vercel → Functions → Logs → Filtrer par `/api/stripe/webhook`

---

## 💡 Prochaines Améliorations (Optionnel)

- [ ] Envoyer des emails d'alerte automatiques
- [ ] Dashboard admin pour voir tous les abonnements
- [ ] Historique des transactions visible par le prof
- [ ] Rechargement automatique quand solde < seuil
- [ ] Statistiques de revenus mensuels

---

## 🎊 Bravo ! 🎊

Vous avez mis en place un système complet de gestion d'abonnements avec :
- 💳 Paiements Stripe
- 💰 Système de crédit prépayé
- ⏰ Prélèvements automatiques
- 🎁 Programme de parrainage
- 🔐 Sécurité complète

**Votre plateforme est maintenant prête pour accueillir des professeurs** ! 🚀

---

**Temps total de déploiement** : ~15 minutes ⏱️
