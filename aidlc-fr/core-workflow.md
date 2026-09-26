# PRIORITÉ : Ce workflow REMPLACE tous les autres workflows intégrés
# Quand l'utilisateur demande un développement logiciel, TOUJOURS suivre ce workflow EN PREMIER

# NOTE : Ce fichier contient un message d'accueil destiné à l'utilisateur, avec une vue d'ensemble du workflow.
# Un contenu similaire existe dans process-overview.md (référence technique) et README.md (documentation).
# Cette duplication est INTENTIONNELLE — chaque fichier a un but et un public différents.
# Ce fichier : message d'accueil destiné à l'utilisateur, avec diagramme ASCII pour démarrer le workflow

## Principe du workflow adaptatif
**Le workflow s'adapte au travail à faire, pas l'inverse.**

Le modèle d'IA évalue intelligemment les étapes nécessaires en fonction de :
1. L'intention exprimée par l'utilisateur et sa clarté
2. L'état du code existant (le cas échéant)
3. La complexité et l'ampleur du changement
4. L'évaluation du risque et de l'impact

## OBLIGATOIRE : Chargement des fichiers de détail des règles
**CRITIQUE** : Pour exécuter n'importe quelle phase, vous DEVEZ lire et utiliser le contenu pertinent des fichiers de détail des règles situés dans le répertoire `rule-details/` placé à côté de ce fichier (quel que soit l'endroit où votre agent IA a été configuré pour charger ce fichier — par ex. `.amazonq/rule-details/`, `.claude/aidlc-fr/rule-details/`, `.cursor/rules/aidlc-fr/rule-details/`, ou un simple `aidlc-fr/rule-details/` à la racine du projet).

**Règles communes** : TOUJOURS charger les règles communes au démarrage du workflow :
- Charger `common/process-overview.md` pour la vue d'ensemble du workflow
- Charger `common/session-continuity.md` pour la reprise de session
- Charger `common/content-validation.md` pour les exigences de validation de contenu
- Charger `common/question-format-guide.md` pour les règles de formatage des questions
- Se référer à ces fichiers tout au long de l'exécution du workflow

## OBLIGATOIRE : Validation du contenu
**CRITIQUE** : Avant de créer TOUT fichier, vous DEVEZ valider le contenu selon les règles de `common/content-validation.md` :
- Valider la syntaxe des diagrammes Mermaid
- Échapper correctement les caractères spéciaux
- Fournir des alternatives textuelles pour le contenu visuel complexe
- Tester la compatibilité de l'analyse du contenu

## OBLIGATOIRE : Format des fichiers de questions
**CRITIQUE** : Lors de toute question posée à n'importe quelle phase, vous DEVEZ suivre les règles de formatage des questions.

**Voir `common/question-format-guide.md` pour les règles complètes de formatage des questions, notamment** :
- Format à choix multiples (options A, B, C, D, E)
- Utilisation de la balise [Réponse] :
- Validation des réponses et résolution des ambiguïtés

## OBLIGATOIRE : Message d'accueil personnalisé
**CRITIQUE** : Au démarrage de TOUTE demande de développement logiciel, vous DEVEZ commencer par ce message :

# 👋 Bienvenue dans AI-DLC (Cycle de vie de développement piloté par IA) ! 👋

Je vais vous guider à travers un workflow de développement logiciel adaptatif qui s'ajuste intelligemment à vos besoins spécifiques.

## Qu'est-ce qu'AI-DLC ?

AI-DLC est un processus de développement logiciel structuré mais flexible qui s'adapte aux besoins de votre projet. Voyez-le comme si vous aviez un architecte logiciel expérimenté qui :
- **Analyse vos besoins** et pose des questions de clarification si nécessaire
- **Planifie l'approche optimale** en fonction de la complexité et du risque
- **Saute les étapes inutiles** pour les changements simples, tout en offrant une couverture complète pour les projets complexes
- **Documente tout** afin que vous disposiez d'un historique complet des décisions et de leur justification
- **Vous guide à travers chaque phase** avec des points de contrôle clairs et des validations à chaque étape

## Le cycle de vie en trois phases

