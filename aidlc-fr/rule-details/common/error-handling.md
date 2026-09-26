# Procédures de gestion des erreurs et de récupération

## Principes généraux de gestion des erreurs

### En cas d'erreur
1. **Identifier l'erreur** : indiquer clairement ce qui s'est mal passé
2. **Évaluer l'impact** : déterminer si l'erreur est bloquante ou contournable
3. **Communiquer** : informer l'utilisateur de l'erreur et des options possibles
4. **Proposer des solutions** : fournir des étapes claires pour résoudre ou contourner l'erreur
5. **Documenter** : consigner l'erreur et sa résolution dans `audit.md`

### Niveaux de gravité des erreurs

**Critique** : le workflow ne peut pas continuer
- Fichiers ou artefacts requis manquants
- Saisie utilisateur invalide qui ne peut pas être traitée
- Erreurs système empêchant les opérations sur les fichiers

**Élevé** : la phase ne peut pas se terminer comme prévu
- Réponses incomplètes à des questions requises
- Réponses contradictoires de l'utilisateur
- Dépendances manquantes issues de phases précédentes

**Moyen** : la phase peut continuer avec des contournements
- Artefacts optionnels manquants
- Échecs de validation non critiques
- Achèvement partiel possible

**Faible** : problèmes mineurs qui ne bloquent pas la progression
- Incohérences de formatage
- Informations optionnelles manquantes
- Avertissements non bloquants

## Gestion des erreurs spécifiques à chaque phase

### Erreurs d'évaluation du contexte

**Erreur** : impossible de lire les fichiers de l'espace de travail
- **Cause** : problèmes de permissions, répertoires manquants
- **Solution** : demander à l'utilisateur de vérifier le chemin et les permissions de l'espace de travail
- **Contournement** : continuer avec uniquement les informations fournies par l'utilisateur

**Erreur** : le `aidlc-state.md` existant est corrompu
- **Cause** : édition manuelle, exécution précédente incomplète
- **Solution** : demander à l'utilisateur s'il souhaite repartir de zéro ou tenter une récupération
- **Récupération** : créer une sauvegarde, démarrer un nouveau fichier d'état

**Erreur** : impossible de déterminer les phases requises
- **Cause** : informations insuffisantes de la part de l'utilisateur
- **Solution** : poser des questions de clarification sur l'intention et la portée
- **Contournement** : utiliser par défaut un plan d'exécution complet

### Erreurs d'évaluation des exigences

**Erreur** : l'utilisateur fournit des exigences contradictoires
- **Cause** : compréhension floue, besoins changeants
- **Solution** : créer des questions de suivi pour résoudre les contradictions
- **Ne pas continuer** : tant que les contradictions ne sont pas résolues

**Erreur** : le document d'exigences ne peut pas être converti
- **Cause** : format non pris en charge, fichier corrompu
- **Solution** : demander à l'utilisateur de fournir les exigences dans un format pris en charge
- **Contournement** : travailler à partir de la description orale de l'utilisateur

**Erreur** : réponses incomplètes aux questions de vérification
- **Cause** : l'utilisateur a sauté des questions, ne sait pas quoi répondre
- **Solution** : mettre en évidence les questions sans réponse, fournir des exemples
- **Ne pas continuer** : tant que toutes les questions requises n'ont pas de réponse

### Erreurs de développement des récits

**Erreur** : impossible de faire correspondre les exigences aux récits
- **Cause** : exigences trop vagues, détails fonctionnels manquants
- **Solution** : retourner à l'Évaluation des exigences pour clarification
- **Contournement** : créer des récits à partir des informations disponibles, les marquer comme incomplets

**Erreur** : l'utilisateur fournit des réponses ambiguës pour la planification des récits
- **Cause** : options peu claires, décision complexe
- **Solution** : ajouter des questions de suivi avec des exemples concrets
- **Ne pas continuer** : tant que les ambiguïtés ne sont pas résolues

**Erreur** : le plan de génération des récits comporte des étapes non terminées
- **Cause** : exécution interrompue, étapes sautées
- **Solution** : reprendre à partir de la première étape non terminée
- **Récupération** : revoir les étapes terminées, continuer depuis le point de contrôle

### Erreurs de conception de l'application

