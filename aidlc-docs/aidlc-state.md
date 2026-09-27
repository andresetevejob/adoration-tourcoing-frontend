# Suivi de l'état AI-DLC

## Informations sur le projet
- **Nom** : Réservation Adoration Eucharistique — Chapelle du Vœux (frontend)
- **Type de projet** : Greenfield à partir d'un template de base existant (voir note ci-dessous)
- **Date de début** : 2026-09-26
- **Étape actuelle** : 🟢 CONSTRUCTION — Unité U6 (annonces) terminée (conception, implémentation, tests, revue) → en attente de choix de l'unité suivante (U7 Contact recommandée par l'ordre de dépendance)
- **Mode Construction** : session unique séquentielle, ordre choisi par l'utilisateur en commençant par U0
- **Agents de Construction** : adaptés pour couvrir le frontend (cf. audit.md) ; `.claude/tech-stack.md` créé

## Résumé du plan d'exécution
- **Étapes à exécuter** : Conception de l'application, Génération des unités (Inception) ; Génération de code + Build et Tests (Construction, toujours) ; Conception fonctionnelle/NFR/infrastructure (Construction, conditionnel par unité)
- **Étapes ignorées** : Rétro-ingénierie (greenfield-à-partir-d'un-template, aucun comportement métier existant)

## État de l'espace de travail
- **Code existant** : Oui — template React 19/Vite/TS non branché (`App.tsx` → `null`), site vitrine statique dans `index.html` (Tailwind CDN), composants/pages React présents mais non connectés
- **Rétro-ingénierie nécessaire** : Non — aucune logique métier/API existante à documenter ; le template sert de base UI/thème à reprendre (cf. section 0.1 de `prompt-frontend-revise.md`)
- **Cible** : Monorepo npm workspaces — `apps/user-app`, `apps/admin-app`, `packages/shared`

## Progression des étapes

### 🔵 PHASE D'INCEPTION
- [x] Détection de l'espace de travail
- [ ] Rétro-ingénierie — ignorée (greenfield-from-template, cf. audit.md)
- [x] Analyse des exigences (approuvée)
- [x] Récits utilisateur (approuvés, 42 récits + 4 personas)
- [x] Planification du workflow (execution-plan.md rédigé, en attente d'approbation)
- [x] Conception de l'application (approuvée — components.md, component-methods.md, services.md, component-dependency.md)
- [x] Génération des unités (approuvée — 9 unités U0-U8)
- [ ] Planification du workflow
- [ ] Conception de l'application (capacités, unités)
- [ ] Génération des unités

### 🟢 PHASE DE CONSTRUCTION
- [x] U0 — Fondation & Design System (socle-frontend) : conception, implémentation, tests (126 tests, couverture 96%+ shared / 100% apps), revue code-reviewer (1 bloquant + 2 mineurs corrigés) — terminée
- [x] U1 — Authentification & Comptes (dépend de U0) : conception (`u1-authentification-design.md`), correctif bloquant prérequis du bug `skipAuthRetry` dans `packages/shared/src/api/client.ts`, implémentation (routeur react-router, `authStore` Zustand+persist, câblage 401/403, formulaires connexion/inscription, profil, layouts admin/user), build + lint + tests OK (299 tests), revue code-reviewer (2 importants + 1 mineur corrigés : gestion d'erreur `useUpdateProfile`, robustesse `logout()` en cas d'échec réseau, typage `TError`) — terminée
- [x] U2 — Agenda/Planning (dépend de U0, U1) : conception (`u2-agenda-planning-design.md`, versions FullCalendar figées à `6.1.21` après vérification npm — la v7 tout juste publiée aurait cassé le monorepo), implémentation (calendrier lecture seule en code-splitting, anonymisation user-app vs. identité complète admin-app, filtre "mes réservations"), build + lint + tests OK (349 tests), revue code-reviewer (0 bloquant, 1 important + 2 mineurs corrigés : gestion d'erreur réseau planning, libellé de rôle FR sur le badge admin, test de routeur `/planning`) — terminée
- [x] U3 — Réservation/Annulation (dépend de U0, U1, U2) : conception (`u3-reservation-annulation-design.md`, extension du contrat calendrier U2 via `onSelectSlot`/`onEventClick`, `@fullcalendar/interaction` figé à `6.1.21`, correctif préventif `skipForbiddenRedirect` ajouté à `packages/shared/src/api/client.ts` avant implémentation), implémentation (flux réservation en deux étapes formulaire→confirmation, règle d'annulation ≥24h Veilleur uniquement, sélecteur de bénéficiaire admin), build + lint + tests OK (409 tests), revue code-reviewer (0 bloquant, 0 important, 1 mineur documentaire corrigé : affirmation inexacte sur l'usage de `bookingSchema`) — terminée
- [x] U4 — Gestion utilisateurs (dépend de U0, U1 ; admin-app uniquement) : conception (`u4-gestion-utilisateurs-design.md`, restriction structurelle sur les comptes Administrateur/SuperAdministrateur appliquée à trois niveaux — filtrage `useUsers`, `roleOptions` de `UserForm`, garde `isManageableRole` sur `/utilisateurs/:id`), implémentation (CRUD utilisateurs, validation/rejet de compte, `UserForm` réutilisable en vue de U5), build + lint + tests OK (474 tests), revue code-reviewer (0 bloquant, 0 important, 1 mineur corrigé : test d'intégration routeur `/` manquant) — terminée
- [x] U5 — Gestion administrateurs (dépend de U0, U1, U4 ; admin-app, SuperAdministrateur uniquement) : conception (`u5-gestion-administrateurs-design.md`, scope strict rôle `ADMINISTRATEUR` seul — jamais `SUPERADMINISTRATEUR` —, réutilisation de `UserForm`/`ConfirmActionModal`/CRUD de U4, extension additive rétrocompatible de `UserTable` via `renderRowActions`), implémentation (`AdminsListPage`/`AdminCreatePage`, `useAdmins` modelé sur `useVeilleurs`), build + lint + tests OK (491 tests), revue code-reviewer (0 bloquant, 0 important, 1 mineur corrigé : test verrouillant la transmission de `ADMIN_ROLE_OPTIONS` aux pages) — terminée
- [x] U6 — Annonces (dépend de U0, U1 ; sans backend réel exposé) : conception (`u6-annonces-design.md`, backend mocké MSW partagé `packages/shared/src/mocks` pour `/annonces` CRUD + publier/dépublier, contrat HTTP indiscernable d'un futur backend réel), implémentation (liste publique `PageActualites` filtrée PUBLIE côté user-app, CRUD complet + publication côté admin-app, déplacement de `ConfirmActionModal` vers `components/common/` pour un quatrième usage), build + lint + tests OK (577 tests : 160 shared / 255 admin-app / 162 user-app), revue code-reviewer (0 bloquant, 3 importants + 3 mineurs corrigés : données obsolètes de `EditAnnonceForm` en navigation directe entre annonces, état de bascule publier/dépublier partagé entre lignes, champ Contenu limité à un `<input>` mono-ligne malgré 5000 caractères possibles ; pagination non bornée en cas de rétrécissement de liste, absence de gestion d'erreur au démarrage du worker MSW, code mort sur `onCancel` optionnel) — terminée
- [ ] U7 — Contact
- [ ] U8 — Vitrine/Accès

### 🟡 PHASE D'EXPLOITATION
- [ ] Non démarrée (réservé)
