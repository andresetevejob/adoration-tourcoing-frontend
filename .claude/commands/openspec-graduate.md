---
description: Promeut manuellement une proposition OpenSpec (openspec/changes/{nom}/) vers les specs vivantes (openspec/specs/{capacité}/) une fois le travail livré, puis archive la proposition. Utile après un hotfix, un /build-api ou un /launch-team lancé sans passer par /aidlc-nouveau-projet ou /openspec-triage, ou pour rattraper un travail fait hors processus.
argument-hint: <nom du change à graduer, ex. "add-password-reset" ; ou description du travail livré si aucun change n'existe encore>
---

Tu agis comme **orchestrateur de documentation** : tu ne modifies pas le code, tu synchronises `openspec/specs/` avec ce qui a réellement été livré.

Cible : $ARGUMENTS

## Étape 1 — Localiser le change
- Cherche `openspec/changes/{nom}/` correspondant à $ARGUMENTS.
- **S'il n'existe pas** (travail livré hors processus, ex. via `/build-api` ou `/launch-team` directement) : propose d'en créer un rétroactivement. Utilise `git log`/`git diff` et les fichiers modifiés pour reconstituer le Why/What/Impact, présente-le à l'utilisateur pour confirmation avant de l'écrire dans `openspec/changes/{nom}/proposal.md`.

## Étape 2 — Rassembler le contenu
Lis, selon ce qui est disponible :
- `openspec/changes/{nom}/proposal.md` et `tasks.md`
- `openspec/changes/{nom}/patches/{capacité}/spec.md.diff` (s'il existe)
- Les artefacts `aidlc-docs/inception/application-design/` et `aidlc-docs/construction/{unit}/` liés (s'ils existent — sinon, base-toi sur le code et les tests livrés)

## Étape 3 — Déterminer la ou les capacités concernées
- Si une ou plusieurs capacités existent déjà dans `openspec/specs/`, détermine lesquelles sont impactées.
- Sinon, propose un nom de capacité (nommage verbe-nom, ex. `payment-capture`) en respectant les règles d'organisation d'`openspec/README.md` (single purpose, règle des 10 minutes).

## Étape 4 — Rédiger / mettre à jour les specs
1. `openspec/specs/{capacité}/spec.md` — WHAT le système fait maintenant et POURQUOI (comportement observable, contraintes).
2. `openspec/specs/{capacité}/design.md` — HOW c'est construit (patterns établis, décisions techniques qui ne sont pas évidentes à la lecture du code).
3. Présente le contenu proposé (ou le diff si la spec existait déjà) à l'utilisateur. **Attends confirmation** avant d'écrire.

## Étape 5 — Archiver
- Déplace `openspec/changes/{nom}/` vers `openspec/changes/archive/AAAA-MM-JJ-{nom}/`.
- Si la cible n'avait pas de dossier `changes/` préexistant (rattrapage rétroactif), archive directement le dossier reconstitué à l'étape 1.

## Étape 6 — Synthèse finale
Résume : capacité(s) mise(s) à jour, fichiers `spec.md`/`design.md` créés ou modifiés, change archivée.

## Règles
- Ne réécris jamais silencieusement une spec existante sans montrer le changement à l'utilisateur.
- Si le travail à graduer contredit une spec existante sans explication claire, signale-le explicitement plutôt que d'écraser — cela peut indiquer un bug plutôt qu'une évolution volontaire.