**Erreur** : la décision architecturale est peu claire ou contradictoire
- **Cause** : réponses ambiguës, exigences conflictuelles
- **Solution** : ajouter des questions de suivi pour clarifier la décision
- **Ne pas continuer** : tant que la décision n'est pas claire et documentée

**Erreur** : impossible de déterminer le nombre de services/unités
- **Cause** : informations insuffisantes sur les limites
- **Solution** : poser des questions précises sur le déploiement, la structure de l'équipe, la mise à l'échelle
- **Contournement** : utiliser par défaut un monolithe, permettre un changement ultérieur

### Erreurs de conception

**Erreur** : les dépendances entre unités sont circulaires
- **Cause** : mauvaise définition des limites, couplage fort
- **Solution** : identifier les dépendances circulaires, suggérer une refactorisation
- **Récupération** : revoir les limites des unités pour rompre les cycles

**Erreur** : le plan de conception d'unité comporte des étapes manquantes
- **Cause** : génération de plan incomplète, erreur de modèle
- **Solution** : régénérer le plan avec toutes les étapes requises
- **Récupération** : ajouter les étapes manquantes au plan existant

**Erreur** : impossible de générer les artefacts de conception
- **Cause** : informations d'unité manquantes, exigences peu claires
- **Solution** : retourner à la Planification des unités pour clarifier la définition de l'unité
- **Contournement** : générer une conception partielle, marquer les lacunes

### Erreurs d'implémentation NFR

**Erreur** : les choix de pile technologique sont incompatibles
- **Cause** : exigences conflictuelles, limitations de plateforme
- **Solution** : mettre en évidence les incompatibilités, demander à l'utilisateur de choisir
- **Ne pas continuer** : tant que des choix compatibles n'ont pas été faits

**Erreur** : les contraintes organisationnelles ne peuvent pas être respectées
- **Cause** : restrictions réseau, politiques de sécurité
- **Solution** : documenter les contraintes, demander à l'utilisateur des contournements
- **Escalade** : peut nécessiter une intervention humaine pour la configuration

**Erreur** : une étape d'implémentation NFR nécessite une action humaine
- **Cause** : l'IA ne peut pas effectuer certaines tâches (configuration réseau, identifiants)
- **Solution** : marquer clairement comme **TÂCHE HUMAINE**, fournir des instructions
- **Attendre** : la confirmation de l'utilisateur avant de continuer

### Erreurs de planification du code

**Erreur** : le plan de génération de code est incomplet
- **Cause** : artefacts de conception manquants, exigences peu claires
- **Solution** : retourner à la phase de Conception pour compléter les artefacts
- **Récupération** : générer le plan avec les informations disponibles, marquer les lacunes

**Erreur** : les dépendances entre unités ne sont pas satisfaites
- **Cause** : unités dépendantes pas encore générées
- **Solution** : réordonner la séquence de génération pour respecter les dépendances
- **Contournement** : générer avec des dépendances factices, intégrer plus tard

### Erreurs de génération de code

**Erreur** : impossible de générer le code pour une étape
- **Cause** : informations de conception insuffisantes, exigences peu claires
- **Solution** : sauter l'étape, la documenter comme incomplète, continuer
- **Récupération** : revenir à l'étape après avoir recueilli plus d'informations

**Erreur** : le code généré contient des erreurs de syntaxe
- **Cause** : problèmes de modèle, problèmes spécifiques au langage
- **Solution** : corriger les erreurs de syntaxe, régénérer si nécessaire
- **Validation** : vérifier que le code compile avant de continuer

**Erreur** : la génération de tests échoue
- **Cause** : logique complexe, configuration du framework de test manquante
- **Solution** : générer une structure de test basique, marquer pour un achèvement manuel
- **Contournement** : continuer sans tests, les ajouter dans la phase Exploitation

### Erreurs d'exploitation

**Erreur** : impossible de déterminer l'outil de build
- **Cause** : structure de projet inhabituelle, systèmes de build multiples
- **Solution** : demander à l'utilisateur de préciser l'outil de build et les commandes
- **Contournement** : fournir des instructions génériques, l'utilisateur les adapte

**Erreur** : la cible de déploiement est peu claire
- **Cause** : environnements multiples, infrastructure complexe
- **Solution** : demander à l'utilisateur de préciser les cibles et méthodes de déploiement
- **Contournement** : fournir des instructions pour les plateformes courantes

## Procédures de récupération

### Achèvement partiel d'une phase

**Scénario** : la phase a été interrompue en cours d'exécution

