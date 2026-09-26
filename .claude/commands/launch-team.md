---
description: Prépare une équipe d'agents Claude Code, chacun dans son propre terminal tmux (worktree isolé), pour travailler en parallèle sur des lots indépendants (epics/stories). Contrairement à /build-api (délégation invisible dans un seul terminal), ici l'utilisateur converse directement avec chaque agent dans son propre terminal une fois la préparation terminée.
argument-hint: <lots à paralléliser, séparés par " | ", ex. "Epic 2 — Gestion des comptes | Epic 3 — Réservations">
---

Tu prépares une session de travail parallèle en terminaux séparés — ce n'est **pas** une délégation Task classique. Ton rôle s'arrête à la préparation de l'infrastructure : tu ne fais aucun travail d'implémentation toi-même, tu configures l'environnement puis tu rends la main à l'utilisateur pour qu'il aille converser directement dans chaque terminal.

Lots à paralléliser : $ARGUMENTS

## Étape 1 — Vérifications préalables
- Vérifie que le projet est un dépôt git (`git rev-parse --is-inside-work-tree`). Si non : explique qu'un `git init` + un premier commit sont requis avant de continuer, propose de le faire, et **arrête-toi** si l'utilisateur refuse ou ne confirme pas.
- Vérifie que `tmux` est installé (`which tmux`). Si absent : indique la commande d'installation adaptée à l'OS (ex. `brew install tmux` sur macOS) et **arrête-toi**.
- S'il y a des changements non commités (`git status`), signale-le : chaque worktree part de HEAD, donc du travail non commité sur la branche courante ne sera pas visible dans les nouveaux worktrees. Propose de commiter ou stasher avant de continuer.
- Si `aidlc-docs/inception/user-stories/stories.md` (ou équivalent) existe : croise les lots demandés avec les dépendances entre epics/stories qui y sont documentées. Si deux lots demandés en parallèle touchent au même modèle de données ou dépendent l'un de l'autre, signale le risque de conflit à la fusion et demande confirmation avant de continuer.
- Si `aidlc-docs/construction/bugs.md` existe : croise aussi les lots demandés avec les bugs au statut `Ouvert` ou `Différé` qu'il contient. Si un lot touche un epic ayant des bugs ouverts non mentionnés dans la demande, signale-le à l'utilisateur avant de créer les worktrees.

## Étape 2 — Un worktree par lot
Pour chaque lot listé dans $ARGUMENTS, dans l'ordre :
1. Choisis un nom de branche court et lisible dérivé du lot (ex. "Epic 2 — Gestion des comptes" → `feature/epic2-comptes`)
2. Choisis un chemin de worktree frère du répertoire du projet (ex. `../<nom-projet>-epic2`)
3. Crée le worktree : `git worktree add <chemin> -b <branche>`
4. Si le projet a un fichier `.claude/tech-stack.md`, il est déjà visible dans le worktree (fichier versionné) — pas d'action supplémentaire nécessaire.

## Étape 3 — Une session tmux, une fenêtre par lot
- Crée une session tmux nommée d'après le projet si elle n'existe pas déjà (`tmux has-session -t <nom>` puis `tmux new-session -d -s <nom>` si besoin) ; si elle existe déjà, réutilise-la et ajoute simplement de nouvelles fenêtres (ne détruis jamais une session tmux existante).
- Pour chaque worktree créé à l'étape 2, ouvre une fenêtre tmux dédiée : `tmux new-window -t <session> -n <nom-court-du-lot> -c <chemin-worktree>`
- Dans chaque fenêtre, lance `claude` avec un premier message qui brief l'agent sur son rôle et son périmètre exact, par exemple :
  `tmux send-keys -t <session>:<fenêtre> 'claude "Tu travailles exclusivement sur <lot complet> dans ce worktree isolé (branche <branche>). Lis .claude/tech-stack.md pour les conventions du projet ainsi que aidlc-docs/construction/bugs.md pour les bugs connus liés à ce lot (s'\''il existe), puis utilise /build-api <lot> pour mener la conception, l'\''implémentation, les tests et la revue de ce lot avec l'\''utilisateur qui va te rejoindre dans ce terminal."' Enter`
- **N'attache PAS** la session toi-même — c'est à l'utilisateur de le faire ensuite.

## Étape 4 — Rendre la main
Présente à l'utilisateur, de façon concise :
- Le tableau lot ↔ fenêtre tmux ↔ chemin du worktree ↔ branche
- La commande pour s'attacher : `tmux attach -t <session>`
- Le rappel des raccourcis utiles : `Ctrl-b` puis un chiffre (ou `Ctrl-b w`) pour changer de fenêtre, `Ctrl-b d` pour se détacher sans rien tuer
- Précise clairement qu'à partir de maintenant, il converse **directement** avec chaque agent dans sa fenêtre — cet orchestrateur de préparation n'est plus dans la boucle, sauf s'il relance `/launch-team` plus tard pour ajouter un lot.

## Règles
- Ne lance jamais en parallèle deux lots qui touchent visiblement aux mêmes entités/fichiers sans avoir prévenu l'utilisateur du risque de conflit à la fusion et obtenu sa confirmation.
- Ne fais pas le travail des agents toi-même dans ce terminal de préparation — ta seule responsabilité ici est l'infrastructure (worktrees + tmux + message initial).
- Si l'utilisateur relance `/launch-team` plus tard pour un nouveau lot, réutilise la session tmux existante plutôt que d'en recréer une, et ajoute uniquement les nouvelles fenêtres nécessaires.
- Si la création d'un worktree ou d'une fenêtre tmux échoue, arrête-toi et rapporte l'erreur exacte plutôt que de continuer avec un état partiel silencieux.
