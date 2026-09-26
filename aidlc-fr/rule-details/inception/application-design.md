# Conception de l'application — Étapes détaillées

## Objectif
**Identification des composants de haut niveau et conception de la couche de service**

La Conception de l'application se concentre sur :
- L'identification des principaux composants fonctionnels et de leurs responsabilités
- La définition des interfaces de composants (pas la logique métier détaillée)
- La conception de la couche de service pour l'orchestration
- L'établissement des dépendances entre composants et des schémas de communication

**Remarque** : La conception détaillée de la logique métier a lieu plus tard, dans la Conception fonctionnelle (par unité, phase CONSTRUCTION)

## Prérequis
- L'évaluation du contexte doit être terminée
- L'évaluation des exigences est recommandée (fournit le contexte fonctionnel)
- Le développement des récits est recommandé (les récits utilisateur guident les décisions de conception)
- Le plan d'exécution doit indiquer que l'étape Conception de l'application doit s'exécuter

## Exécution étape par étape

### 1. Analyser le contexte
- Lire `aidlc-docs/inception/requirements/requirements.md` et `aidlc-docs/inception/user-stories/stories.md`
- Identifier les capacités métier clés et les domaines fonctionnels
- Déterminer la portée et la complexité de la conception

### 2. Créer le plan de conception de l'application
- Générer un plan avec des cases à cocher [] pour la conception de l'application
- Se concentrer sur les composants, responsabilités, méthodes, règles métier et services
- Chaque étape et sous-étape doit avoir une case à cocher []

### 3. Inclure les artefacts de conception obligatoires dans le plan
- **TOUJOURS** inclure ces artefacts obligatoires dans le plan de conception :
  - [ ] Générer components.md avec les définitions des composants et leurs responsabilités de haut niveau
  - [ ] Générer component-methods.md avec les signatures de méthodes (les règles métier seront détaillées plus tard dans la Conception fonctionnelle)
  - [ ] Générer services.md avec les définitions de services et les schémas d'orchestration
  - [ ] Générer component-dependency.md avec les relations de dépendance et les schémas de communication
  - [ ] Valider l'exhaustivité et la cohérence de la conception

### 4. Générer des questions adaptées au contexte
**DIRECTIVE** : Analyser les exigences et les récits pour générer UNIQUEMENT des questions pertinentes pour CETTE conception d'application spécifique. Utiliser les catégories ci-dessous comme source d'inspiration, PAS comme une checklist obligatoire. Ignorer des catégories entières si elles ne sont pas applicables.

- INTÉGRER les questions en utilisant le format de balise [Réponse] :
- Se concentrer sur les ambiguïtés et informations manquantes spécifiques à ce contexte
- Générer des questions uniquement là où la contribution de l'utilisateur est nécessaire pour les décisions de conception

**Exemples de catégories de questions** (adapter selon les besoins) :
- **Identification des composants** — Uniquement si les limites ou l'organisation des composants sont peu claires
- **Méthodes des composants** — Uniquement si les signatures de méthodes nécessitent une clarification (les règles métier détaillées viendront plus tard)
- **Conception de la couche de service** — Uniquement si l'orchestration ou les limites des services sont ambiguës
- **Dépendances entre composants** — Uniquement si les schémas de communication ou la gestion des dépendances sont peu clairs
- **Patterns de conception** — Uniquement si le style architectural ou le choix de pattern nécessite la contribution de l'utilisateur

### 5. Enregistrer le plan de conception de l'application
- Enregistrer sous `aidlc-docs/inception/plans/application-design-plan.md`
- Inclure toutes les balises [Réponse] : pour la saisie de l'utilisateur
- S'assurer que le plan couvre tous les aspects de la conception

### 6. Demander la contribution de l'utilisateur
- Demander à l'utilisateur de renseigner les balises [Réponse] : directement dans le document de plan
- Souligner l'importance des décisions de conception
- Fournir des instructions claires pour compléter les balises [Réponse] :

### 7. Recueillir les réponses
- Attendre que l'utilisateur fournisse les réponses à toutes les questions en utilisant les balises [Réponse] : dans le document
- Ne pas continuer tant que TOUTES les balises [Réponse] : ne sont pas complétées
- Examiner le document pour s'assurer qu'aucune balise [Réponse] : n'est laissée vide

