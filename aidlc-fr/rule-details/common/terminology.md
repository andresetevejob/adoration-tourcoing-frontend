# Glossaire terminologique AI-DLC

## Terminologie fondamentale

### Phase vs Étape

**Phase** : l'une des trois grandes phases du cycle de vie d'AI-DLC
- 🔵 **PHASE D'INCEPTION** — Planification & architecture (QUOI et POURQUOI)
- 🟢 **PHASE DE CONSTRUCTION** — Conception, implémentation & tests (COMMENT)
- 🟡 **PHASE D'EXPLOITATION** — Déploiement & supervision (extension future)

**Étape** : une activité individuelle du workflow au sein d'une phase
- Exemples : étape Évaluation du contexte, étape Évaluation des exigences, étape Planification du code
- Chaque étape a des prérequis, des étapes et des résultats spécifiques
- Les étapes peuvent être TOUJOURS-EXÉCUTER ou CONDITIONNELLES

**Exemples d'usage** :
- ✅ « La phase CONSTRUCTION contient 7 étapes »
- ✅ « L'étape Planification du code est toujours exécutée »
- ✅ « Nous sommes dans la phase INCEPTION, en train d'exécuter l'étape Évaluation des exigences »
- ❌ « La phase Évaluation des exigences » (devrait être « étape »)
- ❌ « L'étape CONSTRUCTION » (devrait être « phase »)

## Cycle de vie en trois phases

### PHASE D'INCEPTION
**Objectif** : planification et décisions architecturales
**Focus** : déterminer QUOI construire et POURQUOI
**Emplacement** : répertoire `inception/`

**Étapes** :
- Détection de l'espace de travail (TOUJOURS)
- Rétro-ingénierie (CONDITIONNEL — brownfield uniquement)
- Analyse des exigences (TOUJOURS — profondeur adaptative)
- Récits utilisateur (CONDITIONNEL)
- Planification du workflow (TOUJOURS)
- Conception de l'application (CONDITIONNEL)
- Conception — Planification/Génération des unités (CONDITIONNEL)

**Résultats** : exigences, récits utilisateur, décisions architecturales, définitions d'unités

### PHASE DE CONSTRUCTION
**Objectif** : conception détaillée et implémentation
**Focus** : déterminer COMMENT le construire
**Emplacement** : répertoire `construction/`

**Étapes** :
- Conception fonctionnelle (CONDITIONNEL, par unité)
- Exigences NFR (CONDITIONNEL, par unité)
- Conception NFR (CONDITIONNEL, par unité)
- Conception de l'infrastructure (CONDITIONNEL, par unité)
- Planification du code (TOUJOURS)
- Génération de code (TOUJOURS)
- Build et Tests (TOUJOURS)

**Résultats** : artefacts de conception, implémentations NFR, code, tests

### PHASE D'EXPLOITATION
**Objectif** : préparation au déploiement et à l'exploitation
**Focus** : comment le DÉPLOYER et l'EXPLOITER
**Emplacement** : répertoire `operations/`

**Étapes** :
- Exploitation (RÉSERVÉ)

**Résultats** : instructions de build, guides de déploiement, configuration de la supervision, procédures de vérification

---

## Étapes du workflow

### Étapes toujours exécutées
- **Détection de l'espace de travail** : analyse initiale de l'état de l'espace de travail et du type de projet
- **Analyse des exigences** : recueil des exigences (la profondeur varie selon la complexité)
- **Planification du workflow** : création du plan d'exécution indiquant quelles phases exécuter
- **Planification du code** : création de plans d'implémentation détaillés pour la génération de code
- **Génération de code** : génération du code réel à partir des plans et artefacts précédents
- **Build et Tests** : build de toutes les unités et exécution de tests complets

### Étapes conditionnelles
- **Rétro-ingénierie** : analyse du code existant (projets brownfield uniquement)
- **Récits utilisateur** : création des récits utilisateur et des personas (inclut Planification des récits et Génération des récits)
- **Conception de l'application** : conception des composants de l'application, des méthodes, des règles métier et des services
- **Conception** : conception des composants du système (inclut Planification des unités, Génération des unités, conception par unité)
- **Conception fonctionnelle** : conception de la logique métier indépendante de la technologie (par unité)
- **Exigences NFR** : détermination des NFR et sélection de la pile technique (par unité)
- **Conception NFR** : intégration des patterns NFR et des composants logiques (par unité)
- **Conception de l'infrastructure** : correspondance avec les services d'infrastructure réels (par unité)

