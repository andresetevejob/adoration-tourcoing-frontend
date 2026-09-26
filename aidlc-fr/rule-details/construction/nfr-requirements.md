# Exigences NFR

## Prérequis
- La Conception fonctionnelle doit être terminée pour l'unité
- Les artefacts de conception fonctionnelle de l'unité doivent être disponibles
- Le plan d'exécution doit indiquer que l'étape Exigences NFR doit s'exécuter

## Vue d'ensemble
Déterminer les exigences non fonctionnelles de l'unité et effectuer les choix de pile technique.

## Étapes à exécuter

### Étape 1 : Analyser la conception fonctionnelle
- Lire les artefacts de conception fonctionnelle depuis `aidlc-docs/construction/{unit-name}/functional-design/`
- Comprendre la complexité et les exigences de la logique métier

### Étape 2 : Créer le plan des Exigences NFR
- Générer un plan avec des cases à cocher [] pour l'évaluation NFR
- Se concentrer sur la scalabilité, la performance, la disponibilité, la sécurité
- Chaque étape doit avoir une case à cocher []

### Étape 3 : Générer des questions adaptées au contexte
**DIRECTIVE** : Analyser en profondeur la conception fonctionnelle pour identifier TOUS les domaines où une clarification NFR améliorerait la qualité du système et les décisions d'architecture. Être proactif dans la formulation de questions pour garantir une couverture NFR complète.

**CRITIQUE** : Par défaut, poser des questions dès qu'il existe UNE ambiguïté ou un détail manquant pouvant affecter la qualité du système. Il vaut mieux poser trop de questions que de faire des suppositions NFR incorrectes.

- INTÉGRER les questions au format de balise [Réponse] :
- Se concentrer sur TOUTE ambiguïté, information manquante ou domaine nécessitant une clarification
- Générer des questions partout où la contribution de l'utilisateur améliorerait les décisions NFR et de pile technique
- **En cas de doute, poser la question** - la surconfiance mène à une qualité système médiocre

**Catégories de questions à évaluer** (considérer TOUTES les catégories) :
- **Exigences de scalabilité** - Interroger sur la charge attendue, les schémas de croissance, les déclencheurs de mise à l'échelle et la planification de capacité
- **Exigences de performance** - Interroger sur les temps de réponse, le débit, la latence et les benchmarks de performance
- **Exigences de disponibilité** - Interroger sur les attentes de disponibilité, la reprise après sinistre, le basculement et la continuité d'activité
- **Exigences de sécurité** - Interroger sur la protection des données, la conformité, l'authentification, l'autorisation et les modèles de menace
- **Sélection de la pile technique** - Interroger sur les préférences technologiques, les contraintes, les systèmes existants et les exigences d'intégration
- **Exigences de fiabilité** - Interroger sur la gestion des erreurs, la tolérance aux pannes, la supervision et les besoins d'alerte
- **Exigences de maintenabilité** - Interroger sur la qualité du code, la documentation, les tests et les exigences opérationnelles
- **Exigences d'utilisabilité** - Interroger sur l'expérience utilisateur, l'accessibilité et les exigences d'interface

### Étape 4 : Enregistrer le plan
- Enregistrer sous `aidlc-docs/construction/plans/{unit-name}-nfr-requirements-plan.md`
- Inclure toutes les balises [Réponse] : pour la saisie de l'utilisateur

### Étape 5 : Recueillir et analyser les réponses
- Attendre que l'utilisateur complète toutes les balises [Réponse] :
- **OBLIGATOIRE** : Examiner attentivement TOUTES les réponses à la recherche de réponses vagues ou ambiguës
- **CRITIQUE** : Ajouter des questions de suivi pour TOUTE réponse peu claire - ne pas continuer avec de l'ambiguïté
- Rechercher des réponses telles que « ça dépend », « peut-être », « pas sûr », « un mélange de », « quelque part entre », « standard », « typique »
- Créer un fichier de questions de clarification si UNE ambiguïté est détectée
- **Ne pas continuer tant que TOUTES les ambiguïtés ne sont pas résolues**

### Étape 6 : Générer les artefacts d'Exigences NFR
- Créer `aidlc-docs/construction/{unit-name}/nfr-requirements/nfr-requirements.md`
- Créer `aidlc-docs/construction/{unit-name}/nfr-requirements/tech-stack-decisions.md`

### Étape 7 : Présenter le message de fin
- Présenter le message de fin selon cette structure :
     1. **Annonce de fin** (obligatoire) : Toujours commencer par ceci :

```markdown
# 📊 Exigences NFR terminées - [unit-name]
```

     2. **Résumé de l'IA** (optionnel) : Fournir un résumé structuré à puces des exigences NFR
        - Format : « L'évaluation des exigences NFR a identifié [description] : »
        - Lister les principales exigences de scalabilité, performance, disponibilité (à puces)
        - Lister les exigences de sécurité et de conformité identifiées
        - Mentionner les décisions de pile technique et leur justification
        - NE PAS inclure d'instructions de workflow (« veuillez examiner », « faites-moi savoir », « passer à la phase suivante », « avant de continuer »)
        - Rester factuel et centré sur le contenu
     3. **Message de workflow formaté** (obligatoire) : Toujours terminer avec exactement ce format :

```markdown
> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner les exigences NFR à : `aidlc-docs/construction/[unit-name]/nfr-requirements/`



> **🚀 <u>**QUELLE EST LA SUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** - Demander des modifications aux exigences NFR suite à votre examen  
> ✅ **Passer à l'étape suivante** - Approuver les exigences NFR et passer à **[next-stage-name]**

---
```

### Étape 8 : Attendre l'approbation explicite
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé les exigences NFR
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour les exigences et répéter le processus d'approbation

### Étape 9 : Enregistrer l'approbation et mettre à jour la progression
- Consigner l'approbation dans audit.md avec horodatage
- Enregistrer la réponse d'approbation de l'utilisateur avec horodatage
- Marquer l'étape Exigences NFR comme terminée dans aidlc-state.md
