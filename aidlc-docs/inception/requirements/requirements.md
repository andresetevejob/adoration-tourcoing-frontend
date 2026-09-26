# Exigences — Frontend Réservation Adoration Eucharistique (Chapelle du Vœux)

## Résumé de l'analyse de l'intention

- **Demande utilisateur** : Réaliser le frontend complet de l'application de réservation de créneaux d'adoration eucharistique de la Chapelle du Vœux, à partir du template existant dans ce dépôt, en suivant intégralement la spécification `prompt-frontend-revise.md` (source de vérité, référencée et non dupliquée ici).
- **Type de demande** : Nouveau projet (greenfield) **à partir d'un template de base existant** — reprise du thème visuel, des composants et de la configuration du template, sans logique métier ni appel API à conserver.
- **Estimation de la portée** : Multi-systèmes / échelle système — deux applications React déployables indépendamment (`apps/user-app`, `apps/admin-app`) + un package partagé (`packages/shared`), organisées en monorepo npm workspaces.
- **Estimation de la complexité** : Complexe — 5 rôles avec permissions différenciées, règles métier de réservation/annulation avec contraintes temporelles, anonymisation conditionnelle des données selon le rôle consultant, contrat API strict (swagger fourni) avec plusieurs écarts documentés et déjà arbitrés, exigences NFR détaillées (perf, sécurité, a11y, i18n), stratégie de tests à 4 niveaux.
- **Profondeur retenue** : **Complète** (risque métier réel — accès aux créneaux d'adoration, séparation stricte des deux applications par rôle, cookie de session inter-origines).

## Note sur les questions de clarification

Conformément à `common/depth-levels.md` et `inception/requirements-analysis.md`, une analyse d'exhaustivité complète a été menée sur les exigences fonctionnelles, non fonctionnelles, scénarios utilisateurs, contexte métier et contexte technique. **Aucune question bloquante n'a été identifiée** : la spécification source (`prompt-frontend-revise.md`) est exceptionnellement complète et a déjà arbitré, avec justification, la quasi-totalité des écarts qu'elle soulève elle-même (section 6.1). Les points encore ouverts sont des points de **confirmation backend** sans impact sur la conception frontend (ex. format exact du cookie de session) : ils sont documentés comme hypothèses de travail ci-dessous plutôt que comme questions bloquantes, et devront être re-vérifiés en intégration.

## Contexte métier

Application de gestion des réservations de créneaux d'adoration eucharistique. Deux applications frontend distinctes, un seul backend :
- **`user-app`** (ex. `app.adoration-chapelle.fr`) — Anonyme, Adorateur, Veilleur
- **`admin-app`** (ex. `admin.adoration-chapelle.fr`) — Administrateur, SuperAdministrateur

Aucune session partagée entre les deux applications côté frontend ; chaque application rejette les rôles qui ne lui sont pas destinés (redirection `/non-autorise`).

## Rôles et permissions (référence)

| Rôle | Compte | Agenda | Réserver | Annuler (soi) | Gérer planning | Gérer utilisateurs | Gérer admins |
|---|---|---|---|---|---|---|---|
| Anonyme | Non | ✅ lecture | ❌ | ❌ | ❌ | ❌ | ❌ |
| Adorateur | Oui | ✅ lecture | ❌ | ❌ | ❌ | ❌ | ❌ |
| Veilleur | Oui | ✅ | ✅ (soi) | ✅ (≥24h avant) | ❌ | ❌ | ❌ |
| Administrateur | Oui | ✅ | ✅ (soi/Veilleur) | ✅ | ✅ | ✅ (sauf admins) | ❌ |
| SuperAdministrateur | Oui | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Exigences fonctionnelles

### EF-1 — Authentification & gestion de compte
- Inscription (`user-app` uniquement) : formulaire unique `RegisterForm` (RHF + Zod) aligné sur `RegisterRequest` (email, mot de passe ≥8 car. + 1 chiffre + 1 spécial, confirmation front-only, nom, prénoms, téléphone optionnel `^\+?[0-9]{10,15}$`, rôle Adorateur/Veilleur uniquement).
- Connexion (les deux apps) : email + mot de passe. `admin-app` sans auto-inscription ; rejette les rôles Adorateur/Veilleur (redirection `/non-autorise`). `user-app` rejette Administrateur/SuperAdministrateur.
- 401 sur `/auth/login` (identifiants invalides **ou** compte `EN_ATTENTE`/`REJETE`) → message générique unique affiché dans le formulaire, sans distinction de cause, sans logique de refresh/redirection.
- Page de confirmation d'inscription : message conditionné à `AuthResponse.user.statutValidation` (Adorateur `VALIDE` → peut se connecter ; Veilleur `EN_ATTENTE` → attente de validation admin).
- Session par cookie `httpOnly` (`credentials: "include"`), pas de token stocké côté client. 401 générique (hors `/auth/*`) → `POST /auth/refresh` puis retry une fois, sinon redirection `/connexion` ; 403 → `/non-autorise`.
- Page "Mon compte" : profil + (user-app) historique de réservations ; modification des infos ; déconnexion. **Pas de changement de mot de passe** (endpoint absent du swagger).

### EF-2 — Agenda / Planning (consultation)
- `user-app` `/agenda` (public, actions conditionnées au rôle) et `admin-app` `/planning` (Administrateur/SuperAdministrateur) — alimentés par `GET /planning`.
- Pas d'entité "créneau" : une plage libre = absence de réservation sur cette période. Affichage calendrier (FullCalendar, lazy-loadé).
- `estAnonymise = true` (calculé backend selon l'utilisateur courant) → affichage "Créneau réservé" sans identité. Un Veilleur voit l'identité uniquement sur ses propres réservations (créateur), mises en avant ("Ma réservation") avec action d'annulation. `admin-app` voit toutes les identités (à vérifier en recette, cf. hypothèses).
- Filtres : par date, par utilisateur ("mes réservations").

### EF-3 — Réservation
- Un Veilleur réserve pour lui-même ; un Administrateur/SuperAdministrateur réserve pour lui-même ou pour un Veilleur (`CreateBookingRequest.idUtilisateur` optionnel).
- Contraintes : pas de réservation sur une plage déjà occupée, pas de réservation dans le passé, pas de réservation sur une entrée archivée/clôturée. Ces contraintes sont appliquées côté backend ; le frontend doit gérer proprement les erreurs API correspondantes (toast) et désactiver visuellement les créneaux déjà occupés quand c'est déterminable côté client.
- Modal de confirmation avant toute réservation.

### EF-4 — Annulation
- Un utilisateur peut annuler sa propre réservation si ≥ 24h avant `dateDebut` (règle 2.3). Un Administrateur/SuperAdministrateur peut annuler n'importe quelle réservation.
- Modal de confirmation avant annulation. Délai différent possible selon le rôle : le frontend affiche/désactive l'action selon la règle mais la validation finale reste côté backend (message d'erreur affiché si refus tardif).

### EF-5 — Gestion des utilisateurs (admin-app)
- Liste paginée (20/page) avec filtres email/téléphone/nom/prénoms/`statutValidation`, raccourci "Comptes en attente".
- Détail/édition (`PUT /users/{id}`, sans champ mot de passe), suppression (`DELETE /users/{id}`), création (`POST /users` — `VALIDE` automatique quel que soit le rôle).
- Validation (`POST /users/{id}/valider`) / rejet (`POST /users/{id}/rejeter`) d'un compte `EN_ATTENTE`, avec modal de confirmation et mise à jour optimiste/invalidation TanStack Query.
- Un Administrateur ne voit aucune action de création/modification sur les comptes Administrateur/SuperAdministrateur. Pas d'action "désactiver" (endpoint inexistant).

### EF-6 — Gestion des administrateurs (SuperAdministrateur uniquement)
- Liste, création d'un compte Administrateur, modification, suppression. Section masquée/inaccessible (redirection `/non-autorise`) pour un Administrateur.

### EF-7 — Annonces *(backend non exposé — mock MSW)*
- `user-app` `/actualites` : lecture seule des annonces `PUBLIE`.
- `admin-app` `/annonces` : CRUD + publier/dépublier.
- Implémentées dès ce cycle contre des mocks MSW représentatifs du modèle de données (section 3 du prompt), avec un hook (`useAnnonces`) isolé pour permettre un rebranchement transparent le jour où `/annonces` existera côté backend.

### EF-8 — Contact *(backend non exposé — mock MSW)*
- `user-app` `/contact` : formulaire (nom, email, sujet, message) → confirmation d'envoi. Mock MSW en attendant l'endpoint réel.

### EF-9 — Pages vitrine statiques
- Accueil (`/`), Qui sommes-nous (`/qui-sommes-nous`) : reprises du template, contenu majoritairement statique (`AdorationLive`, `Lightbox`, galerie, hero).

### EF-10 — Garde de routes par rôle
- `ProtectedRoute` par application avec liste de rôles autorisés. Non connecté → `/connexion` (avec retour post-connexion). Rôle inapproprié pour l'application → `/non-autorise`. Routes transverses `/non-autorise` (403) et `*` (404) dans chaque application.

## Exigences non fonctionnelles

| Catégorie | Exigence clé |
|---|---|
| Sécurité | Cookie de session `httpOnly`, `SameSite=None; Secure` ; aucun token/donnée sensible en `localStorage` ; CORS backend multi-origine avec `credentials: true` (deux domaines) ; HTTPS en production |
| Performance | Code-splitting obligatoire (`React.lazy`+`Suspense`) pour `AgendaPage`/`PlanningPage` (FullCalendar) et `superadmin/*` ; import dynamique des plugins FullCalendar ; bundle initial < 150 Ko gzip/app ; pas d'Axios (fetch natif) ; pagination 20/page ; TanStack Query `staleTime` 60s sur le planning |
| Accessibilité | WCAG 2.1 AA sur formulaires et calendrier ; navigation clavier, focus management, ARIA |
| Responsive | Mobile-first, breakpoints Tailwind sm/md/lg |
| Gestion d'erreurs | Toasts non bloquants, skeletons/spinners, confirmations avant action destructrice, pages 404/erreur générique |
| i18n | Interface 100% française, dates `dd/MM/yyyy`, fuseau Europe/Paris |
| Qualité de code | TypeScript strict (`no-any`), composants fonctionnels uniquement, pas de logique métier dans les composants, pas de CSS-in-JS, pas de librairie de composants lourde |
| Tests | Vitest + RTL (unitaires/composants, coverage ≥80% sur hooks/utils), MSW (intégration), Playwright (E2E, 1 config/app) |
| Monorepo | `apps/user-app` et `apps/admin-app` sans dépendance croisée, uniquement vers `packages/shared` ; imports `@chapelle/shared/{types,api,ui,utils}` par sous-chemin exclusivement (`sideEffects:false`, tree-shaking) |

## Contexte technique — décisions déjà arbitrées (source : prompt-frontend-revise.md §0.1, §5, §6.1)

Ces points, bien que marqués « à confirmer avec le backend » dans la spécification source, ont déjà une décision d'implémentation frontend et **ne bloquent pas** le démarrage :
1. Authentification par cookie de session `httpOnly` (pas de token) — implémentée comme telle ; à revalider en intégration.
2. Pas de endpoint de changement de mot de passe → fonctionnalité retirée du scope "Mon compte".
3. `/annonces` et `/contact` absents du swagger → implémentés contre MSW, hooks isolés pour rebranchement futur.
4. Deux formats de pagination distincts dans le swagger (`PageUserResponse` type Spring Data complet vs `PageResponse<T>` simplifié pour bookings/planning) → deux types TS distincts, pas de wrapper unique.
5. Anonymisation du planning entièrement pilotée par `estAnonymise` renvoyé par le backend — aucun calcul client.
6. Terminologie : "Adorateur" uniquement (plus de "Lecteur"), "Chapelle du Vœux" (plus de "Sanctuaire du Sacré-Cœur").
7. Le template actuel (`index.html` statique + Tailwind CDN + `vite-plugin-singlefile`) n'est pas conservé tel quel : composants/pages React et thème visuel (palettes `gold`/`night`, polices, animations) repris et migrés vers Tailwind 4 `@theme` dans `packages/shared/src/ui/theme.css`.

## Risques identifiés

- **Contrat API non final** : deux capacités (Annonces, Contact) et une action (changement de mot de passe supprimée) reposent sur des hypothèses backend non contractualisées par le swagger fourni — risque de retouche si le backend expose finalement des endpoints différents des mocks MSW.
- **CORS multi-origine** : dépendance à une configuration backend externe (deux origines + `credentials: true`) hors du contrôle du frontend — bloquant fonctionnel si non fait, mais sans impact sur le code frontend lui-même.
- **Réorganisation du dépôt** : le code actuel (racine du repo) doit être déplacé/adapté vers `apps/user-app` + `packages/shared` — opération à traiter explicitement comme une tâche d'infrastructure dès la première unité de Construction, avant toute autre capacité.
- **Ampleur du périmètre** : 2 applications complètes, ~9 capacités métier, 4 niveaux de tests — la Construction sera nécessairement découpée en plusieurs unités (cf. étape Génération des unités) et probablement livrée sur plusieurs sessions/agents.

## Résumé

Exigences fonctionnelles et non fonctionnelles complètes pour un monorepo à deux applications React 19/TS/Vite (`user-app`, `admin-app`) + package partagé (`packages/shared`), couvrant authentification par rôle, agenda/planning avec anonymisation conditionnelle, réservation/annulation avec règles temporelles, gestion des utilisateurs/administrateurs, annonces et contact (mockés), le tout aligné sur le swagger fourni et le template visuel existant. Aucune question bloquante restante — prêt pour l'étape **Récits utilisateur**.
