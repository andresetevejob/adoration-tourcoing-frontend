# Récits utilisateur — Étapes détaillées

## Objectif
**Convertir les exigences en récits centrés sur l'utilisateur avec des critères d'acceptation**

Les Récits utilisateur se concentrent sur :
- La traduction des exigences métier en récits centrés sur l'utilisateur
- La définition de critères d'acceptation clairs pour chaque récit
- La création de personas utilisateur représentant différents types de parties prenantes
- L'établissement d'une compréhension partagée entre les équipes
- La fourniture de spécifications testables pour l'implémentation

## Prérequis
- La Détection de l'espace de travail doit être terminée
- L'Analyse des exigences est recommandée (peut être référencée si disponible)
- La Planification du workflow doit indiquer que l'étape Récits utilisateur doit s'exécuter

## Lignes directrices d'évaluation intelligente

**QUAND EXÉCUTER LES RÉCITS UTILISATEUR** : Utiliser cette évaluation renforcée avant de continuer :

### Exécution haute priorité (TOUJOURS exécuter)
- **Nouvelles fonctionnalités utilisateur** : Toute nouvelle fonctionnalité avec laquelle les utilisateurs interagiront directement
- **Changements d'expérience utilisateur** : Modifications des workflows ou interfaces utilisateur existants
- **Systèmes multi-personas** : Applications servant différents types d'utilisateurs
- **API destinées aux clients** : Services qui seront consommés par des utilisateurs ou systèmes externes
- **Logique métier complexe** : Exigences avec plusieurs scénarios ou règles métier
- **Projets inter-équipes** : Travaux nécessitant une compréhension partagée entre plusieurs équipes

### Exécution priorité moyenne (évaluer la complexité)
- **Impact utilisateur backend** : Changements internes affectant indirectement l'expérience utilisateur
- **Améliorations de performance** : Améliorations avec des bénéfices visibles pour l'utilisateur
- **Travaux d'intégration** : Connexion de systèmes affectant les workflows utilisateur
- **Changements de données** : Modifications affectant les données, rapports ou analyses des utilisateurs
- **Améliorations de sécurité** : Changements affectant l'authentification ou les permissions des utilisateurs

### Facteurs d'évaluation de la complexité
Pour les cas de priorité moyenne, exécuter les récits utilisateur si UN SEUL de ces éléments s'applique :
- **Portée** : Les changements couvrent plusieurs composants ou points de contact utilisateur
- **Ambiguïté** : Les exigences comportent des aspects peu clairs que les récits pourraient clarifier
- **Risque** : Impact métier élevé ou potentiel de malentendu
- **Parties prenantes** : Plusieurs parties prenantes métier impliquées dans les exigences
- **Tests** : Des tests d'acceptation utilisateur seront nécessaires
- **Options** : Plusieurs approches d'implémentation valides existent

### Ignorer uniquement pour les cas simples
- **Refactorisation pure** : Améliorations de code interne sans aucun impact utilisateur
- **Corrections de bugs isolées** : Corrections simples et bien définies avec une portée claire
- **Infrastructure uniquement** : Changements sans effet visible pour l'utilisateur
- **Outillage développeur** : Changements de processus de build, CI/CD ou environnement de développement
- **Documentation** : Mises à jour n'affectant pas la fonctionnalité

### Règle de décision par défaut
**En cas de doute, inclure les récits utilisateur ET poser des questions de clarification.** Le coût de la création de récits complets avec une clarification appropriée est généralement compensé par les bénéfices suivants :
- Une compréhension plus claire des exigences
- Un meilleur alignement d'équipe
- Des critères de test améliorés
- Une communication renforcée avec les parties prenantes
- Des risques d'implémentation réduits
- Moins de changements coûteux pendant le développement
- De meilleurs résultats en matière d'expérience utilisateur

---

# PARTIE 1 : PLANIFICATION

## Étape 1 : Valider la nécessité des récits utilisateur (OBLIGATOIRE)

