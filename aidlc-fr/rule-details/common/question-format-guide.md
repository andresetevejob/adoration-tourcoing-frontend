# Guide de formatage des questions

## OBLIGATOIRE : Toutes les questions doivent utiliser ce format

### Règle : ne jamais poser de questions dans le chat
**CRITIQUE** : vous ne devez JAMAIS poser de questions directement dans le chat. TOUTES les questions doivent être placées dans des fichiers de questions dédiés.

### Format du fichier de questions

#### Convention de nommage des fichiers
- Utiliser des noms descriptifs : `{phase-name}-questions.md`
- Exemples :
  - `classification-questions.md`
  - `requirements-questions.md`
  - `story-planning-questions.md`
  - `design-questions.md`

#### Structure d'une question
Chaque question doit inclure des options pertinentes, plus « Autre » comme dernière option :

```markdown
## Question [Numéro]
[Texte de question clair et précis]

A) [Première option pertinente]
B) [Deuxième option pertinente]
[...options supplémentaires si nécessaire...]
X) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : 
```

**CRITIQUE** :
- « Autre » est OBLIGATOIRE comme DERNIÈRE option pour chaque question
- N'inclure que des options pertinentes — ne pas inventer d'options pour remplir des cases
- Utiliser autant d'options que nécessaire, ni plus ni moins (minimum 2 + Autre)

### Exemple complet

```markdown
# Questions de clarification des exigences

Veuillez répondre aux questions suivantes pour aider à clarifier les exigences.

## Question 1
Quelle est la méthode d'authentification principale des utilisateurs ?

A) Nom d'utilisateur et mot de passe
B) Connexion via réseau social (Google, Facebook)
C) Authentification unique (SSO)
D) Authentification multifacteur
E) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : 

## Question 2
S'agira-t-il d'une application web ou mobile ?

A) Application web
B) Application mobile
C) Web et mobile
D) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : 

## Question 3
S'agit-il d'un nouveau projet ou d'un code existant ?

A) Nouveau projet (greenfield)
B) Code existant (brownfield)
C) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : 
```

### Format de réponse de l'utilisateur
Les utilisateurs répondront en renseignant la lettre de leur choix après la balise [Réponse] : 

```markdown
## Question 1
Quelle est la méthode d'authentification principale des utilisateurs ?

A) Nom d'utilisateur et mot de passe
B) Connexion via réseau social (Google, Facebook)
C) Authentification unique (SSO)
D) Authentification multifacteur

[Réponse] : C
```

### Lecture des réponses de l'utilisateur
Après que l'utilisateur confirme avoir terminé :
1. Lire le fichier de questions
2. Extraire les réponses après les balises [Réponse] :
3. Valider que toutes les questions ont une réponse
4. Poursuivre l'analyse sur la base des réponses

### Lignes directrices pour les choix multiples

#### Nombre d'options
- Minimum : 2 options pertinentes + « Autre » (A, B, C)
- Typique : 3 à 4 options pertinentes + « Autre » (A, B, C, D, E)
- Maximum : 5 options pertinentes + « Autre » (A, B, C, D, E, F)
- **CRITIQUE** : ne pas inventer d'options juste pour remplir des cases — n'inclure que des choix pertinents

#### Qualité des options
- Rendre les options mutuellement exclusives
- Couvrir les scénarios les plus courants
- N'inclure que des options pertinentes et réalistes
- **TOUJOURS inclure « Autre » comme DERNIÈRE option** (OBLIGATOIRE)
- Être précis et clair
- **Ne pas inventer d'options pour remplir les cases A, B, C, D**

#### Bon exemple :
```markdown
## Question 5
Quelle technologie de base de données sera utilisée ?

A) Relationnelle (PostgreSQL, MySQL)
B) NoSQL Document (MongoDB, DynamoDB)
C) NoSQL Clé-Valeur (Redis, Memcached)
D) Base de données en graphe (Neo4j, Neptune)
E) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : 
```

#### Mauvais exemple (à éviter) :
```markdown
## Question 5
Quelle base de données allez-vous utiliser ?

A) Oui
B) Non
C) Peut-être

[Réponse] : 
```

### Intégration au workflow

#### Étape 1 : créer le fichier de questions
```markdown
Créer aidlc-docs/{phase-name}-questions.md avec toutes les questions
```

#### Étape 2 : informer l'utilisateur
```
« J'ai créé {phase-name}-questions.md avec [X] questions. 
Veuillez répondre à chaque question en renseignant la lettre de votre choix après la balise [Réponse] :. 
Si aucune des options ne correspond à vos besoins, choisissez la dernière option (Autre) et décrivez votre préférence. Prévenez-moi quand vous avez terminé. »
```

#### Étape 3 : attendre la confirmation
Attendre que l'utilisateur dise « terminé », « fini », « c'est fait » ou une formule similaire.

#### Étape 4 : lire et analyser
```
Lire aidlc-docs/{phase-name}-questions.md
Extraire toutes les réponses
Valider l'exhaustivité
Poursuivre l'analyse
```

### Gestion des erreurs

#### Réponses manquantes
Si une balise [Réponse] : est vide :
```
« J'ai remarqué que la Question [X] est sans réponse. Veuillez fournir une réponse en utilisant l'une des lettres proposées 
pour toutes les questions avant de continuer. »
```

#### Réponses invalides
Si la réponse n'est pas une lettre valide :
```
« La Question [X] a une réponse invalide '[réponse]'. 
Veuillez utiliser uniquement les lettres proposées dans la question. »
```

#### Réponses ambiguës
Si l'utilisateur fournit une explication au lieu d'une lettre :
```
« Pour la Question [X], veuillez indiquer la lettre correspondant le mieux à votre réponse. 
Si aucune ne correspond, choisissez 'Autre' et ajoutez votre description après la balise [Réponse] :. »
```