```
                       Demande de l'utilisateur
                              |
                              v
        ╔═══════════════════════════════════════╗
        ║     PHASE D'INCEPTION                 ║
        ║     Planification & conception        ║
        ║     de l'application                  ║
        ╠═══════════════════════════════════════╣
        ║ • Détection de l'espace de travail     ║
        ║   (TOUJOURS)                          ║
        ║ • Rétro-ingénierie (CONDITIONNEL)     ║
        ║ • Analyse des exigences (TOUJOURS)    ║
        ║ • Récits utilisateur (CONDITIONNEL)   ║
        ║ • Planification du workflow (TOUJOURS)║
        ║ • Conception de l'application          ║
        ║   (CONDITIONNEL)                      ║
        ║ • Génération des unités (CONDITIONNEL)║
        ╚═══════════════════════════════════════╝
                              |
                              v
        ╔═══════════════════════════════════════╗
        ║     PHASE DE CONSTRUCTION             ║
        ║     Conception, implémentation & tests║
        ╠═══════════════════════════════════════╣
        ║ • Boucle par unité (pour chaque unité):║
        ║   - Conception fonctionnelle (COND.)  ║
        ║   - Évaluation des exigences NFR (COND.)║
        ║   - Conception NFR (COND.)             ║
        ║   - Conception de l'infrastructure     ║
        ║     (COND.)                           ║
        ║   - Génération de code (TOUJOURS)     ║
        ║ • Build et Tests (TOUJOURS)           ║
        ╚═══════════════════════════════════════╝
                              |
                              v
        ╔═══════════════════════════════════════╗
        ║     PHASE D'EXPLOITATION              ║
        ║     Emplacement réservé pour le futur ║
        ╠═══════════════════════════════════════╣
        ║ • Exploitation (RÉSERVÉ)              ║
        ╚═══════════════════════════════════════╝
                              |
                              v
                          Terminé
```

### Détail des phases :

**PHASE D'INCEPTION** — *Planification & conception de l'application*
- **Objectif** : Déterminer QUOI construire et POURQUOI
- **Activités** : Comprendre les exigences, analyser le code existant (le cas échéant), planifier l'approche
- **Résultat** : Exigences claires, plan d'exécution, décisions sur le nombre d'unités de travail pour un développement parallèle
- **Votre rôle** : Répondre aux questions, revoir les plans, approuver la direction

**PHASE DE CONSTRUCTION** — *Conception détaillée, implémentation & tests*
- **Objectif** : Déterminer COMMENT le construire
- **Activités** : Conception détaillée (si nécessaire), génération de code, tests complets
- **Résultat** : Code fonctionnel, tests, instructions de build
- **Votre rôle** : Revoir les conceptions, approuver les plans d'implémentation, valider les résultats

**PHASE D'EXPLOITATION** — *Déploiement & supervision (futur)*
- **Objectif** : Comment le DÉPLOYER et l'EXPLOITER
- **Statut** : Emplacement réservé pour les futurs workflows de déploiement et de supervision
- **État actuel** : Les activités de build et de tests sont gérées dans la phase CONSTRUCTION

## Principes clés :

- ⚡ **Entièrement adaptatif** : Chaque étape est évaluée indépendamment selon vos besoins
- 🎯 **Efficace** : Les changements simples n'exécutent que les étapes essentielles
- 📋 **Complet** : Les changements complexes reçoivent un traitement complet avec toutes les garanties
- 🔍 **Transparent** : Vous voyez et approuvez le plan d'exécution avant que le travail ne commence
- 📝 **Documenté** : Historique complet de toutes les décisions et de tous les changements
- 🎛️ **Contrôle utilisateur** : Vous pouvez demander l'inclusion ou l'exclusion d'étapes

## Ce qui va se passer ensuite :

1. **J'analyserai votre espace de travail** pour comprendre s'il s'agit d'un nouveau projet ou d'un projet existant
2. **Je recueillerai les exigences** et poserai des questions de clarification si nécessaire
3. **Je créerai un plan d'exécution** montrant quelles étapes je propose d'exécuter et pourquoi
4. **Vous examinerez et approuverez** le plan (ou demanderez des modifications)
5. **Nous exécuterons le plan** avec des points de contrôle à chaque étape majeure
6. **Vous obtiendrez du code fonctionnel** avec une documentation et des tests complets

