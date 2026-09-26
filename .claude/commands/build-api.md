---
description: Orchestre la conception, l'implémentation, les tests, les requêtes Bruno et la revue d'une fonctionnalité d'API en déléguant aux agents api-architect, api-developer, test-engineer, bruno-developer et code-reviewer.
argument-hint: <description de la fonctionnalité, ou référence à une story/un epic (ex. "Story 9" ou "Epic 3")>
---

Tu agis comme **orchestrateur**. Tu ne conçois pas, n'implémentes pas, n'écris pas de tests, ne crées pas de requêtes Bruno et ne fais pas la revue toi-même : tu délègues chaque phase à l'agent spécialisé correspondant (outil Task, `subagent_type` = nom de l'agent), tu synthétises leurs résultats, et tu es le seul point de contact avec l'utilisateur entre les phases.

Demande : $ARGUMENTS

## Étape 0 — Contexte technique
- Vérifie si `.claude/tech-stack.md` existe à la racine du projet.
- S'il n'existe pas : déduis la stack des fichiers de build présents (pom.xml, build.gradle, package.json, requirements.txt/pyproject.toml, go.mod, *.csproj...), présente-la à l'utilisateur, et propose de créer `.claude/tech-stack.md` avec ce contenu pour que les agents suivants (et les prochaines sessions) n'aient pas à la redéduire.

## Étape 0bis — Résolution de la demande (si le projet utilise AI-DLC ou un backlog documenté)
- Si `aidlc-docs/inception/user-stories/stories.md` existe (ou un autre fichier de backlog équivalent indiqué par l'utilisateur) : c'est la **source de vérité** pour le périmètre fonctionnel, pas $ARGUMENTS seul.
- Si $ARGUMENTS référence une story/un epic par nom ou numéro (ex. "Story 9", "Epic 3 — Réservation") : va lire cette section précise dans le fichier de stories et utilise son texte complet (description, critères d'acceptation) comme périmètre de la fonctionnalité, pas juste le titre.
- Si $ARGUMENTS est vague ("travaille sur les user stories", "implémente le backlog") : liste les epics/stories du fichier, propose un découpage en lots cohérents (une story isolée si elle est autonome, un groupe de stories si elles partagent le même modèle de données/composant — ex. un epic entier comme l'authentification), et demande à l'utilisateur de choisir par quel lot commencer plutôt que de tout lancer d'un coup. Un seul lot = un seul passage complet des étapes 1 à 5 ci-dessous.
- Si des exigences (`requirements.md`) existent et sont référencées par la story (ex. "FR-BOOK-1"), va les lire aussi pour le contexte des règles métier.
- Une fois le lot traité de bout en bout (étape 5), redemande explicitement à l'utilisateur s'il veut enchaîner sur le lot suivant — ne jamais enchaîner plusieurs lots automatiquement.

## Étape 1 — Conception (agent api-architect)
- Délègue à `api-architect` : fournis-lui le périmètre résolu à l'étape 0bis (texte complet de la story/du lot, pas juste son titre) et le chemin de `.claude/tech-stack.md`.
- Présente la conception reçue à l'utilisateur. Attends une confirmation ("continue", "modifie X") avant de passer à l'implémentation — ne pas enchaîner automatiquement.

## Étape 2 — Implémentation (agent api-developer)
- Délègue à `api-developer` en lui transmettant la conception validée.
- Présente le résumé des fichiers créés/modifiés.

## Étape 3 — Tests (agent test-engineer)
- Délègue à `test-engineer` en lui indiquant les fichiers/endpoints livrés à l'étape 2.
- Si des bugs applicatifs sont remontés (et non des bugs de test) : renvoie-les à `api-developer` pour correction, puis relance les tests concernés. Répète jusqu'à ce que les tests passent ou que l'utilisateur décide d'arbitrer autrement.

## Étape 4 — Requêtes Bruno (agent bruno-developer)
- Délègue à `bruno-developer` en lui transmettant la conception validée (endpoints, DTOs, codes HTTP) et les fichiers implémentés à l'étape 2.
- L'agent crée les fichiers `.bru` (un par requête) couvrant le happy path et les cas d'erreur pour chaque endpoint livré.
- Présente le résumé des fichiers `.bru` créés.
- Cette étape peut être lancée en parallèle de l'étape 3 (tests) si les deux agents sont disponibles.

## Étape 5 — Revue (agent code-reviewer)
- Délègue à `code-reviewer` une fois l'implémentation, les tests et les requêtes Bruno stabilisés.
- Présente les findings à l'utilisateur classés par sévérité. Pour les findings bloquants, propose de les renvoyer à `api-developer` avant de conclure ; pour les findings mineurs, laisse l'utilisateur décider.

## Étape 6 — Synthèse finale
- Résume ce qui a été livré : fichiers créés/modifiés, tests ajoutés, requêtes Bruno créées, findings de revue restants (le cas échéant), et les éventuels points ouverts remontés par api-architect à l'étape 1.

## Règles
- Ne saute pas une étape sans le dire explicitement à l'utilisateur et obtenir son accord (ex. "pas besoin de tests ici, on passe direct à la revue ?").
- Ne fais jamais le travail d'un agent toi-même — si un agent semble insuffisant, ajuste la délégation plutôt que de contourner l'agent.
- Reste concis dans tes synthèses entre les étapes : les détails complets sont dans les fichiers modifiés, pas besoin de tout répéter.
