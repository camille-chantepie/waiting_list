# Guide de débogage - Connexion élève-professeur

## Problème : La connexion ne fonctionne plus avec le code

### Étape 1 : Vérifier que la migration SQL a été exécutée

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez le fichier `database_migration.sql`
3. Vérifiez qu'il n'y a pas d'erreurs

### Étape 2 : Vérifier l'état de la base de données

1. Ouvrez votre navigateur et allez sur : `http://localhost:3004/api/diagnostic`
2. Cela vous montrera l'état de toutes les tables

### Étape 3 : Vérifier qu'un professeur a un code d'invitation

Dans Supabase SQL Editor, exécutez :

```sql
-- Voir tous les professeurs et leurs codes
SELECT id, nom, prenom, email, code_invitation 
FROM teachers;

-- Si des professeurs n'ont pas de code, générez-en un :
UPDATE teachers 
SET code_invitation = upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8))
WHERE code_invitation IS NULL OR code_invitation = '';
```

### Étape 4 : Tester la connexion

1. Récupérez le `code_invitation` d'un professeur depuis la base de données
2. Créez un compte élève (ou connectez-vous)
3. Allez sur "Ajouter un professeur"
4. Entrez le code d'invitation du professeur
5. Vérifiez que la connexion fonctionne

### Étape 5 : Déboguer l'API

Si ça ne fonctionne toujours pas, ouvrez la console du navigateur (F12) et :

1. Allez dans l'onglet "Network"
2. Essayez de vous connecter
3. Cherchez la requête vers `/api/relations/connect`
4. Cliquez dessus et regardez :
   - La requête (Request)
   - La réponse (Response)
   - Le code de statut

### Erreurs courantes

**Erreur 404 "Teacher not found"**
- Le code d'invitation n'existe pas dans la base
- Solution : Vérifiez que le professeur a bien un code_invitation

**Erreur 400 "Already connected"**
- Vous êtes déjà connecté à ce professeur
- Solution : Allez dans "Mes professeurs" pour voir la liste

**Erreur 500**
- Problème de base de données
- Solution : Vérifiez que la migration SQL a bien été exécutée

### Vérifications de sécurité

Dans Supabase Dashboard → Authentication → Policies :

1. Vérifiez que les policies RLS sont bien actives
2. Pour la table `teachers`, il doit y avoir une policy "Anyone can view teacher codes for joining"

### Commandes SQL utiles

```sql
-- Voir toutes les relations actives
SELECT 
  r.id,
  r.status,
  t.nom as teacher_nom,
  t.prenom as teacher_prenom,
  s.nom as student_nom,
  s.prenom as student_prenom
FROM teacher_student_relations r
JOIN teachers t ON r.teacher_id = t.id
JOIN students s ON r.student_id = s.id
WHERE r.status = 'active';

-- Supprimer une relation (pour retester)
DELETE FROM teacher_student_relations 
WHERE student_id = 'votre-student-id' 
AND teacher_id = 'votre-teacher-id';

-- Générer un code pour un professeur spécifique
UPDATE teachers 
SET code_invitation = 'TEST1234'
WHERE email = 'email-du-professeur@example.com';
```

### Test manuel de l'API

Vous pouvez tester l'API directement avec curl :

```bash
curl -X POST http://localhost:3004/api/relations/connect \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "votre-uuid-etudiant",
    "teacher_code": "CODE1234"
  }'
```

### Besoin d'aide ?

Si le problème persiste après ces vérifications, envoyez-moi :
1. Le résultat de `http://localhost:3004/api/diagnostic`
2. Le résultat de la requête SQL `SELECT * FROM teachers LIMIT 1;`
3. Les erreurs dans la console du navigateur
