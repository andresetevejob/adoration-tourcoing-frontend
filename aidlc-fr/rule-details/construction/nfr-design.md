# Conception NFR

## Prérequis
- Les Exigences NFR doivent être terminées pour l'unité
- Les artefacts d'exigences NFR doivent être disponibles
- Le plan d'exécution doit indiquer que l'étape Conception NFR doit s'exécuter

## Vue d'ensemble
Intégrer les exigences NFR dans la conception de l'unité à l'aide de patterns et de composants logiques.

## Étapes à exécuter

### Étape 1 : Analyser les exigences NFR
- Lire les exigences NFR depuis `aidlc-docs/construction/{unit-name}/nfr-requirements/`
- Comprendre les besoins de scalabilité, de performance, de disponibilité et de sécurité

### Étape 2 : Créer le plan de conception NFR
- Générer un plan avec des cases à cocher [] pour la conception NFR
- Se concentrer sur les patterns de conception et les composants logiques
- Chaque étape doit avoir une case à cocher []

### Étape 3 : Générer des questions adaptées au contexte
**DIRECTIVE** : Analyser les exigences NFR pour générer UNIQUEMENT les questions pertinentes pour la conception NFR de CETTE unité spécifique. Utiliser les catégories ci-dessous comme source d'inspiration, PAS comme une liste de contrôle obligatoire. Ignorer des catégories entières si elles ne sont pas applicables.

- INTÉGRER les questions au format de balise [Réponse] :
- Se concentrer sur les ambiguïtés et informations manquantes spécifiques à cette unité
- Générer des questions uniquement là où la contribution de l'utilisateur est nécessaire pour les décisions de patterns et de composants

**Exemples de catégories de questions** (à adapter selon les besoins) :
- **Patterns de résilience** - Uniquement si l'approche de tolérance aux pannes nécessite une clarification
- **Patterns de scalabilité** - Uniquement si les mécanismes de mise à l'échelle ne sont pas clairs
- **Patterns de performance** - Uniquement si la stratégie d'optimisation de la performance est ambiguë
- **Patterns de sécurité** - Uniquement si l'approche d'implémentation de la sécurité nécessite une contribution
- **Composants logiques** - Uniquement si les composants d'infrastructure (files d'attente, caches, etc.) nécessitent une clarification

### Étape 4 : Enregistrer le plan
- Enregistrer sous `aidlc-docs/construction/plans/{unit-name}-nfr-design-plan.md`
- Inclure toutes les balises [Réponse] : pour la saisie de l'utilisateur

### Étape 5 : Recueillir et analyser les réponses
- Attendre que l'utilisateur complète toutes les balises [Réponse] :
- Examiner les réponses vagues ou ambiguës
- Ajouter des questions de suivi si nécessaire

### Étape 6 : Générer les artefacts de conception NFR
- Créer `aidlc-docs/construction/{unit-name}/nfr-design/nfr-design-patterns.md`
- Créer `aidlc-docs/construction/{unit-name}/nfr-design/logical-components.md`

### Étape 7 : Présenter le message de fin
- Présenter le message de fin selon cette structure :
     1. **Annonce de fin** (obligatoire) : Toujours commencer par ceci :

```markdown
# 🎨 Conception NFR terminée - [unit-name]
```

     2. **Résumé de l'IA** (optionnel) : Fournir un résumé structuré à puces de la conception NFR
        - Format : « La conception NFR a intégré [description] : »
        - Lister les principaux patterns de conception implémentés (à puces)
        - Lister les composants logiques et éléments d'infrastructure
        - Mentionner les patterns de résilience, de scalabilité et de performance appliqués
        - NE PAS inclure d'instructions de workflow (« veuillez examiner », « faites-moi savoir », « passer à la phase suivante », « avant de continuer »)
        - Rester factuel et centré sur le contenu
     3. **Message de workflow formaté** (obligatoire) : Toujours terminer avec exactement ce format :

```markdown
> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner la conception NFR à : `aidlc-docs/construction/[unit-name]/nfr-design/`



> **🚀 <u>**QUELLE EST LA SUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** - Demander des modifications à la conception NFR suite à votre examen  
> ✅ **Passer à l'étape suivante** - Approuver la conception NFR et passer à **[next-stage-name]**

---
```

### Étape 8 : Attendre l'approbation explicite
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé la conception NFR
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour la conception et répéter le processus d'approbation

### Étape 9 : Enregistrer l'approbation et mettre à jour la progression
- Consigner l'approbation dans audit.md avec horodatage
- Enregistrer la réponse d'approbation de l'utilisateur avec horodatage
- Marquer l'étape Conception NFR comme terminée dans aidlc-state.md
