# Conception fonctionnelle

## Objectif
**Conception détaillée de la logique métier par unité**

La Conception fonctionnelle se concentre sur :
- La logique métier détaillée et les algorithmes de l'unité
- Les modèles de domaine avec entités et relations
- Les règles métier détaillées, la logique de validation et les contraintes
- Une conception indépendante de la technologie (sans préoccupations d'infrastructure)

**Remarque** : Cela s'appuie sur la conception de composants de haut niveau issue de la Conception de l'application (phase INCEPTION)

## Prérequis
- La Génération des unités doit être terminée
- Les artefacts d'unité de travail doivent être disponibles
- La Conception de l'application est recommandée (fournit la structure de composants de haut niveau)
- Le plan d'exécution doit indiquer que l'étape Conception fonctionnelle doit s'exécuter

## Vue d'ensemble
Concevoir la logique métier détaillée de l'unité, indépendante de la technologie et uniquement centrée sur les fonctions métier.

## Étapes à exécuter

### Étape 1 : Analyser le contexte de l'unité
- Lire la définition de l'unité depuis `aidlc-docs/inception/application-design/unit-of-work.md`
- Lire les récits assignés depuis `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
- Comprendre les responsabilités et les limites de l'unité

### Étape 2 : Créer le plan de conception fonctionnelle
- Générer un plan avec des cases à cocher [] pour la conception fonctionnelle
- Se concentrer sur la logique métier, les modèles de domaine, les règles métier
- Chaque étape doit avoir une case à cocher []

### Étape 3 : Générer des questions adaptées au contexte
**DIRECTIVE** : Analyser en profondeur la définition de l'unité et les artefacts de conception fonctionnelle pour identifier TOUS les domaines où une clarification améliorerait la conception fonctionnelle. Être proactif dans la formulation de questions pour garantir une compréhension complète.

**CRITIQUE** : Par défaut, poser des questions dès qu'il existe UNE ambiguïté ou un détail manquant pouvant affecter la qualité de la conception fonctionnelle. Il vaut mieux poser trop de questions que de faire des suppositions incorrectes.

- INTÉGRER les questions au format de balise [Réponse] :
- Se concentrer sur TOUTE ambiguïté, information manquante ou domaine nécessitant une clarification
- Générer des questions partout où la contribution de l'utilisateur améliorerait les décisions de conception fonctionnelle
- **En cas de doute, poser la question** - la surconfiance mène à des conceptions médiocres

**Catégories de questions à considérer** (évaluer TOUTES les catégories) :
- **Modélisation de la logique métier** - Interroger sur les entités centrales, les workflows, les transformations de données et les processus métier
- **Modèle de domaine** - Interroger sur les concepts de domaine, les relations entre entités, les structures de données et les objets métier
- **Règles métier** - Interroger sur les règles de décision, la logique de validation, les contraintes et les politiques métier
- **Flux de données** - Interroger sur les entrées, sorties, transformations de données et exigences de persistance
- **Points d'intégration** - Interroger sur les interactions avec des systèmes externes, les API et les échanges de données
- **Gestion des erreurs** - Interroger sur les scénarios d'erreur, les échecs de validation et la gestion des exceptions
- **Scénarios métier** - Interroger sur les cas limites, les flux alternatifs et les situations métier complexes

### Étape 4 : Enregistrer le plan
- Enregistrer sous `aidlc-docs/construction/plans/{unit-name}-functional-design-plan.md`
- Inclure toutes les balises [Réponse] : pour la saisie de l'utilisateur

### Étape 5 : Recueillir et analyser les réponses
- Attendre que l'utilisateur complète toutes les balises [Réponse] :
- **OBLIGATOIRE** : Examiner attentivement TOUTES les réponses à la recherche de réponses vagues ou ambiguës
- **CRITIQUE** : Ajouter des questions de suivi pour TOUTE réponse peu claire - ne pas continuer avec de l'ambiguïté
- Rechercher des réponses telles que « ça dépend », « peut-être », « pas sûr », « un mélange de », « quelque part entre »
- Créer un fichier de questions de clarification si UNE ambiguïté est détectée
- **Ne pas continuer tant que TOUTES les ambiguïtés ne sont pas résolues**

### Étape 6 : Générer les artefacts de conception fonctionnelle
- Créer `aidlc-docs/construction/{unit-name}/functional-design/business-logic-model.md`
- Créer `aidlc-docs/construction/{unit-name}/functional-design/business-rules.md`
- Créer `aidlc-docs/construction/{unit-name}/functional-design/domain-entities.md`

### Étape 7 : Présenter le message de fin
- Présenter le message de fin selon cette structure :
     1. **Annonce de fin** (obligatoire) : Toujours commencer par ceci :

```markdown
# 🔧 Conception fonctionnelle terminée - [unit-name]
```

     2. **Résumé de l'IA** (optionnel) : Fournir un résumé structuré à puces de la conception fonctionnelle
        - Format : « La conception fonctionnelle a créé [description] : »
        - Lister les principaux modèles de logique métier et entités (à puces)
        - Lister les règles métier et la logique de validation définies
        - Mentionner la structure du modèle de domaine et les relations
        - NE PAS inclure d'instructions de workflow (« veuillez examiner », « faites-moi savoir », « passer à la phase suivante », « avant de continuer »)
        - Rester factuel et centré sur le contenu
     3. **Message de workflow formaté** (obligatoire) : Toujours terminer avec exactement ce format :

```markdown
> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner les artefacts de conception fonctionnelle à : `aidlc-docs/construction/[unit-name]/functional-design/`



> **🚀 <u>**QUELLE EST LA SUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** - Demander des modifications à la conception fonctionnelle suite à votre examen  
> ✅ **Passer à l'étape suivante** - Approuver la conception fonctionnelle et passer à **[next-stage-name]**

---
```

### Étape 8 : Attendre l'approbation explicite
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé la conception fonctionnelle
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour la conception et répéter le processus d'approbation

### Étape 9 : Enregistrer l'approbation et mettre à jour la progression
- Consigner l'approbation dans audit.md avec horodatage
- Enregistrer la réponse d'approbation de l'utilisateur avec horodatage
- Marquer l'étape Conception fonctionnelle comme terminée dans aidlc-state.md
