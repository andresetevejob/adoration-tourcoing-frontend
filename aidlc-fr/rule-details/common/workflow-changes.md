# Changements en cours de workflow et gestion des phases

## Vue d'ensemble

Les utilisateurs peuvent demander des changements au plan d'exécution ou à l'exécution des phases en cours de workflow. Ce document fournit des conseils pour traiter ces demandes de manière sûre et efficace.

---

## Types de changements en cours de workflow

### 1. Ajout d'une phase ignorée

**Scénario** : l'utilisateur souhaite ajouter une phase qui avait été initialement ignorée

**Exemple** : « En fait, je veux ajouter les récits utilisateur même si nous avons sauté cette étape »

**Traitement** :
1. **Confirmer la demande** : « Vous souhaitez ajouter l'étape Récits utilisateur. Cela créera des récits utilisateur et des personas. Confirmez-vous ? »
2. **Vérifier les dépendances** : s'assurer que toutes les phases prérequises sont terminées
3. **Mettre à jour le plan d'exécution** : ajouter la phase à `execution-plan.md` avec sa justification
4. **Mettre à jour l'état** : marquer la phase comme « EN ATTENTE » dans `aidlc-state.md`
5. **Exécuter la phase** : suivre le processus normal d'exécution de phase
6. **Consigner le changement** : documenter dans `audit.md` avec horodatage et raison

**Considérations** :
- Peut nécessiter la mise à jour de phases ultérieures pouvant bénéficier des nouveaux artefacts
- Les artefacts existants peuvent nécessiter une révision pour intégrer les nouvelles informations
- Le calendrier sera prolongé

---

### 2. Omission d'une phase planifiée

**Scénario** : l'utilisateur souhaite ignorer une phase qui était planifiée pour s'exécuter

**Exemple** : « Sautons l'étape Conception NFR pour l'instant »

**Traitement** :
1. **Confirmer la demande** : « Vous souhaitez ignorer la Conception NFR. Cela signifie qu'aucun pattern NFR ni composant logique ne sera intégré. Confirmez-vous ? »
2. **Avertir de l'impact** : expliquer ce qui manquera et les conséquences potentielles
3. **Obtenir une confirmation explicite** : l'utilisateur doit confirmer explicitement avoir compris l'impact
4. **Mettre à jour le plan d'exécution** : marquer la phase comme « IGNORÉE » avec la raison
5. **Mettre à jour l'état** : marquer la phase comme « IGNORÉE » dans `aidlc-state.md`
6. **Ajuster les phases ultérieures** : noter que les phases ultérieures peuvent nécessiter une configuration manuelle
7. **Consigner le changement** : documenter dans `audit.md` avec horodatage et raison

**Considérations** :
- Les phases ultérieures peuvent échouer ou nécessiter une intervention manuelle
- L'utilisateur accepte la responsabilité des artefacts manquants
- Peut être réintégré plus tard si nécessaire

---

### 3. Redémarrage de l'étape en cours

**Scénario** : l'utilisateur n'est pas satisfait des résultats de l'étape en cours et souhaite la refaire

**Exemple** : « Je n'aime pas ces récits utilisateur. Pouvons-nous recommencer ? »

**Traitement** :
1. **Comprendre la préoccupation** : « Que souhaiteriez-vous changer précisément dans les récits ? »
2. **Proposer des options** :
   - **Option A** : modifier les artefacts existants (plus rapide, préserve une partie du travail)
   - **Option B** : redémarrage complet (table rase, plus de temps)
3. **Si le redémarrage est choisi** :
   - Archiver les artefacts existants : `{artefact}.backup.{horodatage}`
   - Réinitialiser les cases à cocher de l'étape dans le fichier de plan
   - Marquer l'étape comme « EN COURS » dans `aidlc-state.md`
   - Effacer le statut d'achèvement de l'étape
   - Réexécuter depuis le début
4. **Consigner le changement** : documenter la raison du redémarrage et ce qui va changer

**Considérations** :
- Le travail existant sera perdu (mais sauvegardé)
- Peut nécessiter de refaire les étapes dépendantes
- Le calendrier sera prolongé

---

### 4. Redémarrage d'une étape précédente

**Scénario** : l'utilisateur souhaite revenir en arrière et refaire une étape terminée

**Exemple** : « Je veux changer la décision architecturale que nous avons prise plus tôt »

**Traitement** :
1. **Évaluer l'impact** : identifier toutes les étapes qui dépendent de l'étape à redémarrer
2. **Avertir l'utilisateur** : « Redémarrer la Conception de l'application nécessitera de refaire : Planification des unités, Génération des unités, conception par unité (toutes les unités), Planification du code, Génération de code. Confirmez-vous ? »
3. **Obtenir une confirmation explicite** : l'utilisateur doit comprendre l'impact complet
4. **Si confirmé** :
   - Archiver tous les artefacts concernés
   - Réinitialiser toutes les étapes concernées dans `aidlc-state.md`
   - Effacer les cases à cocher dans tous les fichiers de plan concernés
   - Revenir à l'étape à redémarrer
   - Réexécuter à partir de ce point