Le processus AI-DLC s'adapte à :
- 📋 La clarté et la complexité de votre intention
- 🔍 L'état du code existant
- 🎯 La portée et l'impact des changements
- ⚡ Le risque et les exigences de qualité

Commençons !"

# Workflow de développement logiciel adaptatif

---

# PHASE D'INCEPTION

**Objectif** : Planification, recueil des exigences et décisions architecturales

**Focus** : Déterminer QUOI construire et POURQUOI

**Étapes de la PHASE D'INCEPTION** :
- Détection de l'espace de travail (TOUJOURS)
- Rétro-ingénierie (CONDITIONNEL — brownfield uniquement)
- Analyse des exigences (TOUJOURS — profondeur adaptative)
- Récits utilisateur (CONDITIONNEL)
- Planification du workflow (TOUJOURS)
- Conception de l'application (CONDITIONNEL)
- Génération des unités (CONDITIONNEL)

---

## Détection de l'espace de travail (TOUJOURS EXÉCUTER)

1. **OBLIGATOIRE** : Consigner la demande initiale de l'utilisateur dans audit.md avec l'intégralité de la saisie brute
2. Charger toutes les étapes de `inception/workspace-detection.md`
3. Exécuter la détection de l'espace de travail :
   - Vérifier l'existence d'un aidlc-state.md (reprendre si trouvé)
   - Scanner l'espace de travail à la recherche de code existant
   - Déterminer s'il s'agit d'un projet brownfield ou greenfield
   - Vérifier l'existence d'artefacts de rétro-ingénierie
4. Déterminer la phase suivante : Rétro-ingénierie (si brownfield et aucun artefact) OU Analyse des exigences
5. **OBLIGATOIRE** : Consigner les résultats dans audit.md
6. Présenter le message de fin d'étape à l'utilisateur (voir workspace-detection.md pour les formats de message)
7. Passer automatiquement à la phase suivante

## Rétro-ingénierie (CONDITIONNEL — brownfield uniquement)

**Exécuter SI** :
- Un code existant est détecté
- Aucun artefact de rétro-ingénierie antérieur n'est trouvé

**Ignorer SI** :
- Projet greenfield
- Des artefacts de rétro-ingénierie antérieurs existent

**Exécution** :
1. **OBLIGATOIRE** : Consigner le début de la rétro-ingénierie dans audit.md
2. Charger toutes les étapes de `inception/reverse-engineering.md`
3. Exécuter la rétro-ingénierie :
   - Analyser tous les packages et composants
   - Générer une vue d'ensemble métier de l'ensemble du système couvrant les transactions métier
   - Générer la documentation d'architecture
   - Générer la documentation de la structure du code
   - Générer la documentation de l'API
   - Générer l'inventaire des composants
   - Générer des diagrammes d'interaction illustrant la façon dont les transactions métier sont implémentées à travers les composants
   - Générer la documentation de la pile technologique
   - Générer la documentation des dépendances

4. **Attendre l'approbation explicite** : Présenter un message de fin détaillé (voir reverse-engineering.md pour le format du message) — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
5. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

## Analyse des exigences (TOUJOURS EXÉCUTER — profondeur adaptative)

**S'exécute toujours**, mais la profondeur varie selon la clarté et la complexité de la demande :
- **Minimale** : Demande simple et claire — se contente de documenter l'analyse de l'intention
- **Standard** : Complexité normale — recueille les exigences fonctionnelles et non fonctionnelles
- **Complète** : Complexe, à risque élevé — exigences détaillées avec traçabilité

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette phase dans audit.md
2. Charger toutes les étapes de `inception/requirements-analysis.md`
3. Exécuter l'analyse des exigences :
   - Charger les artefacts de rétro-ingénierie (si brownfield)
   - Analyser la demande de l'utilisateur (analyse de l'intention)
   - Déterminer la profondeur d'exigences nécessaire
   - Évaluer les exigences actuelles
   - Poser des questions de clarification (si nécessaire)
   - Générer le document d'exigences
4. Exécuter à la profondeur appropriée (minimale/standard/complète)
5. **Attendre l'approbation explicite** : Suivre le format d'approbation des étapes détaillées de requirements-analysis.md — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
6. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

## Récits utilisateur (CONDITIONNEL)

