# Génération de code - Étapes détaillées

## Vue d'ensemble
Cette étape génère le code pour chaque unité de travail à travers deux parties intégrées :
- **Partie 1 - Planification** : Créer un plan détaillé de génération de code avec des étapes explicites
- **Partie 2 - Génération** : Exécuter le plan approuvé pour générer le code, les tests et les artefacts

## Prérequis
- La Génération de la conception de l'unité doit être terminée pour l'unité
- L'implémentation NFR (si exécutée) doit être terminée pour l'unité
- Tous les artefacts de conception de l'unité doivent être disponibles
- L'unité est prête pour la génération de code

---

# PARTIE 1 : PLANIFICATION

## Étape 1 : Analyser le contexte de l'unité
- [ ] Lire les artefacts de conception de l'unité issus de la Génération de la conception de l'unité
- [ ] Lire la carte des récits de l'unité pour comprendre les récits assignés
- [ ] Identifier les dépendances et interfaces de l'unité
- [ ] Valider que l'unité est prête pour la génération de code

## Étape 2 : Créer le plan détaillé de génération de code de l'unité
- [ ] Créer des étapes explicites pour la génération de l'unité :
  - Génération de la logique métier
  - Tests unitaires de la logique métier
  - Résumé de la logique métier
  - Génération de la couche API
  - Tests unitaires de la couche API
  - Résumé de la couche API
  - Génération de la couche de repository
  - Tests unitaires de la couche de repository
  - Résumé de la couche de repository
  - Génération des scripts de migration de base de données (si des modèles de données existent)
  - Génération de la documentation (docs API, mises à jour du README)
  - Génération des artefacts de déploiement
- [ ] Numéroter chaque étape séquentiellement
- [ ] Inclure les références de mapping des récits pour cette unité
- [ ] Ajouter des cases à cocher [ ] pour chaque étape

## Étape 3 : Inclure le contexte de génération de l'unité
- [ ] Pour cette unité, inclure :
  - Les récits implémentés par cette unité
  - Les dépendances envers d'autres unités/services
  - Les interfaces et contrats attendus
  - Les entités de base de données détenues par cette unité
  - Les limites de service et responsabilités

## Étape 4 : Créer le document de plan de l'unité
- [ ] Enregistrer le plan complet sous `aidlc-docs/construction/plans/{unit-name}-code-generation-plan.md`
- [ ] Inclure la numérotation des étapes (Étape 1, Étape 2, etc.)
- [ ] Inclure le contexte et les dépendances de l'unité
- [ ] Inclure la traçabilité des récits
- [ ] S'assurer que le plan est exécutable étape par étape
- [ ] Souligner que ce plan est la source unique de vérité pour la Génération de code

## Étape 5 : Résumer le plan de l'unité
- [ ] Fournir un résumé du plan de génération de code de l'unité à l'utilisateur
- [ ] Mettre en évidence l'approche de génération de l'unité
- [ ] Expliquer la séquence des étapes et la couverture des récits
- [ ] Indiquer le nombre total d'étapes et la portée estimée

## Étape 6 : Consigner la demande d'approbation
- [ ] Avant de demander l'approbation, consigner la demande avec horodatage dans `aidlc-docs/audit.md`
- [ ] Inclure une référence au plan complet de génération de code de l'unité
- [ ] Utiliser le format d'horodatage ISO 8601

## Étape 7 : Attendre l'approbation explicite
- [ ] Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé le plan de génération de code de l'unité
- [ ] L'approbation doit couvrir l'ensemble du plan et la séquence de génération
- [ ] Si l'utilisateur demande des modifications, mettre à jour le plan et répéter le processus d'approbation

## Étape 8 : Enregistrer la réponse d'approbation
- [ ] Consigner la réponse d'approbation de l'utilisateur avec horodatage dans `aidlc-docs/audit.md`
- [ ] Inclure le texte exact de la réponse de l'utilisateur
- [ ] Marquer clairement le statut d'approbation

## Étape 9 : Mettre à jour la progression
- [ ] Marquer la Planification du code comme terminée dans `aidlc-state.md`
- [ ] Mettre à jour la section « Statut actuel »
- [ ] Préparer la transition vers la Génération de code

---

# PARTIE 2 : GÉNÉRATION

