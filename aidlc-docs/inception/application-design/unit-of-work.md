# Unités de travail

## U0 — Fondation & Design System
**Applications** : transverse (aucune app spécifique, prépare le terrain pour toutes)
**Composants** (`components.md`) : SharedContracts, SharedApiClient, SharedUIKit, SharedUtils
**Portée** :
- Initialiser le monorepo npm workspaces (`package.json` racine, `tsconfig.base.json`, `apps/*`, `packages/shared`)
- Retirer du dépôt actuel : `vite-plugin-singlefile`, Tailwind CDN, contenu statique d'`index.html` (racine) ; convertir en `index.html` Vite standard par app
- Migrer le thème Tailwind CDN du template vers `packages/shared/src/ui/theme.css` (Tailwind 4 `@theme` : palettes gold/night/ivory/pearl, polices, animations)
- Implémenter `packages/shared` complet : types (section 5.2 de la spec), client API (`createApiClient`, `ApiError`, retry/timeout), composants UI de base (Button, Input, Select, Table, Pagination, Modal, Badge, Card, Spinner, Toast), utils (`cn`, validators Zod, formatters, constants)
- Configurer `package.json` de `packages/shared` avec `exports` par sous-chemin + `sideEffects:false`
- Mettre en place ESLint + Prettier (config partagée), configuration Vitest de base par workspace, squelette Playwright par app
- Créer les `Dockerfile` (squelette multi-stage) et `docker-compose.yml` racine
**Hors périmètre** : logique métier applicative (traitée dans U1-U8)
**Bloque** : toutes les autres unités (U1-U8)

## U1 — Authentification & Comptes
**Applications** : `user-app` + `admin-app`
**Composants** : AuthModule (les deux apps), AppShellModule (mise en place initiale du routing protégé)
**Portée** :
- `user-app` : `RegisterForm`, `LoginForm`, pages Connexion/Inscription/Confirmation, `ProtectedRoute`, `authStore`, `api/endpoints/auth.ts`, page Mon compte (tous rôles, y compris Adorateur modifiable — cf. correction utilisateur)
- `admin-app` : `LoginForm` (sans inscription), `ProtectedRoute`, `authStore`, `api/endpoints/auth.ts`, page Mon compte
- Logique de rejet de connexion pour rôle inapproprié à l'application (US-AUTH-05)
- Gestion centralisée des erreurs 401 (refresh/retry, exclusion `/auth/*`) et 403 côté client API partagé (câblée depuis U0, testée ici en contexte réel)
**Récits couverts** : US-AUTH-01 à 08
**Dépend de** : U0
**Bloque** : U2 (affichage conditionné au rôle), U3, U4, U5, U6 (CRUD admin), U8 (Navbar authentifiée, ProtectedRoute)

## U2 — Agenda / Planning (consultation)
**Applications** : `user-app` + `admin-app`
**Composants** : PlanningModule (les deux apps)
**Portée** :
- `user-app` : `/agenda` public, `CalendrierReservations` (FullCalendar lazy), affichage `estAnonymise`, mise en évidence "Ma réservation", filtres date/mes réservations
- `admin-app` : `/planning`, `CalendrierPlanningAdmin`, affichage de toutes les identités
- Import dynamique des plugins FullCalendar dans le composant calendrier
**Récits couverts** : US-AGENDA-01 à 05
**Dépend de** : U0, U1 (pour la distinction de rôle et la mise en évidence des réservations propres)
**Bloque** : U3 (les actions de réservation s'accrochent au composant calendrier)

## U3 — Réservation & Annulation
**Applications** : `user-app` + `admin-app`
**Composants** : BookingModule (les deux apps)
**Portée** :
- `ReservationForm`, `ReservationConfirmModal`, `useBookings`/`useCreateBooking`/`useCancelBooking`
- Règles : pas de réservation passée/occupée/archivée, délai d'annulation ≥24h (Veilleur), annulation libre pour Administrateur/SuperAdministrateur
- `admin-app` : réservation pour un Veilleur (sélecteur de bénéficiaire)
**Récits couverts** : US-RESA-01 à 05, US-ANNUL-01 à 04
**Dépend de** : U0, U1, U2
**Bloque** : aucune autre unité fonctionnelle

## U4 — Gestion des utilisateurs
**Applications** : `admin-app`
**Composants** : UserManagementModule
**Portée** :
- `UserTable`, `UserForm`, `UserProfile`, `StatutValidationBadge`, `ValidationActions`, `useUsers`
- Pages `/` (liste), `/utilisateurs/:id` (détail/édition), raccourci "Comptes en attente"
- Validation/rejet de compte, restriction (pas d'action sur comptes Administrateur/SuperAdministrateur)
**Récits couverts** : US-USERS-01 à 08
**Dépend de** : U0, U1
**Bloque** : U5 (réutilise les patterns de tableau/formulaire)

## U5 — Gestion des administrateurs
**Applications** : `admin-app` (SuperAdministrateur uniquement)
**Composants** : AdminManagementModule
**Portée** :
- `pages/superadmin/AdminsListPage`, `AdminCreatePage`, garde de route SuperAdministrateur-only
- Réutilise `UserForm`/`UserTable` de U4 avec `role=ADMINISTRATEUR`
**Récits couverts** : US-ADMINS-01 à 04
**Dépend de** : U0, U1, U4

## U6 — Annonces ⚠️ *(backend non exposé — mocks MSW)*
**Applications** : `user-app` (lecture) + `admin-app` (CRUD)
**Composants** : AnnouncementsModule (les deux apps)
**Portée** :
- `user-app` : `ActualitesPage`, `useAnnonces` (lecture, statut PUBLIE)
- `admin-app` : `AnnonceForm`, `AnnonceList`, pages liste/création/édition, publier/dépublier
- Handlers MSW partagés (contrat identique au futur backend réel)
**Récits couverts** : US-ANNONCES-01 à 04
**Dépend de** : U0, U1 (auth admin pour le CRUD)

## U7 — Contact ⚠️ *(backend non exposé — mock MSW)*
**Applications** : `user-app`
**Composants** : ContactModule
**Portée** : `ContactPage`, formulaire (nom/email/sujet/message), `sendContactMessage` (mock MSW), confirmation d'envoi
**Récits couverts** : US-CONTACT-01
**Dépend de** : U0

## U8 — Vitrine & Accès transverses
**Applications** : `user-app` (vitrine) + les deux apps (pages transverses)
**Composants** : VitrineModule, AppShellModule (finalisation)
**Portée** :
- `user-app` : `HomePage`, `QuiSommesNousPage`, `Navbar` (adaptée à l'auth issue de U1), `Footer`, `ScrollToTop`, `AdorationLive`, `Lightbox`
- Les deux apps : `Page403` (`/non-autorise`), `Page404` (`*`)
- `admin-app` : `Header`, `Sidebar` (layout final)
**Récits couverts** : US-ACCESS-01 à 03, EF-9
**Dépend de** : U0, U1 (Navbar/Sidebar dépendent de l'état d'authentification)

---

## Couverture des récits
Les 42 récits de `stories.md` sont répartis sur U1 à U8 (U0 ne porte aucun récit — infrastructure pure). Détail dans `unit-of-work-story-map.md`.