## Termes de conception d'application

- **Composant** : une unité fonctionnelle ayant des responsabilités spécifiques
- **Méthode** : une fonction ou opération au sein d'un composant, avec des règles métier définies
- **Règle métier** : logique qui régit le comportement et la validation d'une méthode
- **Service** : couche d'orchestration qui coordonne la logique métier entre les composants
- **Dépendance de composant** : relation et pattern de communication entre les composants

## Termes d'architecture (infrastructure)

### Unité de travail (Unit of Work)
Un regroupement logique de récits utilisateur à des fins de développement. Le terme utilisé pendant la planification et la décomposition.

**Usage** : « Nous devons décomposer le système en unités de travail »

### Service
Un composant déployable indépendamment dans une architecture microservices. Chaque service est une unité de travail distincte.

**Usage** : « Le Service de paiement gère l'ensemble du traitement des paiements »

### Module
Un regroupement logique de fonctionnalités au sein d'un service unique ou d'un monolithe. Les modules ne sont pas déployables indépendamment.

**Usage** : « Le module d'authentification au sein du Service Utilisateur »

### Composant
Un bloc de construction réutilisable au sein d'un service ou d'un module. Les composants sont des classes, fonctions ou packages fournissant une fonctionnalité spécifique.

**Usage** : « Le composant EmailValidator valide les adresses e-mail »

## Lignes directrices terminologiques

### Quand utiliser chaque terme

**Unité de travail** :
- Pendant les phases de Planification des unités et de Génération des unités
- Lorsqu'on discute de la décomposition du système
- Dans les documents et discussions de planification
- Exemple : « Comment devrions-nous décomposer cela en unités de travail ? »

**Service** :
- Pour désigner des composants déployables indépendamment
- Dans les contextes d'architecture microservices
- Dans les discussions de déploiement et d'infrastructure
- Exemple : « Le Service Commande sera déployé sur ECS »

**Module** :
- Pour désigner des regroupements logiques au sein d'un service
- Dans les contextes d'architecture monolithique
- Lorsqu'on discute de l'organisation interne
- Exemple : « Le module de reporting génère tous les rapports »

**Composant** :
- Pour désigner des classes, fonctions ou packages spécifiques
- Dans les discussions de conception et d'implémentation
- Lorsqu'on discute de blocs de construction réutilisables
- Exemple : « Le composant DatabaseConnection gère les connexions »

## Terminologie des étapes

### Planification vs Génération
- **Planification** : créer un plan avec des questions et des cases à cocher pour l'exécution
- **Génération** : exécuter le plan pour créer les artefacts

Exemples :
- Planification des récits → Génération des récits
- Planification des unités → Génération des unités
- Planification de la conception d'unité → Génération de la conception d'unité
- Planification NFR → Génération NFR
- Planification du code → Génération de code

### Niveaux de profondeur
- **Minimal** : exécution rapide et ciblée pour les changements simples
- **Standard** : profondeur normale avec artefacts standard pour les projets typiques
- **Complet** : profondeur totale avec tous les artefacts pour les projets complexes/à haut risque

## Types d'artefacts

### Plans
Documents avec cases à cocher et questions qui guident l'exécution.
- Situés dans `aidlc-docs/plans/`
- Exemples : `story-generation-plan.md`, `unit-of-work-plan.md`

### Artefacts
Résultats générés par l'exécution des plans.
- Situés dans divers sous-répertoires de `aidlc-docs/`
- Exemples : `requirements.md`, `stories.md`, `design.md`

### Fichiers d'état
Fichiers suivant la progression et le statut du workflow.
- `aidlc-state.md` : état global du workflow
- `audit.md` : historique d'audit complet de toutes les interactions

## Abréviations courantes

- **AI-DLC** : Cycle de vie de développement piloté par IA (AI-Driven Development Life Cycle)
- **NFR** : exigences non fonctionnelles (Non-Functional Requirements)
- **UOW** : unité de travail (Unit of Work)
- **API** : interface de programmation applicative (Application Programming Interface)
- **CDK** : Cloud Development Kit (AWS)