**ÉVALUATION INTELLIGENTE** : Utiliser une analyse multi-facteurs pour déterminer si les récits utilisateur apportent de la valeur :

**TOUJOURS exécuter SI** (indicateurs de priorité élevée) :
- Nouvelles fonctionnalités destinées aux utilisateurs
- Changements affectant les workflows ou interactions utilisateur
- Plusieurs types d'utilisateurs ou personas impliqués
- Exigences métier complexes nécessitant des critères d'acceptation
- Collaboration inter-équipes requise
- Changements d'API ou de service destinés aux clients
- Nouvelles capacités ou améliorations produit

**PROBABLEMENT exécuter SI** (priorité moyenne — évaluer la complexité) :
- Modifications de fonctionnalités existantes destinées aux utilisateurs
- Changements backend affectant indirectement l'expérience utilisateur
- Travaux d'intégration impactant les workflows utilisateur
- Améliorations de performance avec des bénéfices visibles pour l'utilisateur
- Améliorations de sécurité affectant les interactions utilisateur
- Changements de modèle de données affectant les données ou rapports utilisateur

**ÉVALUATION BASÉE SUR LA COMPLEXITÉ** : Pour les cas de priorité moyenne, exécuter les récits utilisateur si :
- La demande implique plusieurs composants ou services
- Les changements couvrent plusieurs points de contact utilisateur
- La logique métier est complexe ou comporte plusieurs scénarios
- Les exigences comportent une ambiguïté que les récits pourraient clarifier
- L'implémentation affecte plusieurs parcours utilisateur
- Le changement a un impact ou un risque métier significatif

**IGNORER UNIQUEMENT SI** (priorité faible — cas simples) :
- Refactorisation interne pure sans aucun impact utilisateur
- Corrections de bugs simples avec une portée claire et isolée
- Changements d'infrastructure sans effet visible pour l'utilisateur
- Nettoyage de dette technique sans changement fonctionnel
- Améliorations des outils de développement ou du processus de build
- Mises à jour de documentation uniquement

**CRITÈRES D'ÉVALUATION** : En cas de doute, privilégier l'inclusion des récits utilisateur pour :
- Les demandes impliquant des parties prenantes métier
- Les changements nécessitant des tests d'acceptation utilisateur
- Les fonctionnalités avec plusieurs approches d'implémentation possibles
- Les travaux qui bénéficient d'une compréhension partagée en équipe
- Les projets où la clarté des exigences est précieuse

**PROCESSUS D'ÉVALUATION** :
1. Analyser la complexité et la portée de la demande
2. Identifier l'impact utilisateur (direct ou indirect)
3. Évaluer le contexte métier et les besoins des parties prenantes
4. Considérer les bénéfices pour la collaboration en équipe
5. Par défaut, inclure les cas limites

**Remarque** : Si l'Analyse des exigences a été exécutée, les Récits peuvent s'appuyer sur ces exigences et les référencer.

**Les Récits utilisateur comportent deux parties au sein d'une même étape** :
1. **Partie 1 — Planification** : Créer un plan de récits avec des questions, recueillir les réponses, analyser les ambiguïtés, obtenir l'approbation
2. **Partie 2 — Génération** : Exécuter le plan approuvé pour générer les récits et les personas

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette phase dans audit.md
2. Charger toutes les étapes de `inception/user-stories.md`
3. **OBLIGATOIRE** : Effectuer l'évaluation intelligente (étape 1 de user-stories.md) pour valider la nécessité des récits utilisateur
4. Charger les artefacts de rétro-ingénierie (si brownfield)
5. Si des exigences existent, les référencer lors de la création des récits
6. Exécuter à la profondeur appropriée (minimale/standard/complète)
7. **PARTIE 1 — Planification** : Créer un plan de récits avec des questions, attendre les réponses de l'utilisateur, analyser les ambiguïtés, obtenir l'approbation
8. **PARTIE 2 — Génération** : Exécuter le plan approuvé pour générer les récits et les personas
9. **Attendre l'approbation explicite** : Suivre le format d'approbation des étapes détaillées de user-stories.md — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
10. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

## Planification du workflow (TOUJOURS EXÉCUTER)