5. **Consigner le changement** : documenter l'impact complet et la raison du redémarrage

**Considérations** :
- Travail de reprise important requis
- Toutes les étapes dépendantes doivent être refaites
- Le calendrier sera significativement prolongé
- Envisager si une modification vaut mieux qu'un redémarrage

---

### 5. Changement de profondeur d'étape

**Scénario** : l'utilisateur souhaite changer le niveau de profondeur de l'étape actuelle ou à venir

**Exemple** : « Faisons une analyse des exigences complète plutôt que standard »

**Traitement** :
1. **Confirmer la demande** : « Vous souhaitez faire passer l'Analyse des exigences de la profondeur Standard à Complète. Ce sera plus approfondi mais prendra plus de temps. Confirmez-vous ? »
2. **Mettre à jour le plan d'exécution** : changer le niveau de profondeur dans `workflow-planning.md`
3. **Ajuster l'approche** : suivre les lignes directrices de profondeur complète pour l'étape
4. **Mettre à jour les estimations** : informer l'utilisateur de la nouvelle estimation de calendrier
5. **Consigner le changement** : documenter le changement de profondeur et sa raison

**Considérations** :
- Plus de profondeur = plus de temps mais meilleure qualité
- Moins de profondeur = plus rapide mais peut manquer des détails
- Ne peut être changé qu'avant ou pendant l'étape, pas après son achèvement

---

### 6. Mise en pause du workflow

**Scénario** : l'utilisateur doit faire une pause et reprendre plus tard

**Exemple** : « Je dois m'arrêter pour l'instant et continuer demain »

**Traitement** :
1. **Terminer l'étape en cours** : finir l'étape en cours si possible
2. **Mettre à jour les cases à cocher** : marquer toutes les étapes terminées avec [x]
3. **Mettre à jour l'état** : s'assurer que `aidlc-state.md` reflète le statut actuel
4. **Consigner la pause** : documenter le point de pause dans `audit.md`
5. **Fournir des instructions de reprise** : « À votre retour, je détecterai votre projet existant et proposerai de continuer à partir de : [phase actuelle, étape actuelle] »

**À la reprise** :
1. **Détecter le projet existant** : vérifier la présence de `aidlc-state.md`
2. **Charger le contexte** : lire tous les artefacts des étapes terminées
3. **Afficher le statut** : afficher l'étape actuelle et la prochaine étape
4. **Proposer des options** : continuer là où on s'est arrêté ou revoir le travail précédent
5. **Consigner la reprise** : documenter le point de reprise dans `audit.md`

---

### 7. Changement de décision architecturale

**Scénario** : l'utilisateur souhaite passer d'un monolithe à des microservices (ou inversement)

**Exemple** : « En fait, faisons des microservices au lieu d'un monolithe »

**Traitement** :
1. **Évaluer la progression actuelle** : déterminer jusqu'où on est allé dans le workflow
2. **Expliquer l'impact** :
   - Si avant la Planification des unités : impact minimal, juste mettre à jour la décision
   - Si après la Planification des unités : il faut refaire la Planification des unités, la Génération des unités, toute la conception par unité
   - Si après la Génération de code : reprise significative nécessaire
3. **Recommander une approche** :
   - Tôt dans le workflow : redémarrer à partir de l'étape Conception de l'application
   - Tard dans le workflow : envisager si une modification est réalisable plutôt qu'un redémarrage
4. **Obtenir une confirmation** : l'utilisateur doit comprendre l'ampleur complète du changement
5. **Exécuter le changement** : suivre les procédures de redémarrage pour les étapes concernées

**Considérations** :
- Les changements architecturaux ont des effets en cascade
- Plus tôt dans le workflow = plus facile à changer
- Plus tard dans le workflow = évaluer le coût par rapport au bénéfice

---

### 8. Ajout/suppression d'unités

**Scénario** : l'utilisateur souhaite ajouter ou supprimer des unités après la Génération des unités

**Exemple** : « Nous devons diviser l'unité Paiement en Paiement et Facturation »

**Traitement** :
1. **Évaluer l'impact** : déterminer quelles unités ont une conception/un code terminés
2. **Expliquer les conséquences** :
   - Ajout d'unité : nécessite une conception et un code complets pour la nouvelle unité
   - Suppression d'unité : nécessite de redistribuer la fonctionnalité vers d'autres unités
   - Division d'unité : nécessite de refaire la conception et le code des deux unités résultantes