## Étape 10 : Charger le plan de génération de code de l'unité
- [ ] Lire le plan complet depuis `aidlc-docs/construction/plans/{unit-name}-code-generation-plan.md`
- [ ] Identifier la prochaine étape non terminée (première case à cocher [ ])
- [ ] Charger le contexte de cette étape (unité, dépendances, récits)

## Étape 11 : Exécuter l'étape en cours
- [ ] Effectuer exactement ce que décrit l'étape en cours
- [ ] Générer le code, les tests ou la documentation comme spécifié
- [ ] Suivre les exigences des récits de l'unité
- [ ] Respecter les dépendances et interfaces définies dans le plan

## Étape 12 : Mettre à jour la progression
- [ ] Marquer l'étape terminée comme [x] dans le plan de génération de code de l'unité
- [ ] Marquer les récits associés de l'unité comme [x] lorsque leur génération est terminée
- [ ] Mettre à jour le statut actuel dans `aidlc-docs/aidlc-state.md`
- [ ] Sauvegarder tous les artefacts générés

## Étape 13 : Continuer ou terminer la génération
- [ ] S'il reste des étapes, retourner à l'étape 10
- [ ] Si toutes les étapes sont terminées, procéder à la présentation du message de fin

## Étape 14 : Présenter le message de fin
- Présenter le message de fin selon cette structure :
     1. **Annonce de fin** (obligatoire) : Toujours commencer par ceci :

```markdown
# 💻 Génération de code terminée - [unit-name]
```

     2. **Résumé de l'IA** (optionnel) : Fournir un résumé structuré à puces de la génération de code
        - Format : « La génération de code a créé [description] : »
        - Lister les principaux artefacts de code générés (à puces)
        - Lister la couverture de test et la documentation créées
        - Mentionner les artefacts de déploiement et les fichiers de configuration
        - NE PAS inclure d'instructions de workflow (« veuillez examiner », « faites-moi savoir », « passer à la phase suivante », « avant de continuer »)
        - Rester factuel et centré sur le contenu
     3. **Message de workflow formaté** (obligatoire) : Toujours terminer avec exactement ce format :

```markdown
> **📋 <u>**EXAMEN REQUIS :**</u>**  
> Veuillez examiner le code généré à : `aidlc-docs/construction/[unit-name]/code/`



> **🚀 <u>**QUELLE EST LA SUITE ?**</u>**
>
> **Vous pouvez :**
>
> 🔧 **Demander des modifications** - Demander des modifications au code généré suite à votre examen  
> ✅ **Passer à l'étape suivante** - Approuver la génération de code et passer à **[unité suivante/Build & Tests]**

---
```

## Étape 15 : Attendre l'approbation explicite
- Ne pas continuer tant que l'utilisateur n'a pas explicitement approuvé le code généré
- L'approbation doit être claire et sans ambiguïté
- Si l'utilisateur demande des modifications, mettre à jour le code et répéter le processus d'approbation

## Étape 16 : Enregistrer l'approbation et mettre à jour la progression
- Consigner l'approbation dans audit.md avec horodatage
- Enregistrer la réponse d'approbation de l'utilisateur avec horodatage
- Marquer l'étape Génération de code comme terminée pour cette unité dans aidlc-state.md

---

## Règles critiques

### Règles de la phase de planification
- Créer des étapes explicites et numérotées pour toutes les activités de génération
- Inclure la traçabilité des récits dans le plan
- Documenter le contexte et les dépendances de l'unité
- Obtenir l'approbation explicite de l'utilisateur avant la génération

### Règles de la phase de génération
- **AUCUNE LOGIQUE CODÉE EN DUR** : N'exécuter que ce qui est écrit dans le plan de l'unité
- **SUIVRE LE PLAN EXACTEMENT** : Ne pas s'écarter de la séquence des étapes
- **METTRE À JOUR LES CASES À COCHER** : Cocher [x] immédiatement après avoir terminé chaque étape
- **TRAÇABILITÉ DES RÉCITS** : Cocher [x] les récits de l'unité lorsque la fonctionnalité est implémentée
- **RESPECTER LES DÉPENDANCES** : N'implémenter que lorsque les dépendances de l'unité sont satisfaites

## Critères d'achèvement
- Plan complet de génération de code de l'unité créé et approuvé
- Toutes les étapes du plan de génération de code de l'unité marquées [x]
- Tous les récits de l'unité implémentés conformément au plan
- Tout le code et les tests générés (les tests seront exécutés dans la phase Build & Tests)
- Artefacts de déploiement générés
- Unité complète prête pour le build et la vérification