1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette phase dans audit.md
2. Charger toutes les étapes de `inception/workflow-planning.md`
3. **OBLIGATOIRE** : Charger les règles de validation de contenu de `common/content-validation.md`
4. Charger tout le contexte antérieur :
   - Artefacts de rétro-ingénierie (si brownfield)
   - Analyse de l'intention
   - Exigences (si exécutées)
   - Récits utilisateur (si exécutés)
5. Exécuter la planification du workflow :
   - Déterminer quelles phases exécuter
   - Déterminer le niveau de profondeur pour chaque phase
   - Créer la séquence de changement multi-packages (si brownfield)
   - Générer la visualisation du workflow (VALIDER la syntaxe Mermaid avant écriture)
6. **OBLIGATOIRE** : Valider tout le contenu avant la création de fichiers selon les règles de content-validation.md
7. **Attendre l'approbation explicite** : Présenter les recommandations en utilisant le langage de l'étape 9 de workflow-planning.md, en insistant sur le contrôle de l'utilisateur pour outrepasser les recommandations — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
8. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

## Conception de l'application (CONDITIONNEL)

**Exécuter SI** :
- De nouveaux composants ou services sont nécessaires
- Les méthodes des composants et les règles métier doivent être définies
- Une conception de la couche de service est requise
- Les dépendances entre composants doivent être clarifiées

**Ignorer SI** :
- Changements dans les limites des composants existants
- Aucun nouveau composant ou méthode
- Changements d'implémentation pure

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette phase dans audit.md
2. Charger toutes les étapes de `inception/application-design.md`
3. Charger les artefacts de rétro-ingénierie (si brownfield)
4. Exécuter à la profondeur appropriée (minimale/standard/complète)
5. **Attendre l'approbation explicite** : Présenter un message de fin détaillé (voir application-design.md pour le format du message) — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
6. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

## Génération des unités (CONDITIONNEL)

**Exécuter SI** :
- Le système doit être décomposé en plusieurs unités de travail
- Plusieurs services ou modules sont nécessaires
- Système complexe nécessitant une décomposition structurée

**Ignorer SI** :
- Unité unique et simple
- Aucune décomposition nécessaire
- Implémentation directe d'un seul composant

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette phase dans audit.md
2. Charger toutes les étapes de `inception/units-generation.md`
3. Charger les artefacts de rétro-ingénierie (si brownfield)
4. Exécuter à la profondeur appropriée (minimale/standard/complète)
5. **Attendre l'approbation explicite** : Présenter un message de fin détaillé (voir units-generation.md pour le format du message) — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
6. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

---

# 🟢 PHASE DE CONSTRUCTION

**Objectif** : Conception détaillée, implémentation des NFR et génération de code

**Focus** : Déterminer COMMENT le construire