3. **Mettre à jour les artefacts d'unité** :
   - Modifier `unit-of-work.md`
   - Mettre à jour `unit-of-work-dependency.md`
   - Réviser `unit-of-work-story-map.md`
4. **Réinitialiser les unités concernées** : marquer les unités concernées comme nécessitant une reconception
5. **Exécuter les changements** : suivre le processus normal de conception et de code d'unité pour les unités concernées

**Considérations** :
- Affecte toutes les étapes en aval pour ces unités
- Peut affecter d'autres unités si les dépendances changent
- L'impact sur le calendrier dépend du nombre d'unités concernées

---

## Lignes directrices générales pour la gestion des changements

### Avant de faire des changements

1. **Comprendre la demande** : poser des questions de clarification sur ce que l'utilisateur souhaite changer et pourquoi
2. **Évaluer l'impact** : identifier toutes les étapes, artefacts et dépendances concernés
3. **Expliquer les conséquences** : communiquer clairement ce qui devra être refait et l'impact sur le calendrier
4. **Proposer des alternatives** : parfois, une modification vaut mieux qu'un redémarrage
5. **Obtenir une confirmation explicite** : l'utilisateur doit comprendre et accepter l'impact

### Pendant les changements

1. **Archiver le travail existant** : toujours sauvegarder avant de faire des changements destructifs
2. **Mettre à jour tout le suivi** : garder `aidlc-state.md`, les fichiers de plan et `audit.md` synchronisés
3. **Communiquer la progression** : tenir l'utilisateur informé de ce qui se passe
4. **Valider les changements** : s'assurer que les changements sont cohérents dans tous les artefacts
5. **Tester la continuité** : vérifier que le workflow peut continuer sans problème après les changements

### Après les changements

1. **Vérifier la cohérence** : vérifier que tous les artefacts sont alignés avec les changements
2. **Mettre à jour la documentation** : s'assurer que toutes les références sont mises à jour
3. **Consigner intégralement** : documenter l'historique complet des changements dans `audit.md`
4. **Confirmer avec l'utilisateur** : vérifier que les changements répondent aux attentes de l'utilisateur
5. **Reprendre le workflow** : continuer l'exécution normale à partir du nouvel état

---

## Arbre de décision pour les demandes de changement

```
L'utilisateur demande un changement
    |
    ├─ Est-ce la phase actuelle ?
    |   ├─ Oui : peut modifier ou redémarrer la phase actuelle
    |   └─ Non : passer à la question suivante
    |
    ├─ Est-ce une phase terminée ?
    |   ├─ Oui : évaluer l'impact sur les phases dépendantes
    |   |   ├─ Impact faible : modifier et mettre à jour les dépendantes
    |   |   └─ Impact élevé : recommander un redémarrage à partir de cette phase
    |   └─ Non : passer à la question suivante
    |
    ├─ S'agit-il d'ajouter une phase ignorée ?
    |   ├─ Oui : vérifier les prérequis, ajouter au plan, exécuter
    |   └─ Non : passer à la question suivante
    |
    ├─ S'agit-il d'ignorer une phase planifiée ?
    |   ├─ Oui : avertir de l'impact, obtenir confirmation, ignorer
    |   └─ Non : passer à la question suivante
    |
    └─ S'agit-il de changer le niveau de profondeur ?
        ├─ Oui : mettre à jour le plan, ajuster l'approche
        └─ Non : clarifier la demande avec l'utilisateur
```

---

## Exigences de journalisation

### Format du journal des demandes de changement

```markdown
## Demande de changement - [Nom de la phase]
**Horodatage** : [horodatage ISO]
**Demande** : [ce que l'utilisateur souhaite changer]
**État actuel** : [où on en est dans le workflow]
**Évaluation de l'impact** : [ce qui sera affecté]
**Confirmation de l'utilisateur** : [confirmation explicite de l'utilisateur]
**Action entreprise** : [ce qui a été fait]
**Artefacts concernés** : [liste des fichiers modifiés/réinitialisés]

---
```

---

## Bonnes pratiques

1. **Toujours confirmer** : ne jamais effectuer de changements destructifs sans confirmation explicite de l'utilisateur
2. **Expliquer l'impact** : les utilisateurs doivent comprendre les conséquences avant de décider
3. **Proposer des options** : il existe parfois plusieurs façons de traiter un changement
4. **Archiver d'abord** : toujours sauvegarder avant de faire des changements destructifs
5. **Tout mettre à jour** : garder tous les fichiers de suivi synchronisés
6. **Consigner minutieusement** : documenter tous les changements pour l'historique d'audit
7. **Valider ensuite** : s'assurer que le workflow peut continuer sans problème
8. **Être flexible** : le workflow doit s'adapter aux besoins de l'utilisateur, pas imposer un processus rigide
