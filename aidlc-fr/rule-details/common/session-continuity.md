# Modèles de continuité de session

## Modèle de message de retour
Quand un utilisateur revient pour continuer le travail sur un projet AI-DLC existant, présenter ce message :

```markdown
**Bon retour ! Je vois que vous avez un projet AI-DLC existant en cours.**

D'après votre aidlc-state.md, voici votre statut actuel :
- **Projet** : [nom-du-projet]
- **Phase actuelle** : [INCEPTION/CONSTRUCTION/EXPLOITATION]
- **Étape actuelle** : [Nom de l'étape]
- **Dernière étape terminée** : [dernière étape terminée]
- **Prochaine étape** : [prochaine étape à traiter]

**Sur quoi souhaitez-vous travailler aujourd'hui ?**

A) Continuer là où vous vous étiez arrêté ([Description de la prochaine étape])
B) Revoir une étape précédente ([Afficher les étapes disponibles])

[Réponse] : 
```

## OBLIGATOIRE : Instructions de continuité de session
1. **Toujours lire aidlc-state.md en premier** lors de la détection d'un projet existant
2. **Analyser le statut actuel** à partir du fichier de workflow pour renseigner le message
3. **OBLIGATOIRE : Charger les artefacts des étapes précédentes** — avant de reprendre une étape, lire automatiquement tous les artefacts pertinents des étapes précédentes :
   - **Rétro-ingénierie** : lire architecture.md, code-structure.md, api-documentation.md
   - **Analyse des exigences** : lire requirements.md, requirement-verification-questions.md
   - **Récits utilisateur** : lire stories.md, personas.md, story-generation-plan.md
   - **Conception de l'application** : lire les artefacts de conception de l'application (components.md, component-methods.md, services.md)
   - **Conception (unités)** : lire unit-of-work.md, unit-of-work-dependency.md, unit-of-work-story-map.md
   - **Conception par unité** : lire functional-design.md, nfr-requirements.md, nfr-design.md, infrastructure-design.md
   - **Étapes de code** : lire tous les fichiers de code, les plans, ET tous les artefacts précédents
4. **Chargement intelligent du contexte par étape** :
   - **Étapes précoces (Détection de l'espace de travail, Rétro-ingénierie)** : charger l'analyse de l'espace de travail
   - **Exigences/Récits** : charger les artefacts de rétro-ingénierie + d'exigences
   - **Étapes de conception** : charger les exigences + récits + architecture + artefacts de conception
   - **Étapes de code** : charger TOUS les artefacts + les fichiers de code existants
5. **Adapter les options** en fonction du choix architectural et de la phase actuelle
6. **Afficher des prochaines étapes précises** plutôt que des descriptions génériques
7. **Consigner le message de continuité** dans audit.md avec horodatage
8. **Résumé de contexte** : après avoir chargé les artefacts, fournir un bref résumé de ce qui a été chargé, pour information de l'utilisateur
9. **Poser des questions** : TOUJOURS poser les questions de clarification ou de retour utilisateur en les plaçant dans des fichiers .md. NE PAS placer les questions à choix multiples directement dans la session de chat.

## Gestion des erreurs
Si des artefacts sont manquants ou corrompus lors de la reprise de session, voir [error-handling.md](error-handling.md) pour des conseils sur les procédures de récupération.
