# Détection de l'espace de travail

**Objectif** : Déterminer l'état de l'espace de travail et vérifier l'existence de projets AI-DLC existants

## Étape 1 : Vérifier l'existence d'un projet AI-DLC existant

Vérifier si `aidlc-docs/aidlc-state.md` existe :
- **Si existant** : Reprendre à partir de la dernière phase (charger le contexte des phases précédentes)
- **Si non existant** : Continuer avec l'évaluation d'un nouveau projet

## Étape 2 : Scanner l'espace de travail à la recherche de code existant

**Déterminer si l'espace de travail contient du code existant :**
- Scanner l'espace de travail à la recherche de fichiers de code source (.java, .py, .js, .ts, etc.)
- Vérifier l'existence de fichiers de build (pom.xml, package.json, build.gradle, etc.)
- Rechercher des indicateurs de structure de projet

**Enregistrer les résultats :**
```markdown
## État de l'espace de travail
- **Code existant** : [Oui/Non]
- **Langages de programmation** : [Liste si trouvés]
- **Système de build** : [Maven/Gradle/npm/etc. si trouvé]
- **Structure du projet** : [Monolithe/Microservices/Bibliothèque/Vide]
```

## Étape 3 : Déterminer la phase suivante

**SI l'espace de travail est vide (aucun code existant)** :
- Définir le drapeau : `brownfield = false`
- Phase suivante : Analyse des exigences

**SI l'espace de travail contient du code existant** :
- Définir le drapeau : `brownfield = true`
- Vérifier l'existence d'artefacts de rétro-ingénierie dans `aidlc-docs/inception/reverse-engineering/`
- **SI des artefacts de rétro-ingénierie existent** : Les charger, passer directement à l'Analyse des exigences
- **SI aucun artefact de rétro-ingénierie** : La phase suivante est la Rétro-ingénierie

## Étape 4 : Créer le fichier d'état initial

Créer `aidlc-docs/aidlc-state.md` :

```markdown
# Suivi de l'état AI-DLC

## Informations sur le projet
- **Type de projet** : [Greenfield/Brownfield]
- **Date de début** : [horodatage ISO]
- **Étape actuelle** : INCEPTION - Détection de l'espace de travail

## État de l'espace de travail
- **Code existant** : [Oui/Non]
- **Rétro-ingénierie nécessaire** : [Oui/Non]

## Progression des étapes
[Sera renseigné au fur et à mesure de l'avancement du workflow]
```

## Étape 5 : Présenter le message de fin

**Pour les projets Brownfield :**
```markdown
# 🔍 Détection de l'espace de travail terminée

Résultats de l'analyse de l'espace de travail :
• **Type de projet** : Projet Brownfield
• [Résumé généré par l'IA des résultats de l'espace de travail, sous forme de puces]
• **Étape suivante** : Passage à la **Rétro-ingénierie** pour analyser le code existant...
```

**Pour les projets Greenfield :**
```markdown
# 🔍 Détection de l'espace de travail terminée

Résultats de l'analyse de l'espace de travail :
• **Type de projet** : Projet Greenfield
• **Étape suivante** : Passage à l'**Analyse des exigences**...
```

## Étape 6 : Poursuivre automatiquement

- **Aucune approbation utilisateur requise** — ceci est purement informatif
- Passer automatiquement à la phase suivante :
  - **Brownfield** : Rétro-ingénierie (si aucun artefact existant) ou Analyse des exigences (si des artefacts existent)
  - **Greenfield** : Analyse des exigences
