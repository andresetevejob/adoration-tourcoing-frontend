# Génération des unités — Étapes détaillées

## Vue d'ensemble
Cette étape décompose le système en unités de travail gérables à travers deux parties intégrées :
- **Partie 1 — Planification** : Créer un plan de décomposition avec des questions, recueillir les réponses, analyser les ambiguïtés, obtenir l'approbation
- **Partie 2 — Génération** : Exécuter le plan approuvé pour générer les artefacts d'unités

**DÉFINITION** : Une unité de travail est un regroupement logique de récits à des fins de développement. Pour les microservices, chaque unité devient un service déployable indépendamment. Pour les monolithes, l'unité unique représente l'ensemble de l'application avec des modules logiques.

**Terminologie** : Utiliser « Service » pour les composants déployables indépendamment, « Module » pour les regroupements logiques au sein d'un service, « Unité de travail » pour le contexte de planification.

## Prérequis
- L'évaluation du contexte doit être terminée
- L'évaluation des exigences est recommandée (fournit la portée fonctionnelle)
- Le développement des récits est recommandé (les récits sont associés aux unités)
- La phase Conception de l'application est REQUISE (détermine les composants, méthodes et services)
- Le plan d'exécution doit indiquer que la phase Conception doit s'exécuter

---

# PARTIE 1 : PLANIFICATION

## Étape 1 : Créer le plan d'unités de travail
- Générer un plan avec des cases à cocher [] pour décomposer le système en unités de travail
- Se concentrer sur la décomposition du système en unités de développement gérables
- Chaque étape et sous-étape doit avoir une case à cocher []

## Étape 2 : Inclure les artefacts d'unités obligatoires dans le plan
**TOUJOURS** inclure ces artefacts obligatoires dans le plan d'unités :
- [ ] Générer `aidlc-docs/inception/application-design/unit-of-work.md` avec les définitions et responsabilités des unités
- [ ] Générer `aidlc-docs/inception/application-design/unit-of-work-dependency.md` avec la matrice de dépendances
- [ ] Générer `aidlc-docs/inception/application-design/unit-of-work-story-map.md` associant les récits aux unités
- [ ] Valider les limites et dépendances des unités
- [ ] S'assurer que tous les récits sont assignés à des unités

## Étape 3 : Générer des questions adaptées au contexte
**DIRECTIVE** : Analyser les exigences, les récits et la conception de l'application pour générer UNIQUEMENT des questions pertinentes pour CE problème de décomposition spécifique. Utiliser les catégories ci-dessous comme source d'inspiration, PAS comme une checklist obligatoire. Ignorer des catégories entières si elles ne sont pas applicables.

- INTÉGRER les questions en utilisant le format de balise [Réponse] :
- Se concentrer sur les ambiguïtés et informations manquantes spécifiques à ce contexte
- Générer des questions uniquement là où la contribution de l'utilisateur est nécessaire pour la prise de décision

**Exemples de catégories de questions** (adapter selon les besoins) :
- **Regroupement des récits** — Uniquement si plusieurs récits existent et que la stratégie de regroupement est peu claire
- **Dépendances** — Uniquement si plusieurs unités sont probables et que l'approche d'intégration est ambiguë
- **Alignement d'équipe** — Uniquement si la structure d'équipe ou la propriété est peu claire
- **Considérations techniques** — Uniquement si les exigences de scalabilité/déploiement diffèrent selon les unités
- **Domaine métier** — Uniquement si les limites de domaine ou les contextes bornés sont peu clairs

## Étape 4 : Enregistrer le plan d'unités de travail
- Enregistrer sous `aidlc-docs/inception/plans/unit-of-work-plan.md`
- Inclure toutes les balises [Réponse] : pour la saisie de l'utilisateur
- S'assurer que le plan couvre tous les aspects de la décomposition du système

## Étape 5 : Demander la contribution de l'utilisateur
- Demander à l'utilisateur de renseigner les balises [Réponse] : directement dans le document de plan
- Souligner l'importance des décisions de décomposition
- Fournir des instructions claires pour compléter les balises [Réponse] :

## Étape 6 : Recueillir les réponses
- Attendre que l'utilisateur fournisse les réponses à toutes les questions en utilisant les balises [Réponse] : dans le document
- Ne pas continuer tant que TOUTES les balises [Réponse] : ne sont pas complétées
- Examiner le document pour s'assurer qu'aucune balise [Réponse] : n'est laissée vide

## Étape 7 : ANALYSER LES RÉPONSES (OBLIGATOIRE)
Avant de continuer, vous DEVEZ examiner attentivement toutes les réponses de l'utilisateur à la recherche de :
- **Réponses vagues ou ambiguës** : « un mélange de », « quelque part entre », « pas sûr », « ça dépend »
- **Critères ou termes non définis** : Références à des concepts sans définition claire
- **Réponses contradictoires** : Réponses qui se contredisent entre elles
- **Détails de génération manquants** : Réponses manquant d'indications précises
- **Réponses combinant plusieurs options** : Réponses fusionnant différentes approches sans règle de décision claire