**CRITIQUE** : Avant de poursuivre avec les récits utilisateur, effectuer cette évaluation :

### Processus d'évaluation
1. **Analyser le contexte de la demande** :
   - Examiner la demande initiale de l'utilisateur et les exigences
   - Identifier les changements destinés aux utilisateurs par rapport aux changements purement internes
   - Évaluer la complexité et la portée du travail
   - Évaluer l'implication des parties prenantes métier

2. **Appliquer les critères d'évaluation** :
   - Vérifier par rapport aux indicateurs de priorité élevée (toujours exécuter)
   - Évaluer les facteurs de priorité moyenne (décision basée sur la complexité)
   - Confirmer qu'il ne s'agit pas d'un cas simple à ignorer

3. **Documenter la décision d'évaluation** :
   - Créer `aidlc-docs/inception/plans/user-stories-assessment.md`
   - Inclure le raisonnement expliquant pourquoi les récits utilisateur apportent de la valeur pour cette demande
   - Référencer les critères d'évaluation spécifiques qui s'appliquent
   - Expliquer les bénéfices attendus (clarté, tests, alignement des parties prenantes)

4. **Poursuivre uniquement si justifié** :
   - Les récits utilisateur doivent apporter une valeur claire au projet
   - L'évaluation doit montrer que les bénéfices concrets l'emportent sur le coût
   - La décision doit être défendable auprès des parties prenantes du projet

### Modèle de documentation d'évaluation
```markdown
# Évaluation des récits utilisateur

## Analyse de la demande
- **Demande initiale** : [Bref résumé]
- **Impact utilisateur** : [Direct/Indirect/Aucun]
- **Niveau de complexité** : [Simple/Moyen/Complexe]
- **Parties prenantes** : [Liste des parties impliquées]

## Critères d'évaluation satisfaits
- [ ] Priorité élevée : [Liste des critères applicables]
- [ ] Priorité moyenne : [Liste des critères applicables avec justification de complexité]
- [ ] Bénéfices : [Valeur attendue des récits utilisateur]

## Décision
**Exécuter les récits utilisateur** : [Oui/Non]
**Raisonnement** : [Justification détaillée]

## Résultats attendus
- [Liste des bénéfices spécifiques que les récits utilisateur apporteront]
- [Comment les récits amélioreront la réussite du projet]
```

## Étape 2 : Créer le plan de récits
- Adopter le rôle d'un product owner
- Générer un plan complet avec une checklist d'exécution étape par étape pour le développement des récits
- Chaque étape et sous-étape doit avoir une case à cocher []
- Se concentrer sur la méthodologie et l'approche pour convertir les exigences en récits utilisateur

## Étape 3 : Générer des questions adaptées au contexte
**DIRECTIVE** : Analyser en profondeur les exigences et le contexte pour identifier TOUS les domaines où une clarification améliorerait la qualité des récits et la compréhension de l'équipe. Être proactif dans la formulation de questions pour garantir un développement complet des récits utilisateur.

**CRITIQUE** : Par défaut, poser des questions dès qu'il existe UNE ambiguïté ou un détail manquant pouvant affecter la qualité des récits. Il vaut mieux poser trop de questions que de créer des récits incomplets ou peu clairs.

**Voir `common/question-format-guide.md` pour les règles de formatage des questions**

- INTÉGRER les questions en utilisant le format de balise [Réponse] :
- Se concentrer sur TOUTE ambiguïté, information manquante ou domaine nécessitant une clarification
- Générer des questions partout où la contribution de l'utilisateur améliorerait les décisions de création des récits
- **En cas de doute, poser la question** — la surconfiance mène à de mauvais récits

