# Analyse des exigences (adaptative)

**Adopte le rôle** d'un product owner

**Phase adaptative** : S'exécute toujours. Le niveau de détail s'adapte à la complexité du problème.

**Voir [depth-levels.md](../common/depth-levels.md) pour l'explication de la profondeur adaptative**

## Prérequis
- La Détection de l'espace de travail doit être terminée
- La Rétro-ingénierie doit être terminée (si brownfield)

## Étapes d'exécution

### Étape 1 : Charger le contexte de rétro-ingénierie (si disponible)

**SI projet brownfield** :
- Charger `aidlc-docs/inception/reverse-engineering/architecture.md`
- Charger `aidlc-docs/inception/reverse-engineering/component-inventory.md`
- Charger `aidlc-docs/inception/reverse-engineering/technology-stack.md`
- Utiliser ces éléments pour comprendre le système existant lors de l'analyse de la demande

### Étape 2 : Analyser la demande de l'utilisateur (analyse de l'intention)

#### 2.1 Clarté de la demande
- **Claire** : Spécifique, bien définie, exploitable
- **Vague** : Générale, ambiguë, nécessite des clarifications
- **Incomplète** : Informations clés manquantes

#### 2.2 Type de demande
- **Nouvelle fonctionnalité** : Ajout d'une nouvelle fonctionnalité
- **Correction de bug** : Résolution d'un problème existant
- **Refactorisation** : Amélioration de la structure du code
- **Mise à niveau** : Mise à jour des dépendances ou frameworks
- **Migration** : Passage à une autre technologie
- **Amélioration** : Amélioration d'une fonctionnalité existante
- **Nouveau projet** : Démarrage à partir de zéro

#### 2.3 Estimation initiale de la portée
- **Fichier unique** : Changements dans un seul fichier
- **Composant unique** : Changements dans un seul composant/package
- **Composants multiples** : Changements couvrant plusieurs composants
- **Échelle système** : Changements affectant l'ensemble du système
- **Multi-systèmes** : Changements affectant plusieurs systèmes

#### 2.4 Estimation initiale de la complexité
- **Triviale** : Changement simple et direct
- **Simple** : Chemin d'implémentation clair
- **Modérée** : Une certaine complexité, plusieurs points à considérer
- **Complexe** : Complexité significative, nombreux points à considérer

### Étape 3 : Déterminer la profondeur des exigences

**Sur la base de l'analyse de la demande, déterminer la profondeur :**

**Profondeur minimale** — À utiliser quand :
- La demande est claire et simple
- Aucune exigence détaillée n'est nécessaire
- Il suffit de documenter la compréhension de base

**Profondeur standard** — À utiliser quand :
- La demande nécessite des clarifications
- Des exigences fonctionnelles et non fonctionnelles sont nécessaires
- Complexité normale

**Profondeur complète** — À utiliser quand :
- Projet complexe avec plusieurs parties prenantes
- Risque élevé ou système critique
- Des exigences détaillées avec traçabilité sont nécessaires

### Étape 4 : Évaluer les exigences actuelles

Analyser tout ce que l'utilisateur a fourni :
   - Déclarations ou descriptions d'intention (déjà consignées dans audit.md)
   - Documents d'exigences existants (rechercher dans l'espace de travail si mentionné)
   - Contenu collé ou références de fichiers
   - Convertir tout document non-markdown au format markdown

### Étape 5 : Analyse approfondie de l'exhaustivité

**CRITIQUE** : Utiliser une analyse complète pour évaluer l'exhaustivité des exigences. Par défaut, poser des questions dès qu'il existe UNE ambiguïté ou un détail manquant.

**OBLIGATOIRE** : Évaluer TOUS ces domaines et poser des questions pour TOUT élément peu clair :
- **Exigences fonctionnelles** : Fonctionnalités clés, interactions utilisateur, comportements du système
- **Exigences non fonctionnelles** : Performance, sécurité, scalabilité, utilisabilité
- **Scénarios utilisateur** : Cas d'usage, parcours utilisateur, cas limites, scénarios d'erreur
- **Contexte métier** : Objectifs, contraintes, critères de succès, besoins des parties prenantes
- **Contexte technique** : Points d'intégration, exigences de données, limites du système
- **Attributs de qualité** : Fiabilité, maintenabilité, testabilité, accessibilité

