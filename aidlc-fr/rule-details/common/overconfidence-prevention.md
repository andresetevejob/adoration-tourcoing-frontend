# Guide de prévention de l'excès de confiance

## Énoncé du problème

AI-DLC manifestait un excès de confiance en ne posant pas suffisamment de questions de clarification, même pour des déclarations d'intention de projet complexes. Cela conduisait à faire des suppositions au lieu de recueillir correctement les exigences.

## Analyse de la cause racine

Le problème d'excès de confiance était causé par des directives, dans plusieurs étapes, qui encourageaient à sauter les questions :

1. **Conception fonctionnelle** : « Ignorer des catégories entières si non applicables »
2. **Récits utilisateur** : « Utiliser les catégories comme inspiration, PAS comme liste de contrôle obligatoire »
3. **Analyse des exigences** : schémas similaires encourageant un questionnement minimal
4. **Exigences NFR** : conditions « seulement si » qui décourageaient une analyse approfondie

Ces directives indiquaient à l'IA d'éviter de poser des questions plutôt que d'encourager un recueil complet des exigences.

## Solution mise en œuvre

### Philosophie de génération de questions mise à jour

**ANCIENNE APPROCHE** : « Ne poser des questions que si c'est absolument nécessaire »
**NOUVELLE APPROCHE** : « En cas de doute, poser la question — l'excès de confiance conduit à de mauvais résultats »

### Changements clés apportés

#### 1. Étape Analyse des exigences
- Passage de « seulement si nécessaire » à « TOUJOURS créer des questions sauf clarté exceptionnelle »
- Ajout de domaines d'évaluation complets (fonctionnel, non fonctionnel, contexte métier, contexte technique)
- Accent mis sur une approche de questionnement proactive

#### 2. Étape Récits utilisateur
- Suppression de la directive « ignorer des catégories entières »
- Ajout de catégories de questions complètes à évaluer
- Renforcement des exigences d'analyse des réponses
- Renforcement des obligations de questions de suivi

#### 3. Étape Conception fonctionnelle
- Remplacement des conditions « seulement si » par une évaluation complète
- Ajout de davantage de catégories de questions (flux de données, points d'intégration, gestion des erreurs)
- Renforcement des exigences de détection et de résolution des ambiguïtés

#### 4. Étape Exigences NFR
- Élargissement des catégories de questions au-delà des NFR de base
- Ajout de considérations de fiabilité, de maintenabilité et d'utilisabilité
- Renforcement de l'analyse des réponses pour les ambiguïtés techniques

### Nouveaux principes directeurs

1. **Par défaut, poser la question** : en cas d'ambiguïté quelconque, poser des questions de clarification
2. **Couverture complète** : évaluer TOUTES les catégories pertinentes, ne pas sauter de domaines
3. **Analyse approfondie** : analyser soigneusement TOUTES les réponses de l'utilisateur pour détecter les ambiguïtés
4. **Suivi obligatoire** : créer des questions de suivi pour TOUTE réponse peu claire
5. **Ne pas avancer avec de l'ambiguïté** : ne pas continuer tant que TOUTES les ambiguïtés ne sont pas résolues

## Lignes directrices de mise en œuvre

### Pour la génération de questions
- Évaluer TOUTES les catégories de questions, n'en sauter aucune
- Poser des questions partout où une clarification améliorerait la qualité
- Inclure des catégories de questions complètes à chaque étape
- Par défaut, inclure plutôt qu'exclure des questions

### Pour l'analyse des réponses
- Repérer les réponses vagues : « ça dépend », « peut-être », « pas sûr », « un mélange de », « quelque part entre »
- Détecter les termes non définis et les références à des concepts externes
- Identifier les réponses contradictoires ou incomplètes
- Créer des questions de suivi pour TOUTE ambiguïté

### Pour les questions de suivi
- Créer des fichiers de clarification séparés lorsque des ambiguïtés sont détectées
- Poser des questions précises pour résoudre chaque ambiguïté
- Ne pas continuer tant que TOUTES les réponses peu claires n'ont pas été clarifiées
- Être minutieux — il vaut mieux trop clarifier que pas assez

## Assurance qualité

### Signaux d'alerte à surveiller
- Des étapes qui se terminent sans poser aucune question sur des projets complexes
- Continuer avec des réponses utilisateur vagues ou ambiguës
- Sauter des catégories de questions entières sans justification
- Faire des suppositions au lieu de demander des clarifications

### Indicateurs de succès
- Un nombre approprié de questions de clarification par rapport à la complexité du projet
- Une analyse approfondie des réponses de l'utilisateur, avec suivi si nécessaire
- Des exigences claires et non ambiguës avant de passer à l'implémentation
- Un besoin réduit de changements dans les étapes ultérieures grâce à une meilleure clarification en amont

## Maintenance

Ce guide doit être consulté lors de :
- L'ajout de nouvelles étapes à AI-DLC
- La mise à jour des instructions d'étapes existantes
- L'examen des performances d'AI-DLC concernant les problèmes d'excès de confiance
- La formation des membres de l'équipe aux principes de génération de questions d'AI-DLC

## Point clé à retenir

**Il vaut mieux poser trop de questions que de faire des suppositions incorrectes.** Le coût de poser des questions de clarification en amont est bien inférieur au coût d'implémenter la mauvaise solution sur la base de suppositions.