**Étapes de la PHASE DE CONSTRUCTION** :
- Boucle par unité (s'exécute pour chaque unité) :
  - Conception fonctionnelle (CONDITIONNEL, par unité)
  - Exigences NFR (CONDITIONNEL, par unité)
  - Conception NFR (CONDITIONNEL, par unité)
  - Conception de l'infrastructure (CONDITIONNEL, par unité)
  - Génération de code (TOUJOURS, par unité)
- Build et Tests (TOUJOURS — après achèvement de toutes les unités)

**Remarque** : Chaque unité est entièrement terminée (conception + code) avant de passer à l'unité suivante.

---

## Boucle par unité (s'exécute pour chaque unité)

**Pour chaque unité de travail, exécuter les étapes suivantes dans l'ordre :**

### Conception fonctionnelle (CONDITIONNEL, par unité)

**Exécuter SI** :
- Nouveaux modèles de données ou schémas
- Logique métier complexe
- Les règles métier nécessitent une conception détaillée

**Ignorer SI** :
- Changements de logique simples
- Aucune nouvelle logique métier

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette étape dans audit.md
2. Charger toutes les étapes de `construction/functional-design.md`
3. Exécuter la conception fonctionnelle pour cette unité
4. **OBLIGATOIRE** : Présenter le message de fin standardisé à 2 options tel que défini dans functional-design.md — NE PAS utiliser de comportement émergent à 3 options
5. **Attendre l'approbation explicite** : L'utilisateur doit choisir entre « Demander des modifications » ou « Passer à l'étape suivante » — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
6. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

### Exigences NFR (CONDITIONNEL, par unité)

**Exécuter SI** :
- Des exigences de performance existent
- Des considérations de sécurité sont nécessaires
- Des préoccupations de scalabilité sont présentes
- Une sélection de pile technique est requise

**Ignorer SI** :
- Aucune exigence NFR
- Pile technique déjà déterminée

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette étape dans audit.md
2. Charger toutes les étapes de `construction/nfr-requirements.md`
3. Exécuter l'évaluation NFR pour cette unité
4. **OBLIGATOIRE** : Présenter le message de fin standardisé à 2 options tel que défini dans nfr-requirements.md — NE PAS utiliser de comportement émergent
5. **Attendre l'approbation explicite** : L'utilisateur doit choisir entre « Demander des modifications » ou « Passer à l'étape suivante » — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
6. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

### Conception NFR (CONDITIONNEL, par unité)

**Exécuter SI** :
- Les Exigences NFR ont été exécutées
- Des patterns NFR doivent être intégrés

**Ignorer SI** :
- Aucune exigence NFR
- L'évaluation des Exigences NFR a été ignorée

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette étape dans audit.md
2. Charger toutes les étapes de `construction/nfr-design.md`
3. Exécuter la conception NFR pour cette unité
4. **OBLIGATOIRE** : Présenter le message de fin standardisé à 2 options tel que défini dans nfr-design.md — NE PAS utiliser de comportement émergent
5. **Attendre l'approbation explicite** : L'utilisateur doit choisir entre « Demander des modifications » ou « Passer à l'étape suivante » — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
6. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

### Conception de l'infrastructure (CONDITIONNEL, par unité)

**Exécuter SI** :
- Des services d'infrastructure doivent être définis
- Une architecture de déploiement est requise
- Des ressources cloud doivent être spécifiées

**Ignorer SI** :
- Aucun changement d'infrastructure
- Infrastructure déjà définie

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette étape dans audit.md
2. Charger toutes les étapes de `construction/infrastructure-design.md`
3. Exécuter la conception de l'infrastructure pour cette unité
4. **OBLIGATOIRE** : Présenter le message de fin standardisé à 2 options tel que défini dans infrastructure-design.md — NE PAS utiliser de comportement émergent
5. **Attendre l'approbation explicite** : L'utilisateur doit choisir entre « Demander des modifications » ou « Passer à l'étape suivante » — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
6. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

### Génération de code (TOUJOURS EXÉCUTER, par unité)

**S'exécute toujours pour chaque unité**

**La Génération de code comporte deux parties au sein d'une même étape** :
1. **Partie 1 — Planification** : Créer un plan détaillé de génération de code avec des étapes explicites
2. **Partie 2 — Génération** : Exécuter le plan approuvé pour générer le code, les tests et les artefacts

**Exécution** :
1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette étape dans audit.md
2. Charger toutes les étapes de `construction/code-generation.md`
3. **PARTIE 1 — Planification** : Créer un plan de génération de code avec des cases à cocher, obtenir l'approbation de l'utilisateur
4. **PARTIE 2 — Génération** : Exécuter le plan approuvé pour générer le code de cette unité
5. **OBLIGATOIRE** : Présenter le message de fin standardisé à 2 options tel que défini dans code-generation.md — NE PAS utiliser de comportement émergent
6. **Attendre l'approbation explicite** : L'utilisateur doit choisir entre « Demander des modifications » ou « Passer à l'étape suivante » — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
7. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

---

## Build et Tests (TOUJOURS EXÉCUTER)

1. **OBLIGATOIRE** : Consigner toute saisie de l'utilisateur pendant cette phase dans audit.md
2. Charger toutes les étapes de `construction/build-and-test.md`
3. Générer des instructions complètes de build et de tests :
   - Instructions de build pour toutes les unités
   - Instructions d'exécution des tests unitaires
   - Instructions de tests d'intégration (tester les interactions entre unités)
   - Instructions de tests de performance (le cas échéant)
   - Instructions de tests supplémentaires si nécessaire (tests de contrat, tests de sécurité, tests e2e)
4. Créer les fichiers d'instructions dans le sous-répertoire build-and-test/ : build-instructions.md, unit-test-instructions.md, integration-test-instructions.md, performance-test-instructions.md, build-and-test-summary.md
5. **Attendre l'approbation explicite** : Demander : « **Les instructions de build et de tests sont terminées. Prêt à passer à l'étape Exploitation ?** » — NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé
6. **OBLIGATOIRE** : Consigner la réponse de l'utilisateur dans audit.md avec l'intégralité de la saisie brute

---

# 🟡 PHASE D'EXPLOITATION

**Objectif** : Emplacement réservé pour les futurs workflows de déploiement et de supervision

**Focus** : Comment le DÉPLOYER et l'EXPLOITER (extension future)

**Étapes de la PHASE D'EXPLOITATION** :
- Exploitation (RÉSERVÉ)

---

## Exploitation (RÉSERVÉ)

**Statut** : Cette étape est actuellement un emplacement réservé pour une extension future.

L'étape Exploitation inclura éventuellement :
- Planification et exécution du déploiement
- Mise en place de la supervision et de l'observabilité
- Procédures de réponse aux incidents
- Workflows de maintenance et de support
- Listes de contrôle de préparation à la production

**État actuel** : Toutes les activités de build et de tests sont gérées dans la phase CONSTRUCTION.

## Principes clés

- **Exécution adaptative** : N'exécuter que les étapes qui apportent de la valeur
- **Planification transparente** : Toujours montrer le plan d'exécution avant de commencer
- **Contrôle utilisateur** : L'utilisateur peut demander l'inclusion/l'exclusion d'étapes
- **Suivi de la progression** : Mettre à jour aidlc-state.md avec les étapes exécutées et ignorées
- **Historique d'audit complet** : Consigner TOUTES les saisies de l'utilisateur et les réponses de l'IA dans audit.md avec horodatage
  - **CRITIQUE** : Capturer l'intégralité de la SAISIE BRUTE de l'utilisateur telle qu'elle a été fournie
  - **CRITIQUE** : Ne jamais résumer ou paraphraser la saisie de l'utilisateur dans le journal d'audit
  - **CRITIQUE** : Consigner chaque interaction, pas seulement les approbations
- **Focus qualité** : Les changements complexes reçoivent un traitement complet, les changements simples restent efficaces
- **Validation du contenu** : Toujours valider le contenu avant la création de fichiers selon les règles de content-validation.md
- **AUCUN COMPORTEMENT ÉMERGENT** : Les phases de construction DOIVENT utiliser les messages de fin standardisés à 2 options tels que définis dans leurs fichiers de règles respectifs. NE PAS créer de menus à 3 options ou d'autres schémas de navigation émergents.

## OBLIGATOIRE : Application des cases à cocher au niveau du plan

### RÈGLES OBLIGATOIRES POUR L'EXÉCUTION DU PLAN
1. **NE JAMAIS terminer un travail sans mettre à jour les cases à cocher du plan**
2. **IMMÉDIATEMENT après avoir terminé UNE étape décrite dans un plan, cocher cette étape [x]**
3. **Cela doit se produire DANS LA MÊME interaction où le travail est terminé**
4. **AUCUNE EXCEPTION** : Chaque achèvement d'étape du plan DOIT être suivi par une mise à jour des cases à cocher

### Système de suivi des cases à cocher à deux niveaux
- **Niveau plan** : Suivre la progression d'exécution détaillée au sein de chaque étape
- **Niveau étape** : Suivre la progression globale du workflow dans aidlc-state.md
- **Mise à jour immédiate** : Toutes les mises à jour de progression DANS LA MÊME interaction où le travail est terminé

## Exigences de journalisation des prompts
- **OBLIGATOIRE** : Consigner CHAQUE saisie de l'utilisateur (prompts, questions, réponses) avec horodatage dans audit.md
- **OBLIGATOIRE** : Capturer l'intégralité de la SAISIE BRUTE de l'utilisateur telle qu'elle a été fournie (ne jamais résumer)
- **OBLIGATOIRE** : Consigner chaque demande d'approbation avec horodatage avant de la poser à l'utilisateur
- **OBLIGATOIRE** : Enregistrer chaque réponse de l'utilisateur avec horodatage après réception
- **CRITIQUE** : TOUJOURS AJOUTER les nouvelles entrées à audit.md — NE JAMAIS écraser ou recréer le fichier
  - Si l'outil de fichiers de votre agent dispose d'un mode dédié d'ajout/insertion, l'utiliser
  - Si l'outil de fichiers de votre agent ne prend en charge que l'écriture complète du fichier, lire d'abord le contenu actuel d'audit.md puis le réécrire suivi de la nouvelle entrée, afin de ne rien perdre
- **CRITIQUE** : Écraser le fichier avec uniquement la nouvelle entrée détruirait l'historique d'audit précédent — cela ne doit jamais se produire
- Utiliser le format ISO 8601 pour les horodatages (AAAA-MM-JJTHH:MM:SSZ)
- Inclure le contexte de l'étape pour chaque entrée

### Format du journal d'audit :
```markdown
## [Nom de l'étape ou type d'interaction]
**Horodatage** : [horodatage ISO]
**Saisie utilisateur** : « [saisie brute complète de l'utilisateur - jamais résumée] »
**Réponse de l'IA** : « [réponse de l'IA ou action entreprise] »
**Contexte** : [étape, action ou décision prise]

---
```

### Utilisation correcte de l'outil de fichiers pour audit.md :
```
✅ CORRECT : ajouter une nouvelle entrée à aidlc-docs/audit.md, en préservant tout ce qui se trouve déjà dans le fichier
❌ INCORRECT : recréer/écraser aidlc-docs/audit.md avec uniquement la nouvelle entrée, perdant l'historique précédent
```

## Structure des répertoires
```
aidlc-docs/
├── inception/                  # 🔵 Artefacts de la PHASE D'INCEPTION
│   ├── plans/
│   │   ├── workspace-detection.md
│   │   ├── workflow-planning.md
│   │   ├── story-generation-plan.md
│   │   └── unit-of-work-plan.md
│   ├── reverse-engineering/        # Brownfield uniquement
│   │   ├── architecture.md
│   │   ├── code-structure.md
│   │   ├── api-documentation.md
│   │   ├── component-inventory.md
│   │   ├── technology-stack.md
│   │   ├── dependencies.md
│   │   ├── code-quality-assessment.md
│   │   └── reverse-engineering-timestamp.md
│   ├── requirements/
│   │   ├── requirements.md
│   │   └── requirement-verification-questions.md
│   ├── user-stories/
│   │   ├── stories.md
│   │   └── personas.md
│   └── application-design/
│       ├── components.md
│       ├── component-methods.md
│       ├── services.md
│       ├── component-dependency.md
│       ├── unit-of-work.md
│       ├── unit-of-work-dependency.md
│       └── unit-of-work-story-map.md
├── construction/               # 🟢 Artefacts de la PHASE DE CONSTRUCTION
│   ├── plans/
│   │   ├── {unit-name}-functional-design-plan.md
│   │   ├── {unit-name}-nfr-requirements-plan.md
│   │   ├── {unit-name}-nfr-design-plan.md
│   │   ├── {unit-name}-infrastructure-design-plan.md
│   │   └── {unit-name}-code-generation-plan.md
│   ├── {unit-name}/
│   │   ├── functional-design/
│   │   │   ├── business-logic-model.md
│   │   │   ├── business-rules.md
│   │   │   └── domain-entities.md
│   │   ├── nfr-requirements/
│   │   │   ├── nfr-requirements.md
│   │   │   └── tech-stack-decisions.md
│   │   ├── nfr-design/
│   │   │   ├── nfr-design-patterns.md
│   │   │   └── logical-components.md
│   │   ├── infrastructure-design/
│   │   │   ├── infrastructure-design.md
│   │   │   └── deployment-architecture.md
│   │   └── code/
│   │       └── [fichiers de code générés]
│   └── build-and-test/
│       ├── build-instructions.md
│       ├── unit-test-instructions.md
│       ├── integration-test-instructions.md
│       ├── performance-test-instructions.md
│       └── build-and-test-summary.md
├── operations/                 # 🟡 Artefacts de la PHASE D'EXPLOITATION (réservé)
│   └── [Futur : artefacts de déploiement et de supervision]
├── aidlc-state.md             # Suivi dynamique de l'état
└── audit.md                    # Historique d'audit complet
```