**En cas de doute, poser des questions** — des exigences incomplètes mènent à de mauvaises implémentations.

### Étape 6 : Générer des questions de clarification (APPROCHE PROACTIVE)
   - **TOUJOURS** créer `aidlc-docs/inception/requirements/requirement-verification-questions.md`, sauf si les exigences sont exceptionnellement claires et complètes
   - Poser des questions sur TOUT domaine manquant, peu clair ou ambigu
   - Se concentrer sur les exigences fonctionnelles, les exigences non fonctionnelles, les scénarios utilisateur et le contexte métier
   - Demander à l'utilisateur de renseigner toutes les balises [Réponse] : directement dans le document de questions
   - Si des options à choix multiples sont présentées pour les réponses :
     - Étiqueter les options A, B, C, D, etc.
     - S'assurer que les options sont mutuellement exclusives et ne se chevauchent pas
     - TOUJOURS inclure une option de réponse personnalisée : « X) Autre (veuillez décrire après la balise [Réponse] : ci-dessous) »
   - Attendre les réponses de l'utilisateur dans le document
   - **OBLIGATOIRE** : Analyser TOUTES les réponses à la recherche d'ambiguïtés et créer des questions de suivi si nécessaire
   - **OBLIGATOIRE** : Continuer à poser des questions jusqu'à ce que TOUTES les ambiguïtés soient résolues OU que l'utilisateur demande explicitement de continuer

### Étape 7 : Générer le document d'exigences
   - Créer `aidlc-docs/inception/requirements/requirements.md`
   - Inclure un résumé de l'analyse de l'intention en haut du document :
     - Demande de l'utilisateur
     - Type de demande
     - Estimation de la portée
     - Estimation de la complexité
   - Inclure à la fois les exigences fonctionnelles et non fonctionnelles
   - Intégrer les réponses de l'utilisateur aux questions de clarification
   - Fournir un bref résumé des exigences clés

### Étape 8 : Mettre à jour le suivi d'état

Mettre à jour `aidlc-docs/aidlc-state.md` :

```markdown
## Progression des étapes
### 🔵 PHASE D'INCEPTION
- [x] Détection de l'espace de travail
- [x] Rétro-ingénierie (le cas échéant)
- [x] Analyse des exigences
```

### Étape 9 : Consigner et poursuivre
   - Consigner la demande d'approbation avec horodatage dans `aidlc-docs/audit.md`
   - Présenter le message de fin selon cette structure :
     1. **Annonce de fin** (obligatoire) : Toujours commencer par ceci :

```markdown
# 🔍 Analyse des exigences terminée
```

     2. **Résumé de l'IA** (optionnel) : Fournir un résumé structuré des exigences sous forme de puces
        - Format : « L'analyse des exigences a identifié [type de projet/complexité] : »
        - Lister les exigences fonctionnelles clés (puces)
        - Lister les exigences non fonctionnelles clés (puces)
        - Mentionner les considérations architecturales ou décisions techniques si pertinent
        - NE PAS inclure d'instructions de workflow (« veuillez examiner », « faites-moi savoir », « passer à la phase suivante », « avant de continuer »)
        - Rester factuel et centré sur le contenu
     3. **Message de workflow formaté** (obligatoire) : Toujours terminer avec exactement ce format :

```markdown
> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner le document d'exigences à : `aidlc-docs/inception/requirements/requirements.md`



> **🚀 <u>**ET ENSUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** — Demander des modifications aux exigences si nécessaire après votre examen
> [SI l'étape Récits utilisateur sera ignorée, ajouter cette option :]
> 📝 **Ajouter les récits utilisateur** — Choisir d'inclure l'étape **Récits utilisateur** (actuellement ignorée en raison de la simplicité du projet)
> ✅ **Approuver et continuer** — Approuver les exigences et passer à **[Récits utilisateur/Planification du workflow]**

---
```

**Remarque** : N'inclure l'option « Ajouter les récits utilisateur » que lorsque l'étape Récits utilisateur sera ignorée. Remplacer [Récits utilisateur/Planification du workflow] par le nom réel de la phase suivante.

   - Attendre l'approbation explicite de l'utilisateur avant de continuer
   - Enregistrer la réponse d'approbation avec horodatage
   - Mettre à jour l'étape Analyse des exigences comme terminée dans aidlc-state.md