**Catégories de questions à évaluer** (considérer TOUTES les catégories) :
- **Personas utilisateur** — Interroger sur les types d'utilisateurs, rôles, caractéristiques et motivations
- **Granularité des récits** — Interroger sur le niveau de détail approprié, la taille des récits et l'approche de découpage
- **Format des récits** — Interroger sur les préférences de format, l'utilisation de modèles et les standards de documentation
- **Approche de découpage** — Interroger sur la méthode d'organisation, la priorisation et les stratégies de regroupement
- **Critères d'acceptation** — Interroger sur le niveau de détail, le format, l'approche de test et les méthodes de validation
- **Parcours utilisateur** — Interroger sur les workflows utilisateur, les schémas d'interaction et les flux d'expérience
- **Contexte métier** — Interroger sur les objectifs métier, les indicateurs de succès et les besoins des parties prenantes
- **Contraintes techniques** — Interroger sur les limitations techniques, les exigences d'intégration et les limites du système

## Étape 4 : Inclure les artefacts de récits obligatoires dans le plan
- **TOUJOURS** inclure ces artefacts obligatoires dans le plan de récits :
  - [ ] Générer stories.md avec les récits utilisateur respectant les critères INVEST
  - [ ] Générer personas.md avec les archétypes et caractéristiques des utilisateurs
  - [ ] S'assurer que les récits sont Indépendants, Négociables, Valorisables, Estimables, Suffisamment petits, Testables (INVEST)
  - [ ] Inclure des critères d'acceptation pour chaque récit
  - [ ] Associer les personas aux récits utilisateur pertinents

## Étape 5 : Présenter les options de récits
- Inclure différentes approches de découpage des récits dans le document de plan :
  - **Basée sur le parcours utilisateur** : Les récits suivent les workflows et interactions de l'utilisateur
  - **Basée sur les fonctionnalités** : Les récits sont organisés autour des fonctionnalités et capacités du système
  - **Basée sur les personas** : Les récits sont regroupés par différents types d'utilisateurs et leurs besoins
  - **Basée sur le domaine** : Les récits sont organisés autour des domaines ou contextes métier
  - **Basée sur les épics** : Les récits sont structurés comme des épics hiérarchiques avec des sous-récits
- Expliquer les compromis et bénéfices de chaque approche
- Permettre des approches hybrides avec des critères de décision clairs

## Étape 6 : Enregistrer le plan de récits
- Enregistrer le plan de récits complet avec les questions intégrées dans le répertoire `aidlc-docs/inception/plans/`
- Nom de fichier : `story-generation-plan.md`
- Inclure toutes les balises [Réponse] : pour la saisie de l'utilisateur
- S'assurer que le plan est complet et couvre tous les aspects du développement des récits

## Étape 7 : Demander la contribution de l'utilisateur
- Demander à l'utilisateur de renseigner toutes les balises [Réponse] : directement dans le document de plan de récits
- Souligner l'importance de la piste d'audit et de la documentation des décisions
- Fournir des instructions claires sur la façon de renseigner les balises [Réponse] :
- Expliquer que toutes les questions doivent recevoir une réponse avant de continuer

## Étape 8 : Recueillir les réponses
- Attendre que l'utilisateur fournisse les réponses à toutes les questions en utilisant les balises [Réponse] : dans le document
- Ne pas continuer tant que TOUTES les balises [Réponse] : ne sont pas complétées
- Examiner le document pour s'assurer qu'aucune balise [Réponse] : n'est laissée vide

## Étape 9 : ANALYSER LES RÉPONSES (OBLIGATOIRE)
Avant de continuer, vous DEVEZ examiner attentivement toutes les réponses de l'utilisateur à la recherche de :
- **Réponses vagues ou ambiguës** : « un mélange de », « quelque part entre », « pas sûr », « ça dépend », « peut-être », « probablement »
- **Critères ou termes non définis** : Références à des concepts sans définition claire
- **Réponses contradictoires** : Réponses qui se contredisent entre elles
- **Détails de génération manquants** : Réponses manquant d'indications précises pour l'implémentation
- **Réponses combinant plusieurs options** : Réponses fusionnant différentes approches sans règle de décision claire
- **Explications incomplètes** : Réponses faisant référence à des facteurs externes sans les définir
- **Réponses basées sur des suppositions** : Réponses supposant une connaissance non explicitement énoncée

