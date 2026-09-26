# Rétro-ingénierie

**Objectif** : Analyser le code existant et générer des artefacts de conception complets

**Exécuter quand** : Un projet brownfield est détecté (code existant trouvé dans l'espace de travail)

**Ignorer quand** : Projet greenfield (aucun code existant)

**Comportement de réexécution** : Toujours réexécuter lorsqu'un projet brownfield est détecté, même si des artefacts existent déjà. Cela garantit que les artefacts reflètent l'état actuel du code

## Étape 1 : Découverte multi-packages

### 1.1 Scanner l'espace de travail
- Tous les packages (pas seulement ceux mentionnés)
- Relations entre packages via les fichiers de configuration
- Types de packages : Application, CDK/Infrastructure, Modèles, Clients, Tests

### 1.2 Comprendre le contexte métier
- Le cœur de métier global implémenté par le système
- La vue d'ensemble métier de chaque package
- La liste des transactions métier implémentées dans le système

### 1.3 Découverte de l'infrastructure
- Packages CDK (package.json avec dépendances CDK)
- Terraform (fichiers .tf)
- CloudFormation (modèles .yaml/.json)
- Scripts de déploiement

### 1.4 Découverte du système de build
- Systèmes de build : Brazil, Maven, Gradle, npm
- Fichiers de configuration des déclarations de système de build
- Dépendances de build entre packages

### 1.5 Découverte de l'architecture de service
- Fonctions Lambda (handlers, déclencheurs)
- Services conteneurisés (configurations Docker/ECS)
- Définitions d'API (modèles Smithy, spécifications OpenAPI)
- Data stores (DynamoDB, S3, etc.)

### 1.6 Analyse de la qualité du code
- Langages de programmation et frameworks
- Indicateurs de couverture de tests
- Configurations de linting
- Pipelines CI/CD

## Étape 1 : Générer la documentation de vue d'ensemble métier

Créer `aidlc-docs/inception/reverse-engineering/business-overview.md` :

```markdown
# Vue d'ensemble métier

## Diagramme de contexte métier
[Diagramme Mermaid montrant le contexte métier]

## Description métier
- **Description métier** : [Description globale de ce que fait le système d'un point de vue métier]
- **Transactions métier** : [Liste des transactions métier implémentées par le système et leurs descriptions]
- **Dictionnaire métier** : [Termes du dictionnaire métier suivis par le système et leur signification]

## Descriptions métier au niveau des composants
### [Nom du package/composant]
- **Objectif** : [Ce qu'il fait du point de vue métier]
- **Responsabilités** : [Responsabilités clés]
```

## Étape 2 : Générer la documentation d'architecture

Créer `aidlc-docs/inception/reverse-engineering/architecture.md` :

```markdown
# Architecture du système

## Vue d'ensemble du système
[Description de haut niveau du système]

## Diagramme d'architecture
[Diagramme Mermaid montrant tous les packages, services, data stores, relations]

## Descriptions des composants
### [Nom du package/composant]
- **Objectif** : [Ce qu'il fait]
- **Responsabilités** : [Responsabilités clés]
- **Dépendances** : [Ce dont il dépend]
- **Type** : [Application/Infrastructure/Modèle/Client/Test]

## Flux de données
[Diagramme de séquence Mermaid des workflows clés]

## Points d'intégration
- **API externes** : [Liste avec objectifs]
- **Bases de données** : [Liste avec objectifs]
- **Services tiers** : [Liste avec objectifs]

## Composants d'infrastructure
- **Stacks CDK** : [Liste avec objectifs]
- **Modèle de déploiement** : [Description]
- **Réseau** : [VPC, sous-réseaux, groupes de sécurité]
```

## Étape 3 : Générer la documentation de structure du code

Créer `aidlc-docs/inception/reverse-engineering/code-structure.md` :

```markdown
# Structure du code

## Système de build
- **Type** : [Maven/Gradle/npm/Brazil]
- **Configuration** : [Fichiers de build clés et paramètres]

## Classes/Modules clés
[Diagramme de classes Mermaid ou hiérarchie des modules]

## Patterns de conception
### [Nom du pattern]
- **Emplacement** : [Où il est utilisé]
- **Objectif** : [Pourquoi il est utilisé]
- **Implémentation** : [Comment il est implémenté]

## Dépendances critiques
### [Nom de la dépendance]
- **Version** : [Numéro de version]
- **Usage** : [Comment et où elle est utilisée]
- **Objectif** : [Pourquoi elle est nécessaire]
```

## Étape 4 : Générer la documentation de l'API

Créer `aidlc-docs/inception/reverse-engineering/api-documentation.md` :

```markdown
# Documentation de l'API

## API REST
### [Nom du endpoint]
- **Méthode** : [GET/POST/PUT/DELETE]
- **Chemin** : [/api/chemin]
- **Objectif** : [Ce qu'il fait]
- **Requête** : [Format de la requête]
- **Réponse** : [Format de la réponse]

## API internes
### [Nom de l'interface/classe]
- **Méthodes** : [Liste avec signatures]
- **Paramètres** : [Descriptions des paramètres]
- **Types de retour** : [Descriptions des types de retour]

## Modèles de données
### [Nom du modèle]
- **Champs** : [Descriptions des champs]
- **Relations** : [Modèles associés]
- **Validation** : [Règles de validation]
```

## Étape 5 : Générer l'inventaire des composants

Créer `aidlc-docs/inception/reverse-engineering/component-inventory.md` :

```markdown
# Inventaire des composants

## Packages d'application
- [Nom du package] - [Objectif]

## Packages d'infrastructure
- [Nom du package] - [CDK/Terraform] - [Objectif]

## Packages partagés
- [Nom du package] - [Modèles/Utilitaires/Clients] - [Objectif]

## Packages de test
- [Nom du package] - [Intégration/Charge/Unitaire] - [Objectif]

## Total
- **Total des packages** : [Nombre]
- **Application** : [Nombre]
- **Infrastructure** : [Nombre]
- **Partagés** : [Nombre]
- **Tests** : [Nombre]
```

## Étape 6 : Générer la documentation de la pile technologique

Créer `aidlc-docs/inception/reverse-engineering/technology-stack.md` :

```markdown
# Pile technologique

## Langages de programmation
- [Langage] - [Version] - [Usage]

## Frameworks
- [Framework] - [Version] - [Objectif]

## Infrastructure
- [Service] - [Objectif]

## Outils de build
- [Outil] - [Version] - [Objectif]

## Outils de test
- [Outil] - [Version] - [Objectif]
```

## Étape 7 : Générer la documentation des dépendances

Créer `aidlc-docs/inception/reverse-engineering/dependencies.md` :

```markdown
# Dépendances

## Dépendances internes
[Diagramme Mermaid montrant les dépendances entre packages]

### [Package A] dépend de [Package B]
- **Type** : [Compilation/Exécution/Test]
- **Raison** : [Pourquoi la dépendance existe]

## Dépendances externes
### [Nom de la dépendance]
- **Version** : [Version]
- **Objectif** : [Pourquoi elle est utilisée]
- **Licence** : [Type de licence]
```

## Étape 8 : Générer l'évaluation de la qualité du code

Créer `aidlc-docs/inception/reverse-engineering/code-quality-assessment.md` :

```markdown
# Évaluation de la qualité du code

## Couverture de tests
- **Globale** : [Pourcentage ou Bonne/Correcte/Faible/Aucune]
- **Tests unitaires** : [Statut]
- **Tests d'intégration** : [Statut]

## Indicateurs de qualité du code
- **Linting** : [Configuré/Non configuré]
- **Style de code** : [Cohérent/Incohérent]
- **Documentation** : [Bonne/Correcte/Faible]

## Dette technique
- [Description du problème et emplacement]

## Patterns et anti-patterns
- **Bons patterns** : [Liste]
- **Anti-patterns** : [Liste avec emplacements]
```

## Étape 9 : Créer le fichier d'horodatage

Créer `aidlc-docs/inception/reverse-engineering/reverse-engineering-timestamp.md` :

```markdown
# Métadonnées de rétro-ingénierie

**Date d'analyse** : [horodatage ISO]
**Analyseur** : AI-DLC
**Espace de travail** : [chemin de l'espace de travail]
**Total des fichiers analysés** : [Nombre]

## Artefacts générés
- [x] architecture.md
- [x] code-structure.md
- [x] api-documentation.md
- [x] component-inventory.md
- [x] technology-stack.md
- [x] dependencies.md
- [x] code-quality-assessment.md
```

## Étape 10 : Mettre à jour le suivi d'état

Mettre à jour `aidlc-docs/aidlc-state.md` :

```markdown
## Statut de la rétro-ingénierie
- [x] Rétro-ingénierie - Terminée le [horodatage]
- **Emplacement des artefacts** : aidlc-docs/inception/reverse-engineering/
```

## Étape 11 : Présenter le message de fin à l'utilisateur

```markdown
# 🔍 Rétro-ingénierie terminée

[Résumé généré par l'IA des principaux résultats de l'analyse, sous forme de puces]

> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner les artefacts de rétro-ingénierie à : `aidlc-docs/inception/reverse-engineering/`

> **🚀 <u>**ET ENSUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** — Demander des modifications à l'analyse de rétro-ingénierie si nécessaire
> ✅ **Approuver et continuer** — Approuver l'analyse et passer à l'**Analyse des exigences**
```

## Étape 12 : Attendre l'approbation de l'utilisateur

- **OBLIGATOIRE** : Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé
- **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute
