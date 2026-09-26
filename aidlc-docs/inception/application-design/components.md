# Composants — Conception de l'application

Regroupement logique de l'arborescence cible (`prompt-frontend-revise.md` §5) en composants de haut niveau, par package. Les responsabilités métier détaillées (règles de réservation, d'annulation, etc.) seront précisées dans la Conception fonctionnelle, par unité, en Construction.

## `packages/shared` — code mutualisé (aucune dépendance vers les apps)

### SharedContracts (`types/`)
- **Objectif** : Types TypeScript alignés sur le swagger — contrat unique entre les deux apps et l'API
- **Responsabilités** : `UserResponse`, `BookingResponse`, `PlanningEntryResponse`, `AnnonceResponse`, enums (`UserRole`, `StatutValidation`, `StatutReservation`, `StatutAnnonce`), types de requêtes (`CreateUserRequest`, `CreateBookingRequest`, `RegisterRequest`...), `PageResponse<T>`/`SpringPage<T>`, `ApiError`
- **Interface** : export via `@chapelle/shared/types` uniquement

### SharedApiClient (`api/`)
- **Objectif** : Client HTTP unique, sans dépendance externe (fetch natif)
- **Responsabilités** : factory `createApiClient(baseURL)`, sérialisation JSON, `credentials: "include"`, levée d'`ApiError` typée sur `!response.ok`, timeout via `AbortController` (15s)
- **Interface** : export via `@chapelle/shared/api` uniquement

### SharedUIKit (`ui/`)
- **Objectif** : Design system minimal partagé, cohérence visuelle entre les deux apps
- **Responsabilités** : `Button`, `Input`, `Select`, `Table`, `Pagination`, `Modal`, `Badge`, `Card`, `Spinner`, `Toast` + `theme.css` (palettes `gold`/`night`/`ivory`/`pearl`, polices, animations, migrées du template en Tailwind 4 `@theme`)
- **Interface** : export via `@chapelle/shared/ui` uniquement ; composants Tailwind-only, aucun CSS importé au niveau module (`sideEffects:false`)

### SharedUtils (`utils/`)
- **Objectif** : Fonctions transverses réutilisables
- **Responsabilités** : `cn()` (repris du template), schémas Zod (`validators.ts`), `formatters.ts` (dates FR, `dd/MM/yyyy`, Europe/Paris), `constants.ts`
- **Interface** : export via `@chapelle/shared/utils` uniquement

---

## `apps/user-app` — Anonyme, Adorateur, Veilleur

### AuthModule
- **Objectif** : Authentification et session propres à `user-app`
- **Composants** : `LoginForm`, `RegisterForm` (RHF+Zod, remplace `InscriptionLecteur`/`InscriptionVeilleur`), `ProtectedRoute`
- **État** : `authStore` (Zustand, instance dédiée à `user-app`) — utilisateur courant, rôle, statut d'authentification
- **Endpoints** : `api/endpoints/auth.ts` (register, login, logout, refresh)

### PlanningModule
- **Objectif** : Consultation de l'agenda public
- **Composants** : `CalendrierReservations` (FullCalendar, lazy-loadé)
- **Endpoints** : `api/endpoints/planning.ts` (GET /planning)

### BookingModule
- **Objectif** : Réservation et annulation pour Veilleur (et lecture pour tous)
- **Composants** : `ReservationCard`, `ReservationForm`, `ReservationConfirmModal`
- **Endpoints** : `api/endpoints/bookings.ts` (GET/POST /bookings, DELETE /bookings/{id})

### AnnouncementsModule *(⚠️ MSW)*
- **Objectif** : Lecture des annonces publiées
- **Composants** : intégrés à `ActualitesPage` (reprise de `Actualites.tsx`)
- **Endpoints** : `api/endpoints/annonces.ts` (mock MSW)

### ContactModule *(⚠️ MSW)*
- **Objectif** : Formulaire de contact
- **Composants** : intégrés à `ContactPage` (reprise de `Contact.tsx`)
- **Endpoints** : `api/endpoints/contact.ts` (mock MSW)

### VitrineModule
- **Objectif** : Pages publiques non dynamiques et éléments d'identité visuelle du template
- **Composants** : `Navbar` (adaptée à l'auth), `Footer`, `ScrollToTop`, `AdorationLive`, `Lightbox`, `HomePage`, `QuiSommesNousPage`

### AppShellModule
- **Objectif** : Ossature de l'application
- **Composants** : `Layout` (PublicLayout/AppLayout), `router.tsx` (data router React Router 7), `App.tsx`, `main.tsx`, `Page403`, `Page404`

---

## `apps/admin-app` — Administrateur, SuperAdministrateur

### AuthModule
- **Objectif** : Authentification propre à `admin-app` (pas d'auto-inscription)
- **Composants** : `LoginForm`, `ProtectedRoute`
- **État** : `authStore` (Zustand, instance dédiée à `admin-app`, indépendante de celle de `user-app`)
- **Endpoints** : `api/endpoints/auth.ts` (login, logout, refresh)

### PlanningModule
- **Objectif** : Planning complet, réservation pour soi ou pour un Veilleur, annulation de toute réservation
- **Composants** : `CalendrierPlanningAdmin`, `ReservationForm`, `ReservationConfirmModal`
- **Endpoints** : `api/endpoints/planning.ts`, `api/endpoints/bookings.ts`

### UserManagementModule
- **Objectif** : CRUD utilisateurs + validation/rejet des comptes Veilleur en attente
- **Composants** : `UserTable`, `UserForm`, `UserProfile`, `StatutValidationBadge`, `ValidationActions`
- **Endpoints** : `api/endpoints/users.ts` (GET/POST/PUT/DELETE /users, POST /users/{id}/valider|rejeter)

### AdminManagementModule *(SuperAdministrateur uniquement)*
- **Objectif** : CRUD des comptes Administrateur
- **Composants** : `AdminsListPage`, `AdminCreatePage` (sous `pages/superadmin/`)
- **Endpoints** : `api/endpoints/users.ts` (réutilisé avec `role=ADMINISTRATEUR`)

### AnnouncementsModule *(⚠️ MSW)*
- **Objectif** : CRUD complet des annonces (créer, modifier, supprimer, publier/dépublier)
- **Composants** : `AnnonceForm`, `AnnonceList`
- **Endpoints** : `api/endpoints/annonces.ts` (mock MSW)

### AppShellModule
- **Objectif** : Ossature de l'application
- **Composants** : `Header`, `Sidebar`, `Layout` (AdminLayout), `router.tsx`, `App.tsx`, `main.tsx`, `Page403`, `Page404`

---

## Règle de dépendance (rappel, cf. component-dependency.md)
`apps/user-app` et `apps/admin-app` ne dépendent **que** de `packages/shared` (sous-chemins `/types`, `/api`, `/ui`, `/utils`) — jamais l'un de l'autre.