## Étape 10 : Questions de suivi OBLIGATOIRES
Si l'analyse de l'étape 9 révèle UNE réponse ambiguë, vous DEVEZ :
- Créer un fichier séparé de questions de clarification en utilisant les balises [Réponse] :
- NE PAS passer à l'approbation tant que TOUTES les ambiguïtés ne sont pas complètement résolues
- **CRITIQUE** : Être minutieux — poser des questions de suivi pour chaque réponse peu claire
- Exemples de suivis requis :
  - « Vous avez mentionné "un mélange de A et B" — quels critères précis devraient déterminer quand utiliser A plutôt que B ? »
  - « Vous avez dit "quelque part entre A et B" — pouvez-vous définir l'approche médiane exacte ? »
  - « Vous avez indiqué "pas sûr" — quelle information supplémentaire vous aiderait à décider ? »
  - « Vous avez mentionné "selon la complexité" — comment définissez-vous les niveaux et seuils de complexité ? »
  - « Vous avez choisi "approche hybride" — quelles sont les règles précises pour déterminer quand utiliser chaque méthode ? »
  - « Vous avez dit "probablement X" — quels facteurs feraient que ce soit définitivement X plutôt que définitivement pas X ? »
  - « Vous avez fait référence à une "pratique standard" — pouvez-vous définir en quoi consiste cette pratique standard ? »

## Étape 11 : Éviter les détails d'implémentation
- Se concentrer sur la méthodologie de création des récits, pas sur la priorisation ou les tâches de développement
- Ne pas discuter de la génération technique à ce stade
- Éviter de créer des calendriers de développement ou une planification de sprints
- Rester concentré sur les décisions de structure et de format des récits

## Étape 12 : Consigner la demande d'approbation
- Avant de demander l'approbation, consigner la demande avec horodatage dans `aidlc-docs/audit.md`
- Inclure le texte complet de la demande d'approbation
- Utiliser le format d'horodatage ISO 8601

## Étape 13 : Attendre l'approbation explicite du plan
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé l'approche des récits
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour le plan et répéter le processus d'approbation

## Étape 14 : Enregistrer la réponse d'approbation
- Consigner la réponse d'approbation de l'utilisateur avec horodatage dans `aidlc-docs/audit.md`
- Inclure le texte exact de la réponse de l'utilisateur
- Marquer clairement le statut d'approbation

---

# PARTIE 2 : GÉNÉRATION

## Étape 15 : Charger le plan de génération des récits
- [ ] Lire le plan de récits complet depuis `aidlc-docs/inception/plans/story-generation-plan.md`
- [ ] Identifier la prochaine étape non terminée (première case à cocher [ ])
- [ ] Charger le contexte et les exigences de cette étape

## Étape 16 : Exécuter l'étape actuelle
- [ ] Effectuer exactement ce que décrit l'étape actuelle
- [ ] Générer les artefacts de récits comme spécifié dans le plan
- [ ] Suivre la méthodologie et le format approuvés lors de la planification
- [ ] Utiliser l'approche de découpage des récits spécifiée dans le plan

## Étape 17 : Mettre à jour la progression
- [ ] Marquer l'étape terminée comme [x] dans le plan de génération des récits
- [ ] Mettre à jour le statut actuel dans `aidlc-docs/aidlc-state.md`
- [ ] Enregistrer tous les artefacts générés

## Étape 18 : Continuer ou terminer la génération
- [ ] S'il reste des étapes, revenir à l'étape 14
- [ ] Si toutes les étapes sont terminées, vérifier que les récits sont prêts pour l'étape suivante
- [ ] S'assurer que tous les artefacts obligatoires sont générés

