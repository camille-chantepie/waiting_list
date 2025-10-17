# ✅ ÉTAPE 3 : Déployer le Code sur Vercel

## 🎯 Objectif
Envoyer tout le code sur GitHub pour que Vercel le déploie automatiquement.

---

## 📝 Instructions Pas à Pas

### 1. Ouvrir le Terminal

1. Ouvrir **Visual Studio Code**
2. Menu **Terminal** → **New Terminal** (ou `Ctrl+ù` sur Mac)
3. Vous devriez être dans le dossier `/Users/camillechantepie/waiting_list`

---

### 2. Vérifier que la Compilation Fonctionne

Taper cette commande et appuyer sur Entrée :

```bash
npm run build
```

**Attendre** que ça compile...

✅ **Si vous voyez** :
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages
```

→ Parfait ! Continuer à l'étape 3.

❌ **Si vous voyez des erreurs** :
→ Me les partager pour que je vous aide à les corriger.

---

### 3. Voir les Fichiers Modifiés

```bash
git status
```

Vous devriez voir une liste de fichiers en rouge/vert. C'est normal !

---

### 4. Ajouter Tous les Fichiers

```bash
git add .
```

(Le point `.` signifie "tous les fichiers")

---

### 5. Créer un Commit

```bash
git commit -m "Add credit system, referral system and monthly cron job"
```

Vous devriez voir un message confirmant que X fichiers ont été modifiés.

---

### 6. Envoyer sur GitHub

```bash
git push origin main
```

**Attendre** que le push se termine...

✅ **Si vous voyez** :
```
To github.com:camille-chantepie/waiting_list.git
   abc1234..def5678  main -> main
```

→ Parfait ! Le code est envoyé ! 🚀

---

### 7. Vercel Va Déployer Automatiquement

1. **Attendre 2-3 minutes**
2. Vous allez recevoir un **email de Vercel** confirmant le déploiement
3. Ou aller sur https://vercel.com → Votre projet → Vous verrez "Building..." puis "Ready"

---

## ✅ Étape 3 Terminée !

Votre code est déployé ! 🎉

**Prochaine étape** : Ouvrir le fichier `ETAPE_4_VERIFIER.md`

---

## 🆘 En cas de problème

### Erreur : "git: command not found"
→ Git n'est pas installé. Sur Mac : `brew install git`

### Erreur : "fatal: not a git repository"
→ Vous n'êtes pas dans le bon dossier. Faire : `cd /Users/camillechantepie/waiting_list`

### Erreur lors du push : "permission denied"
→ Vous devez configurer vos identifiants GitHub. Faire :
```bash
git config --global user.email "votre-email@example.com"
git config --global user.name "Votre Nom"
```

### Erreur : "Updates were rejected"
→ Faire d'abord :
```bash
git pull origin main
```
Puis réessayer le push.

### Le build échoue sur Vercel
→ Vérifier les logs dans Vercel Dashboard → Deployments → Cliquer sur le déploiement qui a échoué

---

**Temps estimé** : 5 minutes ⏱️