### Détection des contradictions et des ambiguïtés

**OBLIGATOIRE** : après avoir lu les réponses de l'utilisateur, vous DEVEZ vérifier les contradictions et les ambiguïtés.

#### Détection des contradictions
Rechercher les réponses logiquement incohérentes :
- Incohérence de portée : « Correction de bug » mais « Ensemble du code affecté »
- Incohérence de risque : « Risque faible » mais « Changements incompatibles »
- Incohérence de délai : « Correction rapide » mais « Plusieurs sous-systèmes »
- Incohérence d'impact : « Composant unique » mais « Changements architecturaux significatifs »

#### Détection des ambiguïtés
Rechercher les réponses peu claires ou limites :
- Réponses pouvant correspondre à plusieurs classifications
- Réponses manquant de précision
- Indicateurs contradictoires entre plusieurs questions

#### Création de questions de clarification
Si des contradictions ou des ambiguïtés sont détectées :

1. **Créer un fichier de clarification** : `{phase-name}-clarification-questions.md`
2. **Expliquer le problème** : indiquer clairement quelle contradiction/ambiguïté a été détectée
3. **Poser des questions ciblées** : utiliser le format à choix multiples pour résoudre le problème
4. **Référencer les questions d'origine** : montrer quelles questions ont des réponses contradictoires

**Exemple** :
```markdown
# Questions de clarification - [Nom de la phase]

J'ai détecté des contradictions dans vos réponses qui nécessitent une clarification :

## Contradiction 1 : [Brève description]
Vous avez indiqué « [Réponse A] » (Q[X]:[Lettre]) mais aussi « [Réponse B] » (Q[Y]:[Lettre]).
Ces réponses sont contradictoires car [explication].

### Question de clarification 1
[Question précise pour résoudre la contradiction]

A) [Option qui penche vers la première réponse]
B) [Option qui penche vers la seconde réponse]
C) [Option offrant un compromis]
D) [Option qui reformule la question]

[Réponse] : 

## Ambiguïté 1 : [Brève description]
Votre réponse à la Q[X] (« [Réponse] ») est ambiguë car [explication].

### Question de clarification 2
[Question précise pour clarifier l'ambiguïté]

A) [Option claire 1]
B) [Option claire 2]
C) [Option claire 3]
D) [Option claire 4]

[Réponse] : 
```

#### Workflow pour les clarifications

1. **Détecter** : analyser toutes les réponses à la recherche de contradictions/ambiguïtés
2. **Créer** : générer un fichier de questions de clarification si des problèmes sont détectés
3. **Informer** : signaler les problèmes et le fichier de clarification à l'utilisateur
4. **Attendre** : ne pas continuer tant que l'utilisateur n'a pas fourni de clarifications
5. **Revalider** : après les clarifications, vérifier à nouveau la cohérence
6. **Continuer** : n'avancer que lorsque toutes les contradictions sont résolues

#### Exemple de message à l'utilisateur
```
« J'ai détecté 2 contradictions dans vos réponses :

1. Portée de correction de bug vs. impact sur le code (Q1 vs Q2)
2. Risque faible vs. changements incompatibles (Q7 vs Q4)

J'ai créé classification-clarification-questions.md avec 2 questions pour résoudre cela.
Merci de répondre à ces questions de clarification avant que je puisse continuer la classification. »
```

### Bonnes pratiques

1. **Être précis** : les questions doivent être claires et sans ambiguïté
2. **Être complet** : couvrir toutes les informations nécessaires
3. **Être concis** : garder les questions centrées sur un seul sujet
4. **Être pratique** : les options doivent être réalistes et exploitables
5. **Être cohérent** : utiliser le même format dans tous les fichiers de questions

### Exemples spécifiques à une phase

#### Exemple avec 2 options pertinentes :
```markdown
## Question 1
S'agit-il d'un nouveau projet ou d'un code existant ?

A) Nouveau projet (greenfield)
B) Code existant (brownfield)
C) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : 
```

#### Exemple avec 3 options pertinentes :
```markdown
## Question 2
Quelle est la cible de déploiement ?

A) Cloud (AWS, Azure, GCP)
B) Serveurs sur site
C) Hybride (cloud et sur site)
D) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : 
```

#### Exemple avec 4 options pertinentes :
```markdown
## Question 3
Quel pattern architectural doit être utilisé ?

A) Architecture monolithique
B) Architecture microservices
C) Architecture serverless
D) Architecture événementielle
E) Autre (veuillez préciser après la balise [Réponse] : ci-dessous)

[Réponse] : 
```

## Résumé

**À retenir** :
- ✅ Toujours créer des fichiers de questions
- ✅ Toujours utiliser le format à choix multiples
- ✅ **Toujours inclure « Autre » comme DERNIÈRE option (OBLIGATOIRE)**
- ✅ N'inclure que des options pertinentes — ne pas inventer d'options pour remplir des cases
- ✅ Toujours utiliser les balises [Réponse] :
- ✅ Toujours attendre que l'utilisateur ait terminé
- ✅ Toujours valider les réponses à la recherche de contradictions
- ✅ Toujours créer des fichiers de clarification si nécessaire
- ✅ Toujours résoudre les contradictions avant de continuer
- ❌ Ne jamais poser de questions dans le chat
- ❌ Ne jamais inventer d'options juste pour avoir A, B, C, D
- ❌ Ne jamais continuer sans réponses
- ❌ Ne jamais continuer avec des contradictions non résolues
- ❌ Ne jamais faire de suppositions sur des réponses ambiguës