### 8. ANALYSER LES RÉPONSES (OBLIGATOIRE)
Avant de continuer, vous DEVEZ examiner attentivement toutes les réponses de l'utilisateur à la recherche de :
- **Réponses vagues ou ambiguës** : « un mélange de », « quelque part entre », « pas sûr », « ça dépend »
- **Critères ou termes non définis** : Références à des concepts sans définition claire
- **Réponses contradictoires** : Réponses qui se contredisent entre elles
- **Détails de conception manquants** : Réponses manquant d'indications précises
- **Réponses combinant plusieurs options** : Réponses fusionnant différentes approches sans règle de décision claire

### 9. Questions de suivi OBLIGATOIRES
Si l'analyse de l'étape 8 révèle UNE réponse ambiguë, vous DEVEZ :
- Ajouter des questions de suivi spécifiques au document de plan en utilisant les balises [Réponse] :
- NE PAS passer à l'approbation tant que toutes les ambiguïtés ne sont pas résolues
- Exemples de suivis requis :
  - « Vous avez mentionné "un mélange de A et B" — quels critères précis devraient déterminer quand utiliser A plutôt que B ? »
  - « Vous avez dit "quelque part entre A et B" — pouvez-vous définir l'approche médiane exacte ? »
  - « Vous avez indiqué "pas sûr" — quelle information supplémentaire vous aiderait à décider ? »
  - « Vous avez mentionné "selon la complexité" — comment définissez-vous les niveaux de complexité ? »

### 10. Générer les artefacts de conception de l'application
- Exécuter le plan approuvé pour générer les artefacts de conception
- Créer `aidlc-docs/inception/application-design/components.md` avec :
  - Nom et objectif du composant
  - Responsabilités du composant
  - Interfaces du composant
- Créer `aidlc-docs/inception/application-design/component-methods.md` avec :
  - Signatures de méthodes pour chaque composant
  - Objectif de haut niveau de chaque méthode
  - Types d'entrée/sortie
  - Remarque : Les règles métier détaillées seront définies dans la Conception fonctionnelle (par unité, phase CONSTRUCTION)
- Créer `aidlc-docs/inception/application-design/services.md` avec :
  - Définitions des services
  - Responsabilités des services
  - Interactions et orchestration des services
- Créer `aidlc-docs/inception/application-design/component-dependency.md` avec :
  - Matrice de dépendances montrant les relations
  - Schémas de communication entre composants
  - Diagrammes de flux de données

### 11. Consigner l'approbation
- Consigner la demande d'approbation avec horodatage dans `aidlc-docs/audit.md`
- Inclure le texte complet de la demande d'approbation
- Utiliser le format d'horodatage ISO 8601

### 12. Présenter le message de fin

```markdown
# 🏗️ Conception de l'application terminée

[Résumé généré par l'IA des artefacts de conception de l'application créés, sous forme de puces]

> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner les artefacts de conception de l'application à : `aidlc-docs/inception/application-design/`

> **🚀 <u>**ET ENSUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** — Demander des modifications à la conception de l'application si nécessaire
> [SI la Génération des unités est ignorée :]
> 📝 **Ajouter la Génération des unités** — Choisir d'inclure l'étape **Génération des unités** (actuellement ignorée)
> ✅ **Approuver et continuer** — Approuver la conception et passer à **[Génération des unités/PHASE DE CONSTRUCTION]**
```

### 13. Attendre l'approbation explicite
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé la conception de l'application
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour la conception et répéter le processus d'approbation

### 14. Enregistrer la réponse d'approbation
- Consigner la réponse d'approbation de l'utilisateur avec horodatage dans `aidlc-docs/audit.md`
- Inclure le texte exact de la réponse de l'utilisateur
- Marquer clairement le statut d'approbation

### 15. Mettre à jour la progression
- Marquer l'étape Conception de l'application comme terminée dans `aidlc-docs/aidlc-state.md`
- Mettre à jour la section « Statut actuel »
- Préparer la transition vers l'étape suivante
