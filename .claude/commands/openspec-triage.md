---
description: Point d'entrée pour toute demande sur un projet existant (bug ou nouvelle fonctionnalité) — lit openspec/specs/ et openspec/changes/, décide si c'est une correction directe ou si une proposition de changement est nécessaire, délègue l'implémentation aux agents spécialisés (au besoin via le moteur de Construction AI-DLC-fr), puis synchronise openspec/specs/ à la fin.
argument-hint: <description de la demande : bug à corriger, ou fonctionnalité à ajouter/modifier>
---

Tu agis comme **orchestrateur**. Tu ne conçois pas, n'implémentes pas, n'écris pas de tests toi-même : tu tries la demande selon les conventions OpenSpec, puis tu délègues à l'agent spécialisé correspondant (outil Task, `subagent_type` = nom de l'agent).

Demande : $ARGUMENTS

## Étape 0 — Vérifications préalables
- Vérifie que `openspec/README.md` existe à la racine du projet. S'il manque, arrête-toi et indique à l'utilisateur de le copier depuis le dépôt `aidlc-workflows`, ou de lancer `/aidlc-nouveau-projet` si le projet n'a en réalité jamais été cadré.
- Charge `openspec/README.md` pour les règles de triage complètes (section "Common Scenarios and Clarifications").

## Étape 1 — Lecture du contexte
- Lis les specs pertinentes dans `openspec/specs/{capacité}/spec.md` (+ `design.md`) pour la ou les capacités visées par la demande.
- Vérifie `openspec/changes/` pour des propositions en cours qui pourraient entrer en conflit avec cette demande — signale tout chevauchement à l'utilisateur avant de continuer.
- S'il n'existe **aucune** spec pour la capacité concernée : traite le comportement actuel du code comme la spec implicite (comme prévu par OpenSpec) — ta proposition devra alors documenter l'état actuel ET le changement proposé.

## Étape 2 — Triage : bug ou changement de comportement ?
Applique les règles d'`openspec/README.md` :
- **Bug confirmé** (contredit une spec claire, ou restaure un comportement manifestement voulu, typo, formatage, dépendance non cassante, config, ajout de tests, doc) → pas de proposition, va à l'étape 3a.
- **Nouvelle fonctionnalité / breaking change / changement d'architecture / sécurité auth / impact multi-systèmes** → proposition obligatoire, va à l'étape 3b.
- **Ambigu** (spec absente ou vague, ou code et spec en désaccord sans qu'on sache lequel fait foi) → pose explicitement la question à l'utilisateur (ex. "L'API retourne 404, la spec ne précise rien : dois-je traiter ceci comme un bug ou documenter un nouveau comportement ?"). Par défaut, en cas de doute persistant, traite comme une proposition (option la plus sûre).
- **Urgence production annoncée par l'utilisateur** → va directement à l'étape 3c.

## Étape 3a — Bug confirmé (correction directe)
- Délègue à `api-developer` la correction, en lui donnant la spec de référence (comportement attendu) et le fichier/symptôme concerné.
- Délègue à `test-engineer` un test de non-régression couvrant ce bug.
- Si la spec elle-même était fausse ou absente sur ce point précis, corrige aussi `openspec/specs/{capacité}/spec.md` en conséquence (pas d'archivage de change nécessaire pour un simple bug fix).

## Étape 3b — Fonctionnalité / changement de comportement (proposition)
1. Crée `openspec/changes/{nom}/proposal.md` (Why / What Changes / Impact) et, si le changement modifie une spec existante, `openspec/changes/{nom}/patches/{capacité}/spec.md.diff`.
2. Si le changement est non trivial (nouveaux composants, plusieurs capacités touchées), charge `aidlc-fr/rule-details/inception/application-design.md` et mène une conception applicative allégée — pas besoin de refaire toute l'Analyse des exigences puisque les specs existantes font déjà foi, mais pose les questions de clarification nécessaires (format `[Réponse]:`).
3. Crée `openspec/changes/{nom}/tasks.md`.
4. **Attends l'approbation explicite** de la proposition avant toute implémentation.
5. Une fois approuvée, délègue la Construction : `api-architect` (si conception détaillée nécessaire) → `api-developer` → `test-engineer` → `bruno-developer` (peut tourner en parallèle des tests) → `code-reviewer`. Présente un résumé après chaque étape et attends confirmation avant de continuer.

## Étape 3c — Hotfix d'urgence
1. Annonce clairement : "**Ceci est un correctif d'urgence**".
2. Délègue immédiatement à `api-developer` (et `test-engineer` pour un test de non-régression minimal) — pas d'attente d'approbation de proposition avant l'implémentation.
3. Une fois le correctif en place, crée rétroactivement `openspec/changes/{nom}/proposal.md` documentant ce qui a été fait et pourquoi.
4. Va à l'étape 4 en taguant l'archivage `[EMERGENCY]`.

## Étape 4 — Graduation (cas 3b et 3c uniquement)
1. Mets à jour `openspec/specs/{capacité}/spec.md` (et `design.md` si la conception technique a changé) pour refléter la nouvelle réalité déployée.
2. Présente le contenu à l'utilisateur avant écriture définitive.
3. Déplace `openspec/changes/{nom}/` vers `openspec/changes/archive/AAAA-MM-JJ-{nom}/` (ajoute le préfixe `[EMERGENCY]-` au nom du dossier si l'étape 3c a été utilisée).

## Étape 5 — Synthèse finale
Résume : décision de triage prise et pourquoi, fichiers modifiés, tests ajoutés, spec(s) mise(s) à jour, change archivée (le cas échéant).

## Règles
- Ne crée jamais de proposition pour un bug confirmé, et ne corrige jamais silencieusement un vrai changement de comportement sans proposition — en cas de doute, privilégie la proposition.
- Ne fais jamais le travail d'un agent toi-même — délègue toujours.
- N'implémente rien avant l'approbation de la proposition, sauf cas d'urgence explicitement annoncé (étape 3c).
