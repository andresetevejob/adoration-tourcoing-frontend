# Profondeur adaptative

**Objectif** : Expliquer comment AI-DLC adapte le niveau de détail à la complexité du problème

## Principe fondamental

**Lorsqu'une étape s'exécute, TOUS ses artefacts définis sont créés. La « profondeur » désigne le niveau de détail et de rigueur au sein de ces artefacts, qui s'adapte à la complexité du problème.**

## Sélection de l'étape vs niveau de détail

### Sélection de l'étape (binaire)
- **La Planification du workflow** décide : EXÉCUTER ou IGNORER pour chaque étape
- **Si EXÉCUTER** : l'étape s'exécute et crée TOUS ses artefacts définis
- **Si IGNORER** : l'étape ne s'exécute pas du tout

### Niveau de détail (adaptatif)
- **Problèmes simples** : artefacts concis avec le détail essentiel
- **Problèmes complexes** : artefacts complets avec un détail approfondi
- **Le modèle décide** : en fonction des caractéristiques du problème, pas de règles prescriptives

## Facteurs influençant le niveau de détail

Le modèle prend en compte les facteurs suivants pour déterminer le détail approprié :

1. **Clarté de la demande** : la demande de l'utilisateur est-elle claire et complète ?
2. **Complexité du problème** : quelle est la complexité de l'espace de solution ?
3. **Portée** : fichier unique, composant, plusieurs composants, ou l'ensemble du système ?
4. **Niveau de risque** : quel est l'impact des erreurs ou des omissions ?
5. **Contexte disponible** : greenfield vs brownfield, documentation existante
6. **Préférences de l'utilisateur** : l'utilisateur a-t-il exprimé une préférence pour la concision ou le détail ?

## Exemple : artefacts de l'Analyse des exigences

**Tous les scénarios créent les mêmes artefacts** :
- `requirement-verification-questions.md` (si nécessaire)
- `requirements.md`

**Remarque** : la demande initiale de l'utilisateur est capturée dans `audit.md` (pas besoin d'un user-intent.md séparé)

**Le niveau de détail varie selon la complexité** :

### Scénario simple (correction de bug)
- **requirement-verification-questions.md** : questions de clarification nécessaires
- **requirements.md** : exigence fonctionnelle concise, sections minimales

### Scénario complexe (migration système)
- **requirement-verification-questions.md** : plusieurs cycles, 10+ questions
- **requirements.md** : exigences fonctionnelles + non fonctionnelles complètes, traçabilité, critères d'acceptation

## Exemple : artefacts de la Conception de l'application

**Tous les scénarios créent les mêmes artefacts** :
- `application-design.md`
- `component-diagram.md`

**Le niveau de détail varie selon la complexité** :

### Scénario simple (composant unique)
- **application-design.md** : description basique du composant, méthodes clés
- **component-diagram.md** : diagramme simple avec les relations essentielles

### Scénario complexe (système multi-composants)
- **application-design.md** : responsabilités détaillées des composants, toutes les méthodes avec leurs signatures, patterns de conception, alternatives envisagées
- **component-diagram.md** : diagramme complet avec toutes les relations, flux de données, points d'intégration

## Principe directeur pour le modèle

**« Créer exactement le niveau de détail nécessaire pour le problème en question — ni plus, ni moins. »**

- Ne pas gonfler artificiellement les problèmes simples avec des détails inutiles
- Ne pas brader les problèmes complexes en omettant des détails critiques
- Laisser les caractéristiques du problème déterminer naturellement le niveau de détail
- Tous les artefacts requis sont toujours créés lorsque l'étape s'exécute
