# Conception de l'infrastructure

## Prérequis
- La Conception fonctionnelle doit être terminée pour l'unité
- La Conception NFR est recommandée (fournit les composants logiques à mapper)
- Le plan d'exécution doit indiquer que l'étape Conception de l'infrastructure doit s'exécuter

## Vue d'ensemble
Mapper les composants logiciels logiques vers des choix d'infrastructure réels pour les environnements de déploiement.

## Étapes à exécuter

### Étape 1 : Analyser les artefacts de conception
- Lire la conception fonctionnelle depuis `aidlc-docs/construction/{unit-name}/functional-design/`
- Lire la conception NFR depuis `aidlc-docs/construction/{unit-name}/nfr-design/` (si elle existe)
- Identifier les composants logiques nécessitant une infrastructure

### Étape 2 : Créer le plan de conception de l'infrastructure
- Générer un plan avec des cases à cocher [] pour la conception de l'infrastructure
- Se concentrer sur le mapping vers des services réels (AWS, Azure, GCP, sur site)
- Chaque étape doit avoir une case à cocher []

### Étape 3 : Générer des questions adaptées au contexte
**DIRECTIVE** : Analyser la conception fonctionnelle et NFR pour générer UNIQUEMENT les questions pertinentes pour les besoins d'infrastructure de CETTE unité spécifique. Utiliser les catégories ci-dessous comme source d'inspiration, PAS comme une liste de contrôle obligatoire. Ignorer des catégories entières si elles ne sont pas applicables.

- INTÉGRER les questions au format de balise [Réponse] :
- Se concentrer sur les ambiguïtés et informations manquantes spécifiques à cette unité
- Générer des questions uniquement là où la contribution de l'utilisateur est nécessaire pour les décisions d'infrastructure

**Exemples de catégories de questions** (à adapter selon les besoins) :
- **Environnement de déploiement** - Uniquement si le fournisseur cloud ou la configuration de l'environnement n'est pas clair
- **Infrastructure de calcul** - Uniquement si le choix du service de calcul nécessite une clarification
- **Infrastructure de stockage** - Uniquement si le choix de base de données ou de stockage est ambigu
- **Infrastructure de messagerie** - Uniquement si les services de messagerie/mise en file d'attente doivent être précisés
- **Infrastructure réseau** - Uniquement si l'approche d'équilibrage de charge ou de passerelle API n'est pas claire
- **Infrastructure de supervision** - Uniquement si l'outillage d'observabilité nécessite une clarification
- **Infrastructure partagée** - Uniquement si la stratégie de partage d'infrastructure est ambiguë

### Étape 4 : Enregistrer le plan
- Enregistrer sous `aidlc-docs/construction/plans/{unit-name}-infrastructure-design-plan.md`
- Inclure toutes les balises [Réponse] : pour la saisie de l'utilisateur

### Étape 5 : Recueillir et analyser les réponses
- Attendre que l'utilisateur complète toutes les balises [Réponse] :
- Examiner les réponses vagues ou ambiguës
- Ajouter des questions de suivi si nécessaire

### Étape 6 : Générer les artefacts de conception de l'infrastructure
- Créer `aidlc-docs/construction/{unit-name}/infrastructure-design/infrastructure-design.md`
- Créer `aidlc-docs/construction/{unit-name}/infrastructure-design/deployment-architecture.md`
- Si infrastructure partagée : Créer `aidlc-docs/construction/shared-infrastructure.md`

### Étape 7 : Présenter le message de fin
- Présenter le message de fin selon cette structure :
     1. **Annonce de fin** (obligatoire) : Toujours commencer par ceci :

```markdown
# 🏢 Conception de l'infrastructure terminée - [unit-name]
```

     2. **Résumé de l'IA** (optionnel) : Fournir un résumé structuré à puces de la conception de l'infrastructure
        - Format : « La conception de l'infrastructure a permis de mapper [description] : »
        - Lister les principaux services et composants d'infrastructure (à puces)
        - Lister les décisions d'architecture de déploiement et leur justification
        - Mentionner les choix de fournisseur cloud et les mappings de services
        - NE PAS inclure d'instructions de workflow (« veuillez examiner », « faites-moi savoir », « passer à la phase suivante », « avant de continuer »)
        - Rester factuel et centré sur le contenu
     3. **Message de workflow formaté** (obligatoire) : Toujours terminer avec exactement ce format :

```markdown
> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner la conception de l'infrastructure à : `aidlc-docs/construction/[unit-name]/infrastructure-design/`



> **🚀 <u>**QUELLE EST LA SUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** - Demander des modifications à la conception de l'infrastructure suite à votre examen  
> ✅ **Passer à l'étape suivante** - Approuver la conception de l'infrastructure et passer à **Génération de code**

---
```

### Étape 8 : Attendre l'approbation explicite
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé la conception de l'infrastructure
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour la conception et répéter le processus d'approbation

### Étape 9 : Enregistrer l'approbation et mettre à jour la progression
- Consigner l'approbation dans audit.md avec horodatage
- Enregistrer la réponse d'approbation de l'utilisateur avec horodatage
- Marquer l'étape Conception de l'infrastructure comme terminée dans aidlc-state.md
