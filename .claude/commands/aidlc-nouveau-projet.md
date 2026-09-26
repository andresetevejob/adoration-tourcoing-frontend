---
description: Démarre un nouveau projet avec AI-DLC-fr — cadrage complet (Inception), découpage en capacités/unités, création des propositions OpenSpec correspondantes, puis délégation de la Construction aux agents spécialisés (api-architect, api-developer, test-engineer, bruno-developer, code-reviewer), avec graduation finale vers openspec/specs/.
argument-hint: <intention de départ du projet, ex. "API de gestion de réservations de restaurants avec auth JWT">
---

Tu agis comme **orchestrateur** du démarrage d'un nouveau projet. Tu ne conçois pas, n'implémentes pas, n'écris pas de tests toi-même : tu pilotes le cadrage (AI-DLC-fr), tu ouvres les propositions OpenSpec correspondantes, puis tu délègues chaque phase de Construction à l'agent spécialisé correspondant (outil Task, `subagent_type` = nom de l'agent).

Intention de départ : $ARGUMENTS

## Étape 0 — Vérifications préalables
- Vérifie que `aidlc-fr/core-workflow.md` et `openspec/README.md` existent à la racine du projet. S'ils manquent, arrête-toi et indique à l'utilisateur de les copier depuis le dépôt `aidlc-workflows` (`aidlc-fr/` et `openspec/`), ainsi que `.claude/agents/` et `.claude/commands/` s'ils manquent aussi.
- Scanne le projet pour du code applicatif existant. Si le projet n'est manifestement **pas** vierge (code métier déjà présent au-delà d'un simple scaffold), signale-le : cette commande est prévue pour un démarrage greenfield. Propose `/openspec-triage` à la place, et arrête-toi sauf si l'utilisateur confirme vouloir continuer malgré tout.
- Si `openspec/specs/` ou `openspec/changes/` n'existent pas, crée-les vides. Si `openspec/project.md` n'existe pas, tu le rempliras à l'étape 1.

## Étape 1 — Inception AI-DLC-fr (cadrage WHAT/WHY)
Charge et exécute, dans l'ordre, les étapes correspondantes de `aidlc-fr/core-workflow.md` et de `aidlc-fr/rule-details/inception/` :
1. **Détection de l'espace de travail** — confirme le greenfield, initialise `aidlc-docs/audit.md` (append-only) et `aidlc-docs/aidlc-state.md`.
2. **Analyse des exigences** — documente l'intention, pose les questions de clarification nécessaires (format `[Réponse]:`). Le résultat alimente aussi `openspec/project.md` (stack technique, conventions).
3. **Récits utilisateur** (si pertinent selon l'évaluation intelligente du fichier `user-stories.md`).
4. **Conception de l'application** — identifie les capacités métier (nommage verbe-nom, ex. `user-auth`, `payment-capture`) : c'est ce découpage qui définira les capacités OpenSpec.
5. **Génération des unités** — décompose chaque capacité en unité(s) de travail exécutables.

Applique la profondeur adaptative (minimale/standard/complète) comme défini dans `aidlc-fr/rule-details/common/depth-levels.md`.

## Étape 2 — Ouverture des propositions OpenSpec
Pour **chaque capacité** identifiée à l'étape 1 :
- Crée `openspec/changes/{nom-capacité}/proposal.md` avec les sections Why (depuis l'analyse des exigences) / What Changes (depuis la conception de l'application) / Impact (capacités et fichiers concernés).
- Crée `openspec/changes/{nom-capacité}/tasks.md` qui référence les plans détaillés que produira la Construction (pas de duplication — un pointeur suffit, ex. "voir `aidlc-docs/construction/plans/{unit}-code-generation-plan.md`").

## Étape 3 — Approbation
Présente en une seule fois : le plan d'exécution AI-DLC-fr (capacités, unités, profondeur retenue) **et** la liste des propositions OpenSpec ouvertes. **Attends une confirmation explicite** avant de continuer — ne jamais enchaîner automatiquement sur la Construction.

## Étape 4 — Construction, par unité
- **Une seule unité** : délègue toi-même la chaîne complète comme le fait `/build-api` — `api-architect` (conception) → `api-developer` (implémentation) → `test-engineer` (tests) → `bruno-developer` (collections Bruno, peut tourner en parallèle des tests) → `code-reviewer` (revue finale). Présente un résumé après chaque étape et attends confirmation avant de passer à la suivante.
- **Plusieurs unités indépendantes** : présente le découpage et propose explicitement `/launch-team "<capacité 1> | <capacité 2> | ..."` pour les traiter en parallèle dans des terminaux séparés. Si l'utilisateur préfère rester dans cette session, traite les unités une par une (même chaîne que ci-dessus), et redemande confirmation avant chaque unité suivante — ne jamais enchaîner plusieurs unités automatiquement.
- Les artefacts générés suivent la structure `aidlc-docs/construction/{unit-name}/...` définie dans `aidlc-fr/core-workflow.md`.

## Étape 5 — Graduation OpenSpec (par capacité livrée)
Une fois le Build et Tests validé pour une capacité :
1. Écris `openspec/specs/{capacité}/spec.md` (WHAT/WHY) à partir des exigences et de la conception de l'application retenues pour cette capacité.
2. Écris `openspec/specs/{capacité}/design.md` (HOW) à partir de la conception fonctionnelle / NFR / infrastructure produites en Construction.
3. Présente le contenu à l'utilisateur avant écriture définitive.
4. Déplace `openspec/changes/{capacité}/` vers `openspec/changes/archive/AAAA-MM-JJ-{capacité}/`.

## Étape 6 — Synthèse finale
Résume : capacités livrées, entrées `specs/` créées, changes archivées, fichiers/tests/collections Bruno générés, et les capacités restantes non encore traitées (le cas échéant, avec suggestion de `/launch-team` ou de relancer cette commande sur la suite).

## Règles
- Ne saute jamais une étape d'approbation sans le dire explicitement et obtenir l'accord de l'utilisateur.
- Ne fais jamais le travail d'un agent toi-même (conception, code, tests, revue) — délègue toujours.
- Consigne toute entrée utilisateur dans `aidlc-docs/audit.md` en mode ajout (append), jamais en écrasant le fichier.
