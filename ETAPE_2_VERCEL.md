# ✅ ÉTAPE 2 : Configurer CRON_SECRET dans Vercel

## 🎯 Objectif
Ajouter la variable d'environnement `CRON_SECRET` dans Vercel pour sécuriser l'API de prélèvement mensuel.

---

## 📝 Instructions Pas à Pas

### 1. Ouvrir Vercel

1. Aller sur **https://vercel.com**
2. Se connecter avec votre compte
3. Vous devriez voir votre projet `waiting_list` (ou autre nom)
4. **Cliquer sur votre projet**

---

### 2. Aller dans les Settings

1. En haut de la page, cliquer sur l'onglet **"Settings"**
2. Dans le menu de gauche, cliquer sur **"Environment Variables"**

---

### 3. Ajouter la Variable CRON_SECRET

1. Cliquer sur le bouton **"Add New"** (ou "+ Add")

2. Remplir le formulaire :

   **Name (Nom)** :
   ```
   CRON_SECRET
   ```

   **Value (Valeur)** :
   ```
   QXVIvvzSksen39iqr2SXwfEyTXjyBDF+9xsK2HQhlWA=
   ```

3. **Sélectionner les environnements** (très important !) :
   - ✅ Cocher **Production**
   - ✅ Cocher **Preview**  
   - ✅ Cocher **Development**

4. Cliquer sur **"Save"**

---

### 4. Vérifier

Vous devriez maintenant voir dans la liste :

```
CRON_SECRET
● Production  ● Preview  ● Development
•••••••••••••••••••••••••••••••••••••••
```

(La valeur est masquée pour des raisons de sécurité, c'est normal !)

---

## ✅ Étape 2 Terminée !

Le secret est maintenant configuré dans Vercel ! 🎉

**Prochaine étape** : Ouvrir le fichier `ETAPE_3_DEPLOY.md`

---

## ℹ️ C'est Quoi ce Secret ?

Le `CRON_SECRET` est un mot de passe qui protège l'API de prélèvement mensuel. Sans ce secret, personne ne peut déclencher les prélèvements - c'est une mesure de sécurité importante !

---

## 🆘 En cas de problème

### Je ne trouve pas mon projet dans Vercel
→ Assurez-vous d'avoir bien déployé votre projet sur Vercel au moins une fois. Si ce n'est pas le cas, faites d'abord un `git push` puis connectez le repo à Vercel.

### Je ne vois pas "Environment Variables"
→ Vérifiez que vous êtes bien dans l'onglet "Settings" de votre projet (pas dans les settings du compte)

### J'ai fait une erreur dans la valeur
→ Pas de problème ! Cliquez sur les 3 points à côté de la variable → "Edit" → Corrigez la valeur → Save

---

**Temps estimé** : 2 minutes ⏱️