**Étapes de récupération** :
1. Charger le fichier de plan de la phase
2. Identifier la dernière étape terminée (dernière case cochée [x])
3. Reprendre à partir de la prochaine étape non terminée
4. Vérifier que toutes les étapes précédentes sont réellement terminées
5. Continuer l'exécution normalement

### Fichier d'état corrompu

**Scénario** : `aidlc-state.md` est corrompu ou incohérent

**Étapes de récupération** :
1. Créer une sauvegarde : `aidlc-state.md.backup`
2. Demander à l'utilisateur à quelle phase il en est réellement
3. Régénérer le fichier d'état à partir de zéro
4. Marquer les phases terminées en fonction des artefacts existants
5. Reprendre à partir de la phase actuelle

### Artefacts manquants

**Scénario** : des artefacts requis d'une phase précédente sont manquants

**Étapes de récupération** :
1. Identifier quels artefacts sont manquants
2. Déterminer s'ils peuvent être régénérés
3. Si oui : retourner à cette phase, régénérer les artefacts
4. Si non : demander à l'utilisateur de fournir les informations manuellement
5. Documenter la lacune dans `audit.md`

### L'utilisateur souhaite redémarrer une phase

**Scénario** : l'utilisateur n'est pas satisfait des résultats d'une phase et souhaite la refaire

**Étapes de récupération** :
1. Confirmer que l'utilisateur souhaite redémarrer (les données seront perdues)
2. Archiver les artefacts existants : `{artefact}.backup`
3. Réinitialiser le statut de la phase dans `aidlc-state.md`
4. Effacer les cases à cocher de la phase dans les fichiers de plan
5. Réexécuter la phase depuis le début

### L'utilisateur souhaite ignorer une phase

**Scénario** : l'utilisateur souhaite ignorer une phase qui était planifiée

**Étapes de récupération** :
1. Confirmer que l'utilisateur comprend les implications
2. Documenter la raison de l'omission dans `audit.md`
3. Marquer la phase comme « IGNORÉE » dans `aidlc-state.md`
4. Passer à la phase suivante
5. Remarque : peut causer des problèmes dans les phases ultérieures si des dépendances sont manquantes

## Lignes directrices pour l'escalade

### Quand demander l'aide de l'utilisateur

**Immédiatement** :
- Saisie utilisateur contradictoire ou ambiguë
- Informations requises manquantes
- Contraintes techniques que l'IA ne peut pas résoudre
- Décisions nécessitant un jugement métier

**Après une tentative de résolution** :
- Erreurs répétées à la même étape
- Problèmes techniques complexes
- Structures de projet inhabituelles
- Intégration avec des systèmes externes

### Quand suggérer de repartir de zéro

**Envisager un nouveau départ si** :
- Plusieurs phases comportent des erreurs
- Le fichier d'état est gravement corrompu
- L'utilisateur ne peut pas fournir les informations manquantes
- Les artefacts sont incohérents entre les phases

## Erreurs de reprise de session

### Artefacts manquants lors de la reprise

**Erreur** : des artefacts requis provenant d'étapes précédentes sont manquants
- **Cause** : fichiers supprimés, déplacés, ou jamais créés
- **Solution** :
  1. Identifier quelle étape a créé les artefacts manquants
  2. Vérifier si l'étape était marquée comme terminée dans aidlc-state.md
  3. Si marquée terminée mais artefacts manquants : régénérer cette étape
  4. Si non marquée terminée : reprendre à partir de cette étape
- **Récupération** : retourner à l'étape qui crée les artefacts manquants et la réexécuter

**Erreur** : le fichier d'artefact existe mais est vide ou corrompu
- **Cause** : écriture interrompue, édition manuelle, problèmes de système de fichiers
- **Solution** :
  1. Créer une sauvegarde du fichier corrompu
  2. Tenter de le régénérer à partir de l'étape qui le crée
  3. Si impossible à régénérer : demander à l'utilisateur les informations pour le recréer
- **Récupération** : réexécuter l'étape qui crée l'artefact

### État incohérent lors de la reprise

**Erreur** : aidlc-state.md indique l'étape comme terminée mais les artefacts n'existent pas
- **Cause** : fichier d'état mis à jour mais génération d'artefact échouée
- **Solution** :
  1. Marquer l'étape comme incomplète dans aidlc-state.md
  2. Réexécuter l'étape pour générer les artefacts
  3. Vérifier que les artefacts existent avant de marquer comme terminée