## Étape 8 : Questions de suivi OBLIGATOIRES
Si l'analyse de l'étape 7 révèle UNE réponse ambiguë, vous DEVEZ :
- Ajouter des questions de suivi spécifiques au document de plan en utilisant les balises [Réponse] :
- NE PAS passer à l'approbation tant que toutes les ambiguïtés ne sont pas résolues
- Exemples de suivis requis :
  - « Vous avez mentionné "un mélange de A et B" — quels critères précis devraient déterminer quand utiliser A plutôt que B ? »
  - « Vous avez dit "quelque part entre A et B" — pouvez-vous définir l'approche médiane exacte ? »
  - « Vous avez indiqué "pas sûr" — quelle information supplémentaire vous aiderait à décider ? »
  - « Vous avez mentionné "selon la complexité" — comment définissez-vous les niveaux de complexité ? »

## Étape 9 : Demander l'approbation
- Demander : « **Le plan d'unités de travail est terminé. Examinez le plan dans aidlc-docs/inception/plans/unit-of-work-plan.md. Prêt à passer à la génération ?** »
- NE PAS CONTINUER tant que l'utilisateur n'a pas confirmé

## Étape 10 : Consigner l'approbation
- Consigner la demande et la réponse avec horodatage dans audit.md
- Utiliser le format d'horodatage ISO 8601
- Inclure le texte complet de la demande d'approbation

## Étape 11 : Mettre à jour la progression
- Marquer la Planification des unités comme terminée dans aidlc-state.md
- Mettre à jour la section « Statut actuel »
- Préparer la transition vers la Génération des unités

---

# PARTIE 2 : GÉNÉRATION

## Étape 12 : Charger le plan d'unités de travail
- [ ] Lire le plan complet depuis `aidlc-docs/inception/plans/unit-of-work-plan.md`
- [ ] Identifier la prochaine étape non terminée (première case à cocher [ ])
- [ ] Charger le contexte et les exigences de cette étape

## Étape 13 : Exécuter l'étape actuelle
- [ ] Effectuer exactement ce que décrit l'étape actuelle
- [ ] Générer les artefacts d'unités comme spécifié dans le plan
- [ ] Suivre l'approche de décomposition approuvée lors de la planification
- [ ] Utiliser les critères et limites spécifiés dans le plan

## Étape 14 : Mettre à jour la progression
- [ ] Marquer l'étape terminée comme [x] dans le plan d'unités de travail
- [ ] Mettre à jour le statut actuel dans `aidlc-docs/aidlc-state.md`
- [ ] Enregistrer tous les artefacts générés

## Étape 15 : Continuer ou terminer
- [ ] S'il reste des étapes, revenir à l'étape 12
- [ ] Si toutes les étapes sont terminées, vérifier que les unités sont prêtes pour les étapes de conception
- [ ] Marquer l'étape Génération des unités comme terminée

## Étape 16 : Présenter le message de fin

```markdown
# 🔧 Génération des unités terminée

[Résumé généré par l'IA des unités et de la décomposition créées, sous forme de puces]

> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner les artefacts de génération des unités à : `aidlc-docs/inception/application-design/`

> **🚀 <u>**ET ENSUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** — Demander des modifications à la génération des unités si nécessaire
> ✅ **Approuver et continuer** — Approuver les unités et passer à la **PHASE DE CONSTRUCTION**
```

## Étape 17 : Attendre l'approbation explicite
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé la génération des unités
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour les unités et répéter le processus d'approbation

## Étape 18 : Enregistrer la réponse d'approbation
- Consigner la réponse d'approbation de l'utilisateur avec horodatage dans `aidlc-docs/audit.md`
- Inclure le texte exact de la réponse de l'utilisateur
- Marquer clairement le statut d'approbation

## Étape 19 : Mettre à jour la progression
- Marquer l'étape Génération des unités comme terminée dans `aidlc-docs/aidlc-state.md`
- Mettre à jour la section « Statut actuel »
- Préparer la transition vers la PHASE DE CONSTRUCTION

---

## Règles critiques

### Règles de la phase de planification
- Générer UNIQUEMENT des questions pertinentes pour le contexte
- Utiliser le format de balise [Réponse] : pour toutes les questions
- Analyser toutes les réponses à la recherche d'ambiguïtés avant de continuer
- Résoudre TOUTES les ambiguïtés avec des questions de suivi
- Obtenir l'approbation explicite de l'utilisateur avant la génération

### Règles de la phase de génération
- **AUCUNE LOGIQUE CODÉE EN DUR** : N'exécuter que ce qui est écrit dans le plan d'unités de travail
- **SUIVRE LE PLAN EXACTEMENT** : Ne pas dévier de la séquence des étapes
- **METTRE À JOUR LES CASES À COCHER** : Cocher [x] immédiatement après avoir terminé chaque étape
- **UTILISER L'APPROCHE APPROUVÉE** : Suivre la méthodologie de décomposition définie lors de la planification
- **VÉRIFIER L'ACHÈVEMENT** : S'assurer que tous les artefacts d'unités sont complets avant de continuer

## Critères d'achèvement
- Toutes les questions de planification ont reçu une réponse et les ambiguïtés sont résolues
- L'approbation de l'utilisateur a été obtenue pour le plan
- Toutes les étapes du plan d'unités de travail sont marquées [x]
- Tous les artefacts d'unités sont générés conformément au plan :
  - `unit-of-work.md` avec les définitions des unités
  - `unit-of-work-dependency.md` avec la matrice de dépendances
  - `unit-of-work-story-map.md` avec les associations aux récits
- Les unités sont vérifiées et prêtes pour les étapes de conception par unité