## Étape 19 : Consigner la demande d'approbation
- Avant de demander l'approbation, consigner la demande avec horodatage dans `aidlc-docs/audit.md`
- Inclure le texte complet de la demande d'approbation
- Utiliser le format d'horodatage ISO 8601

## Étape 20 : Présenter le message de fin
- Présenter le message de fin selon cette structure :
     1. **Annonce de fin** (obligatoire) : Toujours commencer par ceci :

```markdown
# 📚 Récits utilisateur terminés
```

     2. **Résumé de l'IA** (optionnel) : Fournir un résumé structuré des récits générés sous forme de puces
        - Format : « La génération des récits utilisateur a créé [description] : »
        - Lister les principaux personas générés (puces)
        - Lister les récits utilisateur créés avec leur nombre et leur organisation
        - Mentionner la structure des récits et leur conformité (critères INVEST, critères d'acceptation)
        - NE PAS inclure d'instructions de workflow (« veuillez examiner », « faites-moi savoir », « passer à la phase suivante », « avant de continuer »)
        - Rester factuel et centré sur le contenu
     3. **Message de workflow formaté** (obligatoire) : Toujours terminer avec exactement ce format :

```markdown
> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner les récits utilisateur et les personas à : `aidlc-docs/inception/user-stories/stories.md` et `aidlc-docs/inception/user-stories/personas.md`



> **🚀 <u>**ET ENSUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** — Demander des modifications aux récits ou personas après votre examen
> ✅ **Approuver et continuer** — Approuver les récits utilisateur et passer à la **Planification du workflow**

---
```

## Étape 21 : Attendre l'approbation explicite des récits générés
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé les récits générés
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour les récits et répéter le processus d'approbation

## Étape 22 : Enregistrer la réponse d'approbation
- Consigner la réponse d'approbation de l'utilisateur avec horodatage dans `aidlc-docs/audit.md`
- Inclure le texte exact de la réponse de l'utilisateur
- Marquer clairement le statut d'approbation

## Étape 23 : Mettre à jour la progression
- Marquer l'étape Récits utilisateur comme terminée dans `aidlc-state.md`
- Mettre à jour la section « Statut actuel »
- Préparer la transition vers l'étape suivante

---

# RÈGLES CRITIQUES

## Règles de la phase de planification
- **QUESTIONS ADAPTÉES AU CONTEXTE** : Ne poser que des questions pertinentes pour ce contexte spécifique
- **ANALYSE DES RÉPONSES OBLIGATOIRE** : Toujours analyser les réponses à la recherche d'ambiguïtés avant de continuer
- **NE PAS CONTINUER EN CAS D'AMBIGUÏTÉ** : Toutes les réponses vagues doivent être résolues avant la génération
- **APPROBATION EXPLICITE REQUISE** : L'utilisateur doit approuver le plan avant le début de la génération

## Règles de la phase de génération
- **AUCUNE LOGIQUE CODÉE EN DUR** : N'exécuter que ce qui est écrit dans le plan de génération des récits
- **SUIVRE LE PLAN EXACTEMENT** : Ne pas dévier de la séquence des étapes
- **METTRE À JOUR LES CASES À COCHER** : Cocher [x] immédiatement après avoir terminé chaque étape
- **UTILISER LA MÉTHODOLOGIE APPROUVÉE** : Suivre l'approche de récits définie lors de la planification
- **VÉRIFIER L'ACHÈVEMENT** : S'assurer que tous les artefacts de récits sont complets avant de continuer

## Critères d'achèvement
- Toutes les questions de planification ont reçu une réponse et les ambiguïtés sont résolues
- Le plan de récits a été explicitement approuvé par l'utilisateur
- Toutes les étapes du plan de génération des récits sont marquées [x]
- Tous les artefacts de récits sont générés conformément au plan (stories.md, personas.md)
- Les récits générés ont été explicitement approuvés par l'utilisateur
- Les récits sont vérifiés et prêts pour l'étape suivante