- **Récupération** : réinitialiser le statut de l'étape et réexécuter

**Erreur** : les artefacts existent mais aidlc-state.md indique l'étape comme incomplète
- **Cause** : génération d'artefact réussie mais mise à jour de l'état échouée
- **Solution** :
  1. Vérifier que les artefacts sont complets et valides
  2. Mettre à jour aidlc-state.md pour marquer l'étape comme terminée
  3. Passer à l'étape suivante
- **Récupération** : mettre à jour le fichier d'état pour refléter l'achèvement réel

**Erreur** : plusieurs étapes marquées comme « en cours » dans aidlc-state.md
- **Cause** : corruption du fichier d'état, édition manuelle
- **Solution** :
  1. Examiner les artefacts pour déterminer la progression réelle
  2. Demander à l'utilisateur à quelle étape il en est réellement
  3. Corriger aidlc-state.md pour n'indiquer qu'une seule étape en cours
- **Récupération** : reconstruire le fichier d'état à partir des artefacts existants

### Erreurs de chargement du contexte

**Erreur** : impossible de charger le contexte requis des étapes précédentes
- **Cause** : fichiers manquants, contenu corrompu, chemins de fichiers incorrects
- **Solution** :
  1. Lister les artefacts nécessaires pour l'étape actuelle
  2. Vérifier lesquels sont manquants ou corrompus
  3. Régénérer les artefacts manquants ou demander les informations à l'utilisateur
- **Récupération** : terminer les étapes prérequises avant de reprendre l'étape actuelle

**Erreur** : les artefacts chargés contiennent des informations contradictoires
- **Cause** : édition manuelle, travail de plusieurs personnes, mises à jour incomplètes
- **Solution** :
  1. Identifier les contradictions et les présenter à l'utilisateur
  2. Demander à l'utilisateur quelle information est correcte
  3. Mettre à jour les artefacts pour résoudre les contradictions
- **Récupération** : réconcilier les contradictions avant de continuer

### Bonnes pratiques de reprise

1. **Toujours valider l'état** : vérifier que aidlc-state.md correspond aux artefacts réels
2. **Charger progressivement** : charger les artefacts étape par étape, en validant chacune
3. **Échouer rapidement** : arrêter immédiatement si des artefacts critiques sont manquants
4. **Communiquer clairement** : dire à l'utilisateur exactement ce qui manque et pourquoi c'est nécessaire
5. **Proposer des options** : régénérer, fournir manuellement, ou repartir de zéro
6. **Documenter la récupération** : consigner toutes les actions de récupération dans audit.md

Le fichier d'état est gravement corrompu
- Les exigences de l'utilisateur ont significativement changé
- Une décision architecturale doit être annulée

**Avant de repartir de zéro** :
1. Archiver tout le travail existant
2. Documenter les enseignements tirés
3. Identifier ce qu'il faut préserver
4. Obtenir la confirmation de l'utilisateur
5. Créer un nouveau plan d'exécution

## Exigences de journalisation

### Format de journalisation des erreurs

```markdown
## Erreur - [Nom de la phase]
**Horodatage** : [horodatage ISO]
**Type d'erreur** : [Critique/Élevé/Moyen/Faible]
**Description** : [ce qui s'est mal passé]
**Cause** : [pourquoi cela s'est produit]
**Résolution** : [comment cela a été résolu]
**Impact** : [effet sur le workflow]

---
```

### Format de journalisation de la récupération

```markdown
## Récupération - [Nom de la phase]
**Horodatage** : [horodatage ISO]
**Problème** : [ce qui nécessitait une récupération]
**Étapes de récupération** : [ce qui a été fait]
**Résultat** : [résultat de la récupération]
**Artefacts concernés** : [liste des fichiers]

---
```

## Bonnes pratiques de prévention

1. **Valider tôt** : vérifier les entrées et les dépendances avant de commencer le travail
2. **Points de contrôle fréquents** : mettre à jour les cases à cocher immédiatement après avoir terminé les étapes
3. **Communiquer clairement** : expliquer ce que vous faites et pourquoi
4. **Poser des questions** : ne pas supposer — clarifier les ambiguïtés immédiatement
5. **Tout documenter** : consigner toutes les décisions et changements dans `audit.md`
