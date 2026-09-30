Using AI-DLC-CC, réalise le frontend de l'application suivante :

## CONTEXTE APPLICATION - Réservation Adoration Eucharistique (Chapelle du Vœux)

### 0. TYPE DE PROJET
Greenfield **à partir d'un template de base existant** — nouvelle application web, construite en reprenant l'identité visuelle, la configuration et les composants du template décrit en section 0.1 (pas de logique métier ni d'appel API à reprendre).

**Deux applications frontend distinctes**, chacune déployée sur son propre domaine, contre le même backend :
- **Application Utilisateurs** *(ex: `https://app.adoration-chapelle.fr`)* — Anonyme, Adorateur, Veilleur
- **Application Administration** *(ex: `https://admin.adoration-chapelle.fr`)* — Administrateur, SuperAdministrateur

Ce ne sont pas deux espaces d'une même SPA (plus de découpage `/admin/*` par layout) mais deux projets React déployables indépendamment. Le code partagé (types alignés sur le swagger, client `fetch`, composants UI génériques, utilitaires) est mutualisé via un monorepo (section 5).

### 0.1 TEMPLATE DE BASE

**Emplacement** : `/Users/andrekouame/projects/ai-native-developpement/adoration-tourcoing/frontend`

Ce template sert de **point de départ obligatoire** pour la réalisation du frontend. Il doit être analysé en premier (étape *Workspace Detection* / *Reverse Engineering* d'AI-DLC) avant toute conception.

**Contenu du template (état constaté)**

| Élément | Détail |
|---|---|
| Stack | React 19.2.6, React DOM 19.2.6, TypeScript 5.9.3 (strict), Vite 7.3.2, `@vitejs/plugin-react` 5.1.1, Tailwind CSS 4.1.17 via `@tailwindcss/vite`, React Router DOM ^7.15.1, `clsx` 2.1.1 + `tailwind-merge` 3.4.0 |
| Configuration | `vite.config.ts` (alias `@` → `src`), `tsconfig.json` (strict, `noUnusedLocals`, `noUnusedParameters`, paths `@/*`) |
| Utilitaire | `src/utils/cn.ts` — `cn(...classes)` = `twMerge(clsx(...))` |
| Composants | `Navbar.tsx` (nav fixe, transparente → floutée au scroll, menu mobile), `Footer.tsx`, `ScrollToTop.tsx`, `Lightbox.tsx` (galerie), `AdorationLive.tsx` (horloge temps réel + jours d'adoration depuis le 1er août 1885) |
| Pages | `Home.tsx`, `QuiSommesNous.tsx`, `Actualites.tsx` (données en dur), `Contact.tsx`, `InscriptionLecteur.tsx`, `InscriptionVeilleur.tsx` |
| Assets | `public/images/` (hero-bg, about-hero, interior, gallery-1 à 4) |
| Identité visuelle | Thème défini dans `index.html` (`tailwind.config` pour le CDN) : palettes `gold` (50→950, accent principal `gold-400/500`) et `night` (50→950, fond sombre `night-950` `#0a0d1a`), couleurs `ivory`, `ivory-dark`, `pearl`, `pearl-dark` ; polices Google Fonts `Playfair Display` / `Cormorant Garamond` (serif, display) et `Inter` (sans) ; animations `fade-in`, `fade-up`, `fade-down`, `float`, `glow`, `ping-slow`, `shimmer` |

**⚠️ Points d'attention — ce qui doit être repris, adapté ou retiré**

1. **Le site actuel n'est pas réellement en React** : `App.tsx` renvoie `null` et le site visible est un `index.html` statique (~115 ko, HTML/JS vanilla + Tailwind **via CDN**). Les fichiers `src/pages/*` et `src/components/*` existent mais ne sont pas branchés. → Reprendre les composants/pages React comme base de l'UI, et **ne pas conserver** le contenu statique d'`index.html` ni le CDN Tailwind (réduit à un `index.html` Vite standard avec `<div id="root">`).
2. **Thème Tailwind à migrer** : la config `tailwind.config` du CDN doit être portée en **Tailwind 4 `@theme`** dans un fichier CSS partagé (ex. `packages/shared/src/ui/theme.css`, importé par l'`index.css` de chaque application — un import CSS depuis l'application, pas depuis un module JS, pour respecter `"sideEffects": false`). Même palette, mêmes polices, mêmes animations dans `user-app` et `admin-app`.
3. **`vite-plugin-singlefile` à retirer** : il inline tout le JS/CSS dans un seul fichier HTML, ce qui est **incompatible avec le code-splitting obligatoire** (`React.lazy`, FullCalendar en chunk séparé, cf. section 5 et 8).
4. **React Router 7** (et non 6) : utiliser le mode *data router* (`createBrowserRouter` + `RouterProvider`) depuis le package `react-router` (v7 — `react-router-dom` n'est plus qu'un ré-export), sans le mode *framework* ni le SSR.
5. **Formulaires d'inscription à réaligner sur le swagger** : `InscriptionVeilleur.tsx` (adresse, disponibilité, motivation, pièce d'identité, certificat de baptême) et `InscriptionLecteur.tsx` (photo, confirmation de mot de passe) contiennent des champs **absents de `RegisterRequest`**. → Un seul `RegisterForm` (React Hook Form + Zod) avec les champs du swagger (section 7) et un choix de rôle Adorateur/Veilleur. Seule la confirmation du mot de passe peut rester (contrôle côté frontend uniquement, non envoyée). Réutiliser le style visuel des champs, messages d'erreur et états de succès existants.
6. **Terminologie** : le template parle de "Lecteur" (`InscriptionLecteur`, lien "Inscription adorateur") → utiliser uniquement **Adorateur** dans l'application. Certaines pages mentionnent "Sanctuaire du Sacré-Cœur" → remplacer par **Chapelle du Vœux**.
7. **`Actualites.tsx`** (données en dur) → devient l'écran de lecture des **annonces** de `user-app` (route `/actualites`, hook `useAnnonces`, mock MSW tant que le backend n'expose pas `/annonces`, cf. 6.1).
8. **`Contact.tsx`** → réutilisé comme `ContactPage` (branchée sur `contact.ts`, mock MSW en attendant le backend).
9. **`QuiSommesNous.tsx`** → conservée en page statique de `user-app` (route `/qui-sommes-nous`).
10. **`Navbar` / `Footer` / `ScrollToTop` / `Lightbox` / `AdorationLive`** → repris dans `user-app` (layout public). La `Navbar` doit être adaptée : liens Accueil, Agenda, Actualités, Qui sommes-nous ?, Contact + boutons Connexion / Créer un compte ou menu profil selon l'état d'authentification. `admin-app` réutilise la même palette et les mêmes polices, avec une `Sidebar` dédiée.
11. **Composants à mutualiser** : `cn()` → `@chapelle/shared/utils` ; les composants génériques (boutons, champs, cartes, modal) extraits des pages du template → `@chapelle/shared/ui`. Les composants propres au site vitrine (`AdorationLive`, `Lightbox`, `Navbar`) restent dans `user-app`.
12. **Qualité du code du template** : les formulaires utilisent `useState` + validation manuelle et certaines pages mélangent données et affichage → à refactorer selon les règles de la section 5 (hooks métier, RHF + Zod, pas de logique métier dans les composants).

### 1. CONTEXTE GÉNÉRAL

**Objectif** :
Réaliser une application web pour la gestion des réservations de créneaux d'adoration eucharistique à la Chapelle du Vœux.

**Public cible et rôles** :

| Rôle | Compte requis | Permissions |
|---|---|---|
| Anonyme | Non | Consulter l'agenda d'adoration (lecture seule) |
| Adorateur | Oui | Se connecter, consulter l'agenda d'adoration (pas de réservation) |
| Veilleur | Oui | Se connecter, consulter l'agenda, réserver un créneau, annuler sa propre réservation (≥ 24h avant) |
| Administrateur | Oui | Créer des comptes Adorateur/Veilleur, valider ou rejeter les comptes Veilleur, consulter l'agenda, réserver un créneau, supprimer un créneau. Ne peut pas créer de compte Administrateur ni SuperAdministrateur |
| SuperAdministrateur | Oui | Toutes les permissions Administrateur + créer/gérer des comptes Administrateur |

### 2. RÈGLES MÉTIER


### 2.1 Réservation d’adoration
Une réservation d’adoration est l’unité centrale du système. Elle contient directement :
- une date et heure de début,
- une date et heure de fin,
- un statut,
- éventuellement une description ou un commentaire.

Aucune entité distincte de “créneau” n’est nécessaire dans ce modèle.

### 2.2 Règles de réservation
- Un VEILLEUR peut réserver un ou plusieurs créneaux pour lui-même.
- Un ADMINISTRATEUR ou SUPERADMINISTRATEUR peut réserver une plage pour lui-même ou pour un VEILLEUR.
- Une réservation ne peut exister que si la plage horaire est disponible.
- Deux réservations ne peuvent pas se chevaucher pour la même période si elles concernent le même contexte d’usage.

### 2.3 Annulation
- Un utilisateur peut annuler sa propre réservation.
- Un ADMINISTRATEUR ou SUPERADMINISTRATEUR peut annuler une réservation pour un autre utilisateur, dans les limites définies par la règle métier.
- Une annulation est autorisée seulement si elle est faite avant un délai fixé.
- Un délai d’annulation différent peut exister selon le rôle.

### 2.4 Planning
- Tout utilisateur authentifié peut consulter le planning d’un jour donné.
- Un ADMINISTRATEUR ou SUPERADMINISTRATEUR peut modifier le planning d’un jour donné.

### 2.5 Contraintes métier à prévoir
- réservation pour une date passée : interdite,
- réservation sur une plage déjà occupée : interdite,
- annulation trop tardive : interdite,
- réservation archivée ou clôturée : non réservable.


**Règles d'accès par rôle**

| Rôle | Consulter agenda | Réserver | Annuler sa réservation | Gérer créneaux (créer/suppr.) | Gérer utilisateurs | Gérer administrateurs |
|---|---|---|---|---|---|---|
| Anonyme | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Adorateur | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Veilleur | ✅ | ✅ | ✅ (≥24h avant) | ❌ | ❌ | ❌ |
| Administrateur | ✅ | ✅ | ✅ | ✅ | ✅ (sauf comptes admin) | ❌ |
| SuperAdministrateur | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Règles de données / Confidentialité** *(proposition à valider avec le porteur du projet)*
- Rétention : données de compte conservées tant que le compte est actif ; suppression/anonymisation sous 30 jours après suppression du compte
- Intégrité : email unique par compte, mot de passe hashé (jamais stocké en clair)
- Messages du formulaire de contact conservés 12 mois puis purgés
- Conformité RGPD : droit d'accès et de suppression des données personnelles sur demande

### 3. MODÈLE DE DONNÉES

```
Utilisateur
- id: UUID
- email: string (unique, optionnel si telephone présent)
- password: string (hashé, jamais exposé côté frontend)
- telephone: string (unique, optionnel si email présent)
- nom: string
- prenoms: string
- role: enum (ADORATEUR, VEILLEUR, ADMINISTRATEUR, SUPERADMINISTRATEUR)
- statutValidation: enum (EN_ATTENTE, VALIDE, REJETE)   # aligné sur le swagger (ex-statutCompte)
- creatorId: UUID (référence vers User, optionnel)
- isDeleted: boolean (default: false)
- createdAt: datetime
- updatedAt: datetime (optionnel)
- deletedAt: datetime (optionnel)

ReservationAdoration
- id: UUID
- userId: UUID (référence vers User — bénéficiaire de la réservation)
- creatorId: UUID (référence vers User — auteur de la réservation)
- dateDebut: datetime
- dateFin: datetime
- status: enum (EFFECTUEE, ANNULEE)
- description: string (optionnel)
- estArchivee: boolean (default: false)
- isDeleted: boolean (default: false)
- createdAt: datetime
- updatedAt: datetime (optionnel)
- deletedAt: datetime (optionnel)

Annonce
- id: UUID
- titre: string
- contenu: text
- datePublication: date
- statut: enum (BROUILLON, PUBLIE, DEPUBLIE)
- creePar: User.id (Administrateur/SuperAdministrateur)
- createdAt: datetime
- updatedAt: datetime

MessageContact
- id: UUID
- nom: string
- email: string
- sujet: string
- message: text
- createdAt: datetime
```

> ⚠️ **Écarts constatés avec le swagger fourni (section 6)** — à confirmer avec l'équipe backend avant implémentation :
> - ✅ *Résolu par la mise à jour du swagger* : la validation des comptes est désormais exposée — champ `statutValidation` (`EN_ATTENTE`, `VALIDE`, `REJETE`) dans `UserResponse`, filtre `statutValidation` sur `GET /users`, et endpoints `POST /users/{id}/valider` / `POST /users/{id}/rejeter`. L'ancien enum `statutCompte` (`EN_ATTENTE_VALIDATION`, `VALIDE`, `DESACTIVE`) est remplacé par `statutValidation`.
> - La valeur `DESACTIVE` n'existe plus : aucun champ ni endpoint ne permet de désactiver un compte (seulement valider, rejeter ou supprimer via `DELETE /users/{id}`).
> - `UpdateUserRequest` ne contient pas de champ `password` : l'auto-changement de mot de passe (page "Mon compte") n'a pas d'endpoint correspondant dans le swagger fourni.
> - Aucun endpoint swagger pour `Annonce` et `MessageContact` : ces entités restent dans le modèle de données mais leurs écrans (section 7) sont à considérer comme *à confirmer / non branchables* tant que le backend ne les expose pas.
> - `ReservationAdoration.dateDebut/dateFin/description/estArchivee` alignés sur `BookingResponse` du swagger (remplace l'ancien champ unique `dateReservation`, incohérent avec la règle métier 2.1).
> - `PlanningEntryResponse` expose un nouveau booléen `estAnonymise`, calculé par le backend **selon l'utilisateur qui consulte le planning** : un Veilleur ne voit les informations d'identité d'une adoration que s'il en est le créateur ; pour toutes les autres entrées, `estAnonymise = true` et l'identité est masquée (confirmé par le backend).
> - Statut initial à l'inscription (confirmé) : un Adorateur est `VALIDE` dès la création de son compte ; un Veilleur est `EN_ATTENTE` jusqu'à validation par un Administrateur/SuperAdministrateur.
> - Connexion d'un compte `EN_ATTENTE` ou `REJETE` (confirmé) : `POST /auth/login` renvoie **401**, avec le même code d'erreur que pour des identifiants invalides — le frontend ne peut pas distinguer les cas.
> - Compte créé par un Administrateur/SuperAdministrateur via `POST /users` (confirmé) : `VALIDE` automatiquement, quel que soit le rôle.

**Relations**
- `User (1) — (N) Reservation` : un utilisateur peut avoir plusieurs réservations
- `User[role=ADMINISTRATEUR|VEILLEUR|SUPERADMINISTRATEUR] (1) — (N) Reservation` : créateur d'une réservation (règle 2.2 : un Veilleur ne crée que pour lui-même, un Administrateur/SuperAdministrateur peut créer pour lui-même ou pour un Veilleur)
- `User[role=ADMINISTRATEUR|SUPERADMINISTRATEUR] (1) — (N) Annonce` : créateur de l'annonce (les Veilleurs ne gèrent pas les annonces, cf. section 1)

### 4. STACK TECHNIQUE (frontend)

*Versions alignées sur le template de base (section 0.1) — les dépendances en **gras** sont déjà présentes dans le template, les autres sont à ajouter.*

| Catégorie | Choix | Version |
|---|---|---|
| Langage | **TypeScript** | 5.9.x |
| Framework | **React** | 19.2.x |
| Build tool | **Vite** (+ `@vitejs/plugin-react`) | 7.3.x — *sans `vite-plugin-singlefile`* |
| Routing | **React Router** | 7.x (mode data router, `createBrowserRouter`) |
| Utilitaire de classes | **`clsx` + `tailwind-merge`** (`cn()`) | 2.1.x / 3.4.x |
| State serveur / cache API | TanStack Query | 5.x |
| State local/UI | Zustand | 4.x |
| Style | **Tailwind CSS** via **`@tailwindcss/vite`** (thème en `@theme`, pas de CDN) | 4.1.x |
| Formulaires & validation | React Hook Form + Zod | RHF 7.x / Zod 3.x |
| Client HTTP | `fetch` natif (wrapper léger, `packages/shared`) | — *(pas de dépendance, ~11 ko économisés vs Axios)* |
| Composants calendrier (agenda/planning) | FullCalendar (React) | 6.x *(chargé en lazy, cf. 5. Performance)* |
| Gestion des dates | date-fns | 3.x |
| Monorepo / workspaces | npm workspaces | npm 10.x |

*Deux applications React + un package partagé, gérés dans un seul dépôt via npm workspaces (section 5) — chaque application a son propre `Dockerfile`/déploiement pour être servie sur son propre domaine.*

**⚠️ Pas d'Axios.** React 19 et les navigateurs cibles supportent nativement `fetch` avec `credentials: "include"`, suffisant pour porter le cookie de session `httpOnly` (section 5.1). Axios n'apporte rien ici (pas d'annulation de requête complexe, pas de besoin de compatibilité navigateur ancien) et coûte ~11 ko gzippés pour rien — à ne pas ajouter aux dépendances.

### 5. ARCHITECTURE & PATTERNS

- **Monorepo npm workspaces** avec deux applications déployables indépendamment (`apps/user-app`, `apps/admin-app`) et un package partagé (`packages/shared`) — pas de duplication du code commun (types API, client `fetch`, UI de base, utilitaires)
- Chaque application a son propre `router.tsx`/`App.tsx`/`main.tsx`, son propre store d'authentification et son propre build/déploiement (domaine différent, cf. section 0)
- Couche `api/endpoints/` par domaine pour les appels API (isolée des composants), propre à chaque application
- Composants purement présentationnels séparés des hooks métier (`hooks/useXxx.ts`)
- Store d'authentification global (Zustand) exposant l'utilisateur courant et son rôle — instance distincte par application (une session Administrateur n'a pas de sens côté `user-app` et inversement)
- Garde de routes par rôle (`ProtectedRoute` avec liste de rôles autorisés) — dans `admin-app`, toute connexion avec un rôle ADORATEUR/VEILLEUR est refusée (redirection `/non-autorise`), et symétriquement dans `user-app` pour ADMINISTRATEUR/SUPERADMINISTRATEUR
- Gestion centralisée des erreurs API (wrapper `fetch` + toast de notification), factorisée dans `packages/shared`
- **Code-splitting systématique et obligatoire des pages lourdes**, via `React.lazy()` + `<Suspense>` (avec fallback skeleton/spinner) au niveau du `router.tsx` de chaque application, pour ne jamais charger FullCalendar (>100 ko gzippés) ni les écrans d'administration dans le bundle initial (impact direct sur FCP/LCP de l'accueil et de la connexion) :
  - `user-app` : `AgendaPage` (FullCalendar) chargée en lazy — `HomePage`, `LoginPage`, `RegisterPage` restent dans le bundle principal (routes d'entrée, doivent s'afficher vite)
  - `admin-app` : `PlanningPage` (FullCalendar) et la section `superadmin/*` chargées en lazy ; `LoginPage` reste dans le bundle principal (route d'entrée unique de cette application)
  - Import dynamique des plugins FullCalendar utilisés (`dayGridPlugin`, `timeGridPlugin`, `interactionPlugin`) au sein du composant calendrier lui-même, pas au niveau racine
- Composants fonctionnels uniquement, TypeScript strict mode, pas de logique métier dans les composants (déléguée aux hooks et services)

**Arborescence des fichiers**

```
├── apps/
│   ├── user-app/                      # déployée sur le domaine "utilisateurs" (Anonyme, Adorateur, Veilleur)
│   │   ├── src/
│   │   │   ├── api/endpoints/
│   │   │   │   ├── auth.ts            # register, login, logout, refresh (POST /auth/*)
│   │   │   │   ├── bookings.ts        # réserver/annuler (GET/POST /bookings, DELETE /bookings/{id})
│   │   │   │   ├── planning.ts        # consultation du planning (GET /planning)
│   │   │   │   ├── annonces.ts        # lecture seule — ⚠️ pas d'endpoint dans le swagger fourni, cf. 6.1
│   │   │   │   └── contact.ts         # envoi message de contact — ⚠️ pas d'endpoint dans le swagger fourni, cf. 6.1
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Navbar.tsx            # repris du template (section 0.1), adapté à l'authentification
│   │   │   │   │   ├── Footer.tsx            # repris du template
│   │   │   │   │   ├── ScrollToTop.tsx       # repris du template
│   │   │   │   │   └── Layout.tsx
│   │   │   │   ├── vitrine/
│   │   │   │   │   ├── AdorationLive.tsx     # repris du template
│   │   │   │   │   └── Lightbox.tsx          # repris du template
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   ├── RegisterForm.tsx      # remplace InscriptionLecteur/InscriptionVeilleur du template
│   │   │   │   │   └── ProtectedRoute.tsx
│   │   │   │   └── agenda/
│   │   │   │       ├── CalendrierReservations.tsx   # calendrier alimenté par GET /planning
│   │   │   │       ├── ReservationCard.tsx
│   │   │   │       ├── ReservationForm.tsx           # réservation pour soi-même (Veilleur) — POST /bookings
│   │   │   │       └── ReservationConfirmModal.tsx   # confirmation avant réservation/annulation
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── usePlanning.ts
│   │   │   │   ├── useBookings.ts
│   │   │   │   └── useAnnonces.ts     # ⚠️ backend à confirmer
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   ├── RegisterConfirmationPage.tsx
│   │   │   │   ├── AgendaPage.tsx
│   │   │   │   ├── ActualitesPage.tsx         # issue de Actualites.tsx du template, alimentée par useAnnonces
│   │   │   │   ├── QuiSommesNousPage.tsx      # issue de QuiSommesNous.tsx du template (statique)
│   │   │   │   ├── ContactPage.tsx            # issue de Contact.tsx du template
│   │   │   │   ├── MonComptePage.tsx
│   │   │   │   ├── NotFoundPage.tsx
│   │   │   │   └── ForbiddenPage.tsx
│   │   │   ├── store/authStore.ts
│   │   │   ├── router.tsx
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── .env / .env.example        # VITE_API_BASE_URL, VITE_APP_NAME
│   │   ├── public/images/             # images reprises du template
│   │   ├── Dockerfile
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── admin-app/                     # déployée sur le domaine "administration" (Administrateur, SuperAdministrateur)
│       ├── src/
│       │   ├── api/endpoints/
│       │   │   ├── auth.ts            # login, logout, refresh — pas d'auto-inscription côté admin-app
│       │   │   ├── users.ts           # CRUD utilisateurs (GET/POST/PUT/DELETE /users) + valider/rejeter (POST /users/{id}/valider|rejeter)
│       │   │   ├── bookings.ts        # GET/POST /bookings, DELETE /bookings/{id}
│       │   │   ├── planning.ts        # GET /planning
│       │   │   └── annonces.ts        # CRUD — ⚠️ pas d'endpoint dans le swagger fourni, cf. 6.1
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── Footer.tsx
│       │   │   │   └── Layout.tsx
│       │   │   ├── auth/
│       │   │   │   ├── LoginForm.tsx
│       │   │   │   └── ProtectedRoute.tsx
│       │   │   ├── planning/
│       │   │   │   ├── CalendrierPlanningAdmin.tsx  # GET /planning, toutes les réservations
│       │   │   │   ├── ReservationForm.tsx           # pour soi-même ou pour un Veilleur — POST /bookings
│       │   │   │   └── ReservationConfirmModal.tsx
│       │   │   ├── annonces/
│       │   │   │   ├── AnnonceForm.tsx
│       │   │   │   └── AnnonceList.tsx
│       │   │   └── users/
│       │   │       ├── UserTable.tsx
│       │   │       ├── UserForm.tsx
│       │   │       ├── UserProfile.tsx
│       │   │       ├── StatutValidationBadge.tsx   # EN_ATTENTE / VALIDE / REJETE
│       │   │       └── ValidationActions.tsx       # boutons Valider / Rejeter + modal de confirmation
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useUsers.ts
│       │   │   ├── usePlanning.ts
│       │   │   ├── useBookings.ts
│       │   │   └── useAnnonces.ts     # ⚠️ backend à confirmer
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── MonComptePage.tsx
│       │   │   ├── UsersListPage.tsx
│       │   │   ├── UserDetailPage.tsx
│       │   │   ├── PlanningPage.tsx           # ex-"gestion des créneaux" : planning + réservation pour un Veilleur (règle 2.4)
│       │   │   ├── AnnoncesListPage.tsx
│       │   │   ├── AnnonceCreatePage.tsx
│       │   │   ├── AnnonceEditPage.tsx
│       │   │   ├── NotFoundPage.tsx
│       │   │   ├── ForbiddenPage.tsx
│       │   │   └── superadmin/
│       │   │       ├── AdminsListPage.tsx     # SuperAdministrateur uniquement
│       │   │       └── AdminCreatePage.tsx    # SuperAdministrateur uniquement
│       │   ├── store/authStore.ts
│       │   ├── router.tsx
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── .env / .env.example
│       ├── Dockerfile
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   └── shared/                        # code commun aux deux applications — nom du package : @chapelle/shared
│       ├── src/
│       │   ├── types/                 # auth.ts, user.ts, reservation.ts, planning.ts, annonce.ts, common.ts (section 5.2) + index.ts (barrel LOCAL à ce sous-dossier)
│       │   ├── api/                   # client.ts — factory createApiClient(baseURL), wrapper fetch (credentials: "include", 401/403, JSON) + index.ts
│       │   ├── ui/                    # Button, Input, Select, Table, Pagination, Modal, Badge, Card, Spinner, Toast + index.ts
│       │   │                          # + theme.css : thème Tailwind 4 (@theme) migré du template (gold, night, ivory, pearl, polices, animations)
│       │   └── utils/                 # cn.ts (repris du template), validators.ts (Zod), formatters.ts, constants.ts + index.ts
│       │   # ⚠️ pas de src/index.ts racine qui ré-exporterait tout : chaque sous-dossier est un point d'entrée
│       │   #    indépendant (cf. "exports" du package.json ci-dessous), pour permettre le tree-shaking
│       └── package.json               # "sideEffects": false + "exports" par sous-chemin (voir bloc juste après ce schéma)
│
├── docker-compose.yml                 # user-app + admin-app (+ backend en intégration locale)
├── package.json                       # racine du monorepo, workspaces: ["apps/*", "packages/*"]
└── tsconfig.base.json
```

**⚠️ Tree-shaking du package partagé — points d'entrée explicites obligatoires**

`packages/shared` regroupe des types, un client API, des composants UI React et des utilitaires. Sans points d'entrée séparés, un import de `@chapelle/shared` (barrel unique) fait potentiellement remonter tout le module dans les deux bundles — y compris, par exemple, des composants UI d'admin dans `user-app`. `packages/shared/package.json` doit donc déclarer un sous-chemin d'export par domaine, avec `"sideEffects": false` pour que le bundler (Rollup/Vite) élague le code non importé :

```jsonc
// packages/shared/package.json
{
  "name": "@chapelle/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./types": "./src/types/index.ts",
    "./api": "./src/api/index.ts",
    "./ui": "./src/ui/index.ts",
    "./utils": "./src/utils/index.ts"
  }
}
```

Règles associées :
- Import toujours via un sous-chemin explicite — `import { UserResponse } from "@chapelle/shared/types"`, `import { createApiClient } from "@chapelle/shared/api"` — **jamais** `import { ... } from "@chapelle/shared"` (pas de racine exportée)
- Chaque sous-dossier (`types/`, `api/`, `ui/`, `utils/`) a son propre `index.ts` qui ne ré-exporte que son propre contenu — pas de ré-export croisé entre sous-dossiers
- `"sideEffects": false` implique qu'aucun fichier de `packages/shared` ne doit exécuter de code au chargement du module (pas de polyfill global, pas d'injection de CSS au niveau module) ; les composants `ui/` restent des exports Tailwind-only (classes utilitaires, pas de CSS importé dans le module)
- Le champ `exports` empêche également tout import interne profond depuis les apps (`@chapelle/shared/src/ui/Button` par exemple) : seuls les 4 sous-chemins déclarés sont accessibles depuis `apps/user-app` et `apps/admin-app`

### 5.1 CONFIGURATION API (`fetch` natif — pas d'Axios)

- Base URL : `VITE_API_BASE_URL` (ex: `http://localhost:8085/api/v1`, cf. `servers.url` du swagger section 6) — **même backend pour les deux applications**, seule l'origine du frontend appelant change
- Le client API est une **factory `createApiClient(baseURL)` importée depuis `@chapelle/shared/api`**, wrapper léger autour de `fetch` (aucune dépendance externe, ~11 ko gzippés économisés par rapport à Axios), instanciée séparément dans chaque application :
  - `fetch(url, { ...options, credentials: "include" })` sur chaque appel, pour que le cookie de session soit envoyé/reçu (remplace `axios.create({ withCredentials: true })`)
  - `fetch` ne rejette pas sur les statuts 4xx/5xx : le wrapper vérifie `response.ok` et lève une `ApiError` typée (section 5.2) pour rester transparent pour TanStack Query
  - Sérialisation/désérialisation JSON centralisée (`Content-Type: application/json`, `response.json()`) et un point d'entrée unique par méthode HTTP (`get`, `post`, `put`, `delete`)
  - Pas de header `Authorization` à injecter côté frontend, pas de token à stocker
  - Cookie requis en `SameSite=None; Secure` côté backend, puisque frontend(s) et API sont déjà sur des origines différentes
- **⚠️ CORS multi-origine (lié à la séparation en deux applications)** : le backend doit autoriser explicitement les **deux** origines frontend (`user-app` et `admin-app`) avec `credentials: true` — un wildcard `*` est incompatible avec les cookies de session. À confirmer/faire configurer côté backend.
- Chaque application authentifie ses propres utilisateurs indépendamment (`admin-app` a son propre `/connexion` et rejette tout rôle ADORATEUR/VEILLEUR, `user-app` rejette tout rôle ADMINISTRATEUR/SUPERADMINISTRATEUR) — il n'y a pas de session partagée entre les deux apps côté frontend, même si le cookie est techniquement porté par le domaine de l'API
- Gestion des erreurs centralisée dans le wrapper `fetch` (équivalent d'un intercepteur Axios) : 401 → appel `POST /auth/refresh` puis retry une fois, sinon redirection `/connexion` ; 403 → redirection `/non-autorise`
- **Exception : les endpoints `/auth/login`, `/auth/register` et `/auth/refresh` sont exclus de la logique refresh/retry/redirection sur 401.** Un 401 sur `POST /auth/login` signifie identifiants invalides **ou** compte `EN_ATTENTE`/`REJETE` : l'`ApiError` est remontée telle quelle au formulaire de connexion, qui affiche le message d'erreur (pas de boucle de refresh, pas de redirection)
- Timeout : 15 secondes par défaut, via `AbortController` (`fetch(url, { signal })`)

**Variables d'environnement**

`apps/user-app/.env`
```
VITE_API_BASE_URL=http://localhost:8085/api/v1
VITE_APP_NAME=Adoration Chapelle du Vœux
```

`apps/admin-app/.env`
```
VITE_API_BASE_URL=http://localhost:8085/api/v1
VITE_APP_NAME=Adoration Chapelle du Vœux — Administration
```

### 5.2 TYPES TYPESCRIPT (correspondance avec l'API)

*(types alignés directement sur les schémas du swagger — section 6 — et publiés via le point d'entrée `@chapelle/shared/types`, importés par `user-app` et `admin-app`)*

```typescript
// types/user.ts
export enum UserRole {
  ADORATEUR = "ADORATEUR",
  VEILLEUR = "VEILLEUR",
  ADMINISTRATEUR = "ADMINISTRATEUR",
  SUPERADMINISTRATEUR = "SUPERADMINISTRATEUR",
}

// Aligné sur UserResponse.statutValidation et le filtre GET /users?statutValidation=
// (remplace l'ancien StatutCompte — plus de valeur DESACTIVE côté API).
export enum StatutValidation {
  EN_ATTENTE = "EN_ATTENTE",
  VALIDE = "VALIDE",
  REJETE = "REJETE",
}

export interface UserResponse {
  id: string;
  email: string;
  telephone?: string;
  nom: string;
  prenoms: string;
  role: UserRole;
  statutValidation: StatutValidation;
  dateCreation: string;
}

// Filtres de GET /users (tous optionnels, max 255 caractères pour les champs texte)
export interface UserListFilters {
  email?: string;
  telephone?: string;
  nom?: string;
  prenoms?: string;
  statutValidation?: StatutValidation;
}

export interface CreateUserRequest {
  email: string;
  password: string; // min 8, doit contenir 1 chiffre + 1 caractère spécial (cf. pattern swagger)
  nom: string;
  prenoms: string;
  telephone?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  email: string;
  nom: string;
  prenoms: string;
  telephone?: string;
  role?: UserRole;
  // pas de champ password : le swagger fourni n'expose pas d'auto-changement
  // de mot de passe via cet endpoint — à confirmer avec le backend
}

// types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenoms: string;
  telephone?: string;
  // le swagger autorise les 4 valeurs de UserRole ; restriction appliquée
  // côté frontend uniquement, conformément à la règle métier "un utilisateur
  // ne peut pas s'auto-créer un compte Administrateur/SuperAdministrateur"
  role: Extract<UserRole, "ADORATEUR" | "VEILLEUR">;
}

// AuthResponse (swagger) ne contient ni accessToken ni refreshToken :
// l'authentification repose sur un cookie de session httpOnly géré par le
// backend (cf. section 5.1) — à confirmer.
export interface AuthResponse {
  user: UserResponse;
  authenticatedAt: string;
}

// types/reservation.ts
export enum StatutReservation {
  EFFECTUEE = "EFFECTUEE",
  ANNULEE = "ANNULEE",
}

export interface BookingResponse {
  id: string;
  idUtilisateur: string;
  creatorId: string;
  dateDebut: string;
  dateFin: string;
  status: StatutReservation;
  description?: string;
  dateCreation: string;
  dateModification?: string;
  estArchivee: boolean;
}

export interface CreateBookingRequest {
  // absent = réservation pour soi-même ; présent = réservation faite par un
  // Administrateur/SuperAdministrateur pour un Veilleur (règle 2.2)
  idUtilisateur?: string;
  dateDebut: string;
  dateFin: string;
  description?: string;
}

// types/planning.ts
export interface PlanningEntryResponse {
  id: string;
  idUtilisateur: string;
  nomUtilisateur: string;
  prenomsUtilisateur: string;
  roleUtilisateur: UserRole;
  dateDebut: string;
  dateFin: string;
  description?: string;
  estArchivee: boolean;
  // Calculé côté backend selon l'utilisateur qui consulte : pour un Veilleur,
  // false uniquement sur ses propres adorations (il en est le créateur).
  // true → l'UI affiche "Créneau réservé", sans nom/prénoms/rôle.
  estAnonymise: boolean;
}

// types/annonce.ts
// ⚠️ Aucun endpoint /annonces dans le swagger fourni — structure proposée à
// partir du modèle de données (section 3), à confirmer avec le backend.
export enum StatutAnnonce {
  BROUILLON = "BROUILLON",
  PUBLIE = "PUBLIE",
  DEPUBLIE = "DEPUBLIE",
}

export interface AnnonceResponse {
  id: string;
  titre: string;
  contenu: string;
  datePublication: string;
  statut: StatutAnnonce;
}

export interface AnnonceCreateRequest {
  titre: string;
  contenu: string;
  datePublication: string;
}

// types/common.ts
// ⚠️ Le swagger fourni expose DEUX formats de pagination différents selon
// l'endpoint — à confirmer/harmoniser avec le backend :

// Utilisé par GET /bookings et GET /planning (PageResponse*)
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Utilisé par GET /users (sérialisation Spring Data Page complète)
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  code: string;
  message: string;
}

// Paramètre "pageable" du swagger (type Pageable) : Spring le désérialise à
// partir de query params à plat — le client doit envoyer ?page=&size=&sort=
// (et non ?pageable=...). page commence à 0, size ≥ 1.
export interface PageableParams {
  page: number;
  size: number;
  sort?: string[]; // ex. ["dateDebut,asc"]
}
```
### 6. SWAGGER API
```
openapi: 3.0.1
info:
  title: OpenAPI definition
  version: v0
servers:
- url: http://localhost:8085
  description: Generated server url
tags:
- name: Planning
  description: Consultation du planning d'adoration — par jour, par mois, ou sur
    un intervalle libre
paths:
  /api/v1/users/{id}:
    get:
      tags:
      - user-controller
      operationId: getById
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
      responses:
        '200':
          description: OK
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/UserResponse'
    put:
      tags:
      - user-controller
      summary: Modifier un compte (profil et/ou role)
      description: 'Deux Content-Type acceptes sur ce meme endpoint : application/json
        (comportement historique, methode update, sans photo) et multipart/form-data
        (methode updateWithPhoto, photo transportee en dehors du DTO). La photo
        est exigee uniquement si le role resultant du compte est VEILLEUR et qu''aucune
        photo n''existe deja en base (target.photo == null) ; une photo deja presente
        peut etre remplacee via ce meme chemin multipart. Voir epic1-inscription-photo-veilleur-design.md
        §5.'
      operationId: update
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/UpdateUserRequestMultipart'
        required: true
      responses:
        '200':
          description: OK
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/UserResponse'
        '422':
          description: Role resultant VEILLEUR sans photo (ni existante, ni fournie),
            ou photo fournie dont le type reel detecte (Apache Tika) n'est ni jpeg
            ni png, ou taille residuelle > 5 Mo
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '413':
          description: Photo envoyee depassant la taille maximale autorisee (transport)
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '415':
          description: Content-Type ni application/json ni multipart/form-data
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
    delete:
      tags:
      - user-controller
      operationId: delete
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
      responses:
        '204':
          description: No Content
  /api/v1/users/{id}/photo:
    get:
      tags:
      - user-controller
      summary: Consulter la photo d'un compte
      description: 'Contenu binaire de la photo de profil (VEILLEUR), jamais un
        nom de fichier : le nom reel n''est jamais recu depuis le client, il est
        relu depuis User.photo en base. Acces authentifie, meme autorisation que
        GET /api/v1/users/{id} (titulaire du compte ou administrateur ; un ADMINISTRATEUR
        ne peut pas consulter un compte ADMINISTRATEUR/SUPERADMINISTRATEUR). Voir
        epic1-inscription-photo-veilleur-design.md §4.'
      operationId: getPhoto
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
      responses:
        '200':
          description: Photo retournee
          content:
            image/jpeg:
              schema:
                type: string
                format: binary
            image/png:
              schema:
                type: string
                format: binary
        '403':
          description: Appelant ni titulaire ni administrateur, ou ADMINISTRATEUR
            consultant un compte ADMINISTRATEUR/SUPERADMINISTRATEUR
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Compte inconnu, ou compte sans photo, ou fichier reference
            en base mais absent du disque
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  /api/v1/users:
    get:
      tags:
      - user-controller
      operationId: list
      parameters:
      - name: email
        in: query
        required: false
        schema:
          maxLength: 255
          minLength: 0
          type: string
      - name: telephone
        in: query
        required: false
        schema:
          maxLength: 255
          minLength: 0
          type: string
      - name: nom
        in: query
        required: false
        schema:
          maxLength: 255
          minLength: 0
          type: string
      - name: prenoms
        in: query
        required: false
        schema:
          maxLength: 255
          minLength: 0
          type: string
      - name: statutValidation
        in: query
        required: false
        schema:
          type: string
          enum:
          - EN_ATTENTE
          - VALIDE
          - REJETE
      - name: pageable
        in: query
        required: true
        schema:
          $ref: '#/components/schemas/Pageable'
      responses:
        '200':
          description: OK
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/PageUserResponse'
    post:
      tags:
      - user-controller
      summary: Creer un compte (ADMINISTRATEUR/SUPERADMINISTRATEUR)
      description: 'Deux Content-Type acceptes sur ce meme endpoint : application/json
        (comportement historique, methode create, sans photo) et multipart/form-data
        (methode createWithPhoto, photo transportee en dehors du DTO, obligatoire
        si role=VEILLEUR). Voir epic1-inscription-photo-veilleur-design.md §3.'
      operationId: create
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/CreateUserRequestMultipart'
        required: true
      responses:
        '201':
          description: Created
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/UserResponse'
        '422':
          description: Role VEILLEUR demande sans photo, ou photo fournie dont le
            type reel detecte (Apache Tika) n'est ni jpeg ni png, ou taille residuelle
            > 5 Mo
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '413':
          description: Photo envoyee depassant la taille maximale autorisee (transport)
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '415':
          description: Content-Type ni application/json ni multipart/form-data
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  /api/v1/users/{id}/valider:
    post:
      tags:
      - user-controller
      operationId: valider
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
      responses:
        '200':
          description: OK
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/UserResponse'
  /api/v1/users/{id}/rejeter:
    post:
      tags:
      - user-controller
      operationId: rejeter
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
      responses:
        '200':
          description: OK
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/UserResponse'
  /api/v1/bookings:
    get:
      tags:
      - booking-controller
      operationId: listBookings
      parameters:
      - name: utilisateurId
        in: query
        required: false
        schema:
          type: string
          format: uuid
      - name: from
        in: query
        required: false
        schema:
          type: string
          format: date-time
      - name: to
        in: query
        required: false
        schema:
          type: string
          format: date-time
      - name: pageable
        in: query
        required: true
        schema:
          $ref: '#/components/schemas/Pageable'
      responses:
        '200':
          description: OK
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/PageResponseBookingResponse'
    post:
      tags:
      - booking-controller
      operationId: createBooking
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBookingRequest'
        required: true
      responses:
        '201':
          description: Created
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/BookingResponse'
  /api/v1/auth/register:
    post:
      tags:
      - auth-controller
      summary: Inscription publique (ADORATEUR ou VEILLEUR)
      description: 'Deux Content-Type acceptes sur ce meme endpoint : application/json
        (comportement historique, methode register, sans photo) et multipart/form-data
        (methode registerWithPhoto, photo transportee en dehors du DTO, obligatoire
        si role=VEILLEUR). Voir epic1-inscription-photo-veilleur-design.md §2.'
      operationId: register
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/RegisterRequestMultipart'
        required: true
      responses:
        '201':
          description: Created
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '422':
          description: Role VEILLEUR demande sans photo, ou photo fournie dont le
            type reel detecte (Apache Tika) n'est ni jpeg ni png, ou taille residuelle
            > 5 Mo
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '413':
          description: Photo envoyee depassant la taille maximale autorisee (transport)
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '415':
          description: Content-Type ni application/json ni multipart/form-data
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  /api/v1/auth/refresh:
    post:
      tags:
      - auth-controller
      operationId: refresh
      responses:
        '204':
          description: No Content
  /api/v1/auth/logout:
    post:
      tags:
      - auth-controller
      operationId: logout
      responses:
        '204':
          description: No Content
  /api/v1/auth/login:
    post:
      tags:
      - auth-controller
      operationId: login
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
        required: true
      responses:
        '200':
          description: OK
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/AuthResponse'
  /api/v1/planning:
    get:
      tags:
      - Planning
      summary: Consulter le planning d'un jour donné
      description: Retourne les créneaux d'adoration actifs (statut EFFECTUEE, non
        supprimés) dont l'intervalle chevauche la journée demandée. Accès public,
        sans authentification requise. Le contenu identitaire de chaque entrée (idUtilisateur,
        nomUtilisateur, prenomsUtilisateur, roleUtilisateur) est anonymisé (mis à
        null, flag estAnonymise=true) sauf pour un appelant ADMINISTRATEUR/SUPERADMINISTRATEUR
        (identité toujours en clair) ou pour un VEILLEUR consultant son propre créneau
        (identité en clair uniquement sur cette entrée). Un appelant anonyme ou
        ADORATEUR reçoit systématiquement une vue intégralement anonymisée. Les
        champs dateDebut, dateFin, description et estArchivee restent toujours
        visibles, que l'entrée soit anonymisée ou non.
      operationId: getPlanning
      parameters:
      - name: date
        in: query
        description: 'Date du jour à consulter, format ISO yyyy-MM-dd. Optionnel
          : si absent, le planning de la date du jour (fuseau Europe/Paris) est
          retourné.'
        required: false
        schema:
          type: string
          format: date
      - name: pageable
        in: query
        required: true
        schema:
          $ref: '#/components/schemas/Pageable'
      responses:
        '200':
          description: Planning du jour retourné (éventuellement vide)
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/PageResponsePlanningEntryResponse'
        '400':
          description: Paramètre 'date' fourni mais malformé (format non conforme
            à yyyy-MM-dd)
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  /api/v1/planning/mensuel:
    get:
      tags:
      - Planning
      summary: Consulter le planning d'un mois donné
      description: 'Retourne les créneaux d''adoration actifs dont l''intervalle
        chevauche le mois demandé (fenêtre du 1er jour du mois inclus au 1er jour
        du mois suivant exclu). Accès public, sans authentification requise. Mêmes
        règles d''anonymisation RGPD que GET /api/v1/planning : identité en clair
        uniquement pour ADMINISTRATEUR/SUPERADMINISTRATEUR ou pour le titulaire
        consultant son propre créneau, anonymisée dans tous les autres cas (y compris
        appelant anonyme ou ADORATEUR).'
      operationId: getPlanningMensuel
      parameters:
      - name: annee
        in: query
        description: 'Année du mois à consulter, entre 2000 et 2100. Optionnel
          : si ''annee'' et ''mois'' sont tous deux absents, le mois courant est
          utilisé par défaut. Doit être fourni conjointement avec ''mois'' (fournir
          un seul des deux déclenche une erreur 422).'
        required: false
        schema:
          maximum: 2100
          minimum: 2000
          type: integer
          format: int32
      - name: mois
        in: query
        description: 'Mois à consulter, entre 1 et 12. Optionnel : si ''annee''
          et ''mois'' sont tous deux absents, le mois courant est utilisé par défaut.
          Doit être fourni conjointement avec ''annee'' (fournir un seul des deux
          déclenche une erreur 422).'
        required: false
        schema:
          maximum: 12
          minimum: 1
          type: integer
          format: int32
      - name: pageable
        in: query
        required: true
        schema:
          $ref: '#/components/schemas/Pageable'
      responses:
        '200':
          description: Planning du mois retourné (éventuellement vide)
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/PageResponsePlanningEntryResponse'
        '400':
          description: Paramètre 'annee' ou 'mois' hors bornes techniques (annee
            hors [2000, 2100], mois hors [1, 12]) ou de type invalide
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '422':
          description: 'Règle métier violée : ''annee'' fourni sans ''mois'', ou
            ''mois'' fourni sans ''annee'' (les deux doivent être fournis ensemble,
            ou aucun des deux)'
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  /api/v1/planning/intervalle:
    get:
      tags:
      - Planning
      summary: Consulter le planning sur un intervalle libre
      description: 'Retourne les créneaux d''adoration actifs dont l''intervalle
        chevauche la fenêtre [dateDebut, dateFin] demandée, bornes toutes deux incluses.
        Accès public, sans authentification requise. Mêmes règles d''anonymisation
        RGPD que GET /api/v1/planning : identité en clair uniquement pour ADMINISTRATEUR/SUPERADMINISTRATEUR
        ou pour le titulaire consultant son propre créneau, anonymisée dans tous
        les autres cas (y compris appelant anonyme ou ADORATEUR).'
      operationId: getPlanningIntervalle
      parameters:
      - name: dateDebut
        in: query
        description: Date de début de l'intervalle, format ISO yyyy-MM-dd, incluse.
          Obligatoire, aucune valeur par défaut.
        required: true
        schema:
          type: string
          format: date
      - name: dateFin
        in: query
        description: Date de fin de l'intervalle, format ISO yyyy-MM-dd, incluse.
          Obligatoire, aucune valeur par défaut. Doit être postérieure ou égale
          à 'dateDebut', et l'intervalle [dateDebut, dateFin] ne doit pas dépasser
          31 jours.
        required: true
        schema:
          type: string
          format: date
      - name: pageable
        in: query
        required: true
        schema:
          $ref: '#/components/schemas/Pageable'
      responses:
        '200':
          description: Planning de l'intervalle retourné (éventuellement vide)
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/PageResponsePlanningEntryResponse'
        '400':
          description: Paramètre 'dateDebut' ou 'dateFin' absent (les deux sont
            obligatoires) ou malformé (format non conforme à yyyy-MM-dd)
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '422':
          description: 'Règle métier violée : ''dateFin'' antérieure à ''dateDebut'',
            ou intervalle demandé dépassant 31 jours'
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  /api/v1/bookings/{id}:
    get:
      tags:
      - booking-controller
      operationId: getBooking
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
      responses:
        '200':
          description: OK
          content:
            '*/*':
              schema:
                $ref: '#/components/schemas/BookingResponse'
    delete:
      tags:
      - booking-controller
      operationId: cancelBooking
      parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
      responses:
        '204':
          description: No Content
components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        status:
          type: integer
          format: int32
        error:
          type: string
        message:
          type: string
        details:
          type: array
          items:
            type: string
        timestamp:
          type: string
          format: date-time
        path:
          type: string
    UpdateUserRequest:
      required:
      - email
      - nom
      - prenoms
      type: object
      properties:
        email:
          type: string
        nom:
          maxLength: 255
          minLength: 0
          type: string
        prenoms:
          maxLength: 255
          minLength: 0
          type: string
        telephone:
          maxLength: 255
          minLength: 0
          pattern: ^$|^\+?[0-9]{10,15}$
          type: string
        role:
          type: string
          enum:
          - ADORATEUR
          - VEILLEUR
          - ADMINISTRATEUR
          - SUPERADMINISTRATEUR
    UpdateUserRequestMultipart:
      required:
      - email
      - nom
      - prenoms
      type: object
      properties:
        email:
          type: string
        nom:
          maxLength: 255
          minLength: 0
          type: string
        prenoms:
          maxLength: 255
          minLength: 0
          type: string
        telephone:
          maxLength: 255
          minLength: 0
          pattern: ^$|^\+?[0-9]{10,15}$
          type: string
        role:
          type: string
          enum:
          - ADORATEUR
          - VEILLEUR
          - ADMINISTRATEUR
          - SUPERADMINISTRATEUR
        photo:
          type: string
          format: binary
          description: Obligatoire uniquement si le role resultant est VEILLEUR
            et qu'aucune photo n'existe deja en base ; sinon optionnelle (remplace
            la photo existante si fournie). Type reel detecte via Apache Tika (jpeg
            ou png uniquement), 5 Mo maximum.
    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
        telephone:
          type: string
        nom:
          type: string
        prenoms:
          type: string
        role:
          type: string
          enum:
          - ADORATEUR
          - VEILLEUR
          - ADMINISTRATEUR
          - SUPERADMINISTRATEUR
        statutValidation:
          type: string
          enum:
          - EN_ATTENTE
          - VALIDE
          - REJETE
        photo:
          type: string
          description: Nom du fichier stocke sur le serveur (jamais un chemin complet
            ni le nom original du fichier envoye), null si aucune photo. A utiliser
            uniquement pour savoir si une photo existe ; le contenu binaire se recupere
            via GET /api/v1/users/{id}/photo.
        dateCreation:
          type: string
          format: date-time
    CreateUserRequest:
      required:
      - email
      - nom
      - password
      - prenoms
      - role
      type: object
      properties:
        email:
          type: string
        password:
          maxLength: 2147483647
          minLength: 8
          pattern: ^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$
          type: string
        nom:
          maxLength: 255
          minLength: 0
          type: string
        prenoms:
          maxLength: 255
          minLength: 0
          type: string
        telephone:
          maxLength: 255
          minLength: 0
          pattern: ^$|^\+?[0-9]{10,15}$
          type: string
        role:
          type: string
          enum:
          - ADORATEUR
          - VEILLEUR
          - ADMINISTRATEUR
          - SUPERADMINISTRATEUR
    CreateUserRequestMultipart:
      required:
      - email
      - nom
      - password
      - prenoms
      - role
      type: object
      properties:
        email:
          type: string
        password:
          maxLength: 2147483647
          minLength: 8
          pattern: ^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$
          type: string
        nom:
          maxLength: 255
          minLength: 0
          type: string
        prenoms:
          maxLength: 255
          minLength: 0
          type: string
        telephone:
          maxLength: 255
          minLength: 0
          pattern: ^$|^\+?[0-9]{10,15}$
          type: string
        role:
          type: string
          enum:
          - ADORATEUR
          - VEILLEUR
          - ADMINISTRATEUR
          - SUPERADMINISTRATEUR
        photo:
          type: string
          format: binary
          description: Obligatoire si role=VEILLEUR. Type reel detecte via Apache
            Tika (jpeg ou png uniquement), 5 Mo maximum.
    CreateBookingRequest:
      required:
      - dateDebut
      - dateFin
      type: object
      properties:
        idUtilisateur:
          type: string
          format: uuid
        dateDebut:
          type: string
          format: date-time
        dateFin:
          type: string
          format: date-time
        description:
          maxLength: 1000
          minLength: 0
          type: string
    BookingResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        idUtilisateur:
          type: string
          format: uuid
        creatorId:
          type: string
          format: uuid
        dateDebut:
          type: string
          format: date-time
        dateFin:
          type: string
          format: date-time
        status:
          type: string
          enum:
          - EFFECTUEE
          - ANNULEE
        description:
          type: string
        dateCreation:
          type: string
          format: date-time
        dateModification:
          type: string
          format: date-time
        estArchivee:
          type: boolean
    RegisterRequest:
      required:
      - email
      - nom
      - password
      - prenoms
      - role
      type: object
      properties:
        email:
          type: string
        password:
          maxLength: 2147483647
          minLength: 8
          pattern: ^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$
          type: string
        nom:
          maxLength: 255
          minLength: 0
          type: string
        prenoms:
          maxLength: 255
          minLength: 0
          type: string
        telephone:
          maxLength: 255
          minLength: 0
          pattern: ^$|^\+?[0-9]{10,15}$
          type: string
        role:
          type: string
          enum:
          - ADORATEUR
          - VEILLEUR
          - ADMINISTRATEUR
          - SUPERADMINISTRATEUR
    RegisterRequestMultipart:
      required:
      - email
      - nom
      - password
      - prenoms
      - role
      type: object
      properties:
        email:
          type: string
        password:
          maxLength: 2147483647
          minLength: 8
          pattern: ^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$
          type: string
        nom:
          maxLength: 255
          minLength: 0
          type: string
        prenoms:
          maxLength: 255
          minLength: 0
          type: string
        telephone:
          maxLength: 255
          minLength: 0
          pattern: ^$|^\+?[0-9]{10,15}$
          type: string
        role:
          type: string
          enum:
          - ADORATEUR
          - VEILLEUR
          - ADMINISTRATEUR
          - SUPERADMINISTRATEUR
        photo:
          type: string
          format: binary
          description: Obligatoire si role=VEILLEUR. Type reel detecte via Apache
            Tika (jpeg ou png uniquement), 5 Mo maximum.
    AuthResponse:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/UserResponse'
        authenticatedAt:
          type: string
          format: date-time
    LoginRequest:
      required:
      - email
      - password
      type: object
      properties:
        email:
          type: string
        password:
          type: string
    Pageable:
      type: object
      properties:
        page:
          minimum: 0
          type: integer
          format: int32
        size:
          minimum: 1
          type: integer
          format: int32
        sort:
          type: array
          items:
            type: string
    PageUserResponse:
      type: object
      properties:
        totalElements:
          type: integer
          format: int64
        totalPages:
          type: integer
          format: int32
        numberOfElements:
          type: integer
          format: int32
        pageable:
          $ref: '#/components/schemas/PageableObject'
        number:
          type: integer
          format: int32
        first:
          type: boolean
        last:
          type: boolean
        size:
          type: integer
          format: int32
        sort:
          $ref: '#/components/schemas/SortObject'
        content:
          type: array
          items:
            $ref: '#/components/schemas/UserResponse'
        empty:
          type: boolean
    PageableObject:
      type: object
      properties:
        paged:
          type: boolean
        pageNumber:
          type: integer
          format: int32
        pageSize:
          type: integer
          format: int32
        unpaged:
          type: boolean
        offset:
          type: integer
          format: int64
        sort:
          $ref: '#/components/schemas/SortObject'
    SortObject:
      type: object
      properties:
        sorted:
          type: boolean
        unsorted:
          type: boolean
        empty:
          type: boolean
    PageResponsePlanningEntryResponse:
      type: object
      properties:
        content:
          type: array
          items:
            $ref: '#/components/schemas/PlanningEntryResponse'
        page:
          type: integer
          format: int32
        size:
          type: integer
          format: int32
        totalElements:
          type: integer
          format: int64
        totalPages:
          type: integer
          format: int32
        last:
          type: boolean
    PlanningEntryResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        idUtilisateur:
          type: string
          format: uuid
        nomUtilisateur:
          type: string
        prenomsUtilisateur:
          type: string
        roleUtilisateur:
          type: string
          enum:
          - ADORATEUR
          - VEILLEUR
          - ADMINISTRATEUR
          - SUPERADMINISTRATEUR
        dateDebut:
          type: string
          format: date-time
        dateFin:
          type: string
          format: date-time
        description:
          type: string
        estArchivee:
          type: boolean
        estAnonymise:
          type: boolean
    PageResponseBookingResponse:
      type: object
      properties:
        content:
          type: array
          items:
            $ref: '#/components/schemas/BookingResponse'
        page:
          type: integer
          format: int32
        size:
          type: integer
          format: int32
        totalElements:
          type: integer
          format: int64
        totalPages:
          type: integer
          format: int32
        last:
          type: boolean

```

### 6.1 ÉCARTS SWAGGER / RÈGLES MÉTIER — POINTS À CONFIRMER

Le swagger fourni est traité comme source de vérité pour les contrats HTTP. Les écarts suivants avec les règles métier (section 2) et le modèle de données (section 3) doivent être confirmés avec le backend avant/pendant l'implémentation :

| Écart | Détail | Impact frontend |
|---|---|---|
| ~~Statut de compte Veilleur~~ ✅ résolu | Exposé par le swagger mis à jour : `UserResponse.statutValidation` (`EN_ATTENTE`/`VALIDE`/`REJETE`), filtre `GET /users?statutValidation=`, `POST /users/{id}/valider` et `POST /users/{id}/rejeter` (réponse `UserResponse`) | Écrans de validation branchés sur l'API réelle (plus de mock MSW nécessaire). Confirmé : Adorateur `VALIDE` dès l'inscription, Veilleur `EN_ATTENTE` ; `POST /auth/login` renvoie 401 pour un compte `EN_ATTENTE`/`REJETE` ; un compte créé via `POST /users` est `VALIDE` automatiquement (pas d'action de validation à proposer juste après création). |
| Motif du 401 à la connexion ✅ confirmé | Le 401 de `POST /auth/login` renvoie le même code quelle que soit la raison (identifiants invalides, compte `EN_ATTENTE` ou `REJETE`) | Le frontend affiche un message générique unique : "Identifiants invalides ou compte non encore validé." — ne pas tenter de distinguer les cas (ni via `ApiError.code`, ni via `message`) |
| Désactivation de compte | L'ancien statut `DESACTIVE` n'existe plus ; aucun endpoint de désactivation | L'action "désactiver" (gestion des administrateurs) est retirée ; seules restent valider/rejeter/supprimer |
| Planning anonymisé ✅ confirmé | `PlanningEntryResponse.estAnonymise` dépend de l'utilisateur qui consulte : un Veilleur ne voit l'identité que sur les adorations dont il est le créateur | Le frontend ne calcule rien : il se fie à `estAnonymise` renvoyé par le backend. Si `true` → créneau affiché occupé, sans identité. Supposé (à vérifier en recette) : tout est anonymisé pour Anonyme/Adorateur, rien pour Administrateur/SuperAdministrateur |
| Changement de mot de passe | `UpdateUserRequest` n'a pas de champ `password` | La page "Mon compte" ne peut pas proposer de changement de mot de passe via cet endpoint |
| Annonces | Aucun chemin `/annonces` dans le swagger | Écrans de gestion des annonces à développer contre un backend non encore exposé (mock/MSW en attendant) |
| Message de contact | Aucun chemin `/contact` dans le swagger | Formulaire de contact à développer contre un backend non encore exposé (mock/MSW en attendant) |
| Authentification | `AuthResponse` ne renvoie ni `accessToken` ni `refreshToken` | Le frontend suppose une session par cookie `httpOnly` (`fetch(..., { credentials: "include" })`), à confirmer avec le backend |
| Pagination | `PageUserResponse` (Spring Data `Page<T>` complet) diffère de `PageResponseBookingResponse`/`PageResponsePlanningEntryResponse` (format simplifié) | Deux types TS distincts (`SpringPage<T>` / `PageResponse<T>`), pas de wrapper de pagination unique |
| Notion de "créneau" | Le swagger et le modèle de données (section 3) n'ont pas d'entité créneau distincte : une réservation porte directement `dateDebut`/`dateFin` | Les anciens écrans "gestion des créneaux" sont remplacés par une gestion du planning basée sur les réservations elles-mêmes (section 7) |
| CORS deux origines | Le swagger ne documente pas la configuration CORS | Depuis la séparation en deux applications (`user-app` + `admin-app`, section 0), le backend doit autoriser explicitement les deux origines frontend avec `credentials: true` — à faire configurer côté backend |

### 7. INTERFACES & FLUX

Les écrans ci-dessous sont répartis entre les deux applications définies en section 0 : **Application Utilisateurs** (`user-app`) et **Application Administration** (`admin-app`). Il n'y a plus de préfixe `/admin` ou `/superadmin` dans les URLs : chaque application a ses propres routes à la racine de son domaine.

#### APPLICATION UTILISATEURS (`user-app`) — Anonyme, Adorateur, Veilleur

##### Page d'Accueil
**Route** : `/`
- Éléments : textes de présentation et images — reprise de `Home.tsx` du template (hero, galerie `Lightbox`, bloc `AdorationLive`)
- Si non connecté : bouton Créer compte / Connexion
- Si connecté : bouton profil utilisateur
- Navigation : Authentification, création de compte, agenda, actualités, qui sommes-nous, page de contact

##### Authentification
**Routes** : `/connexion` (login) · `/inscription` (création de compte)
- Deux modes : Connexion / Création de compte
- Formulaire connexion : Email + Mot de passe
- Formulaire de création de compte (aligné sur `RegisterRequest`) : Email + Mot de passe (min. 8 caractères, 1 chiffre, 1 caractère spécial) + Nom + Prénoms + Téléphone (optionnel, `^\+?[0-9]{10,15}$`) + Rôle souhaité (Adorateur ou Veilleur uniquement)
- Actions : Se connecter → redirection `/` | Créer compte → `/inscription/confirmation`, dont le message dépend de `AuthResponse.user.statutValidation` : Adorateur → `VALIDE` → "Votre compte est créé, vous pouvez vous connecter" ; Veilleur → `EN_ATTENTE` → "Votre compte est en attente de validation par un administrateur"
- Connexion d'un compte `EN_ATTENTE` ou `REJETE` : le backend renvoie **401**, avec le même code que pour des identifiants invalides → le formulaire affiche le message générique "Identifiants invalides ou compte non encore validé.", sans refresh ni redirection (cf. 5.1 et 6.1). La page `/inscription/confirmation` doit donc prévenir le Veilleur qu'il ne pourra se connecter qu'après validation

##### Agenda d'adoration
**Route** : `/agenda` (accessible sans connexion ; actions de réservation conditionnées au rôle) — alimentée par `GET /planning`
- Vue : Calendrier des réservations du jour/de la période (une plage libre = absence de réservation sur ce créneau horaire, il n'y a pas d'entité "créneau" distincte, cf. 6.1)
- Entrées avec `estAnonymise = true` : affichées comme "Créneau réservé", sans nom/prénoms du bénéficiaire. Pour un Veilleur connecté, seules ses propres adorations (dont il est le créateur) affichent l'identité, et elles sont mises en évidence ("Ma réservation") avec l'action d'annulation
- Actions possibles : voir le détail d'une réservation, réserver un horaire libre (Veilleur pour lui-même ; Administrateur/SuperAdministrateur pour lui-même ou pour un Veilleur), annuler ma réservation (≥ 24h avant, règle 2.3)
- Filtres : par date, par utilisateur (mes réservations)
- Confirmation : modal de confirmation avant réservation et avant annulation

##### Mon compte *(Veilleur, Administrateur, SuperAdministrateur)*
**Route** : `/mon-compte`
- Affichage : informations du profil, historique de mes réservations
- Actions : modifier mes informations, déconnexion

##### Actualités *(⚠️ backend annonces non exposé — cf. 6.1)*
**Route** : `/actualites` — reprise de `Actualites.tsx` du template
- Affichage : liste des annonces au statut `PUBLIE` (titre, date de publication, contenu), mise en page du template conservée
- Données : `useAnnonces` (mock MSW tant que `/annonces` n'existe pas) — plus de données en dur

##### Qui sommes-nous ?
**Route** : `/qui-sommes-nous` — reprise de `QuiSommesNous.tsx` du template (contenu statique)

##### Page de contact
**Route** : `/contact` — reprise de `Contact.tsx` du template
- Formulaire : Nom, Email, Sujet, Message
- Action : Envoyer → Confirmation d'envoi

#### APPLICATION ADMINISTRATION (`admin-app`) — Administrateur, SuperAdministrateur

##### Authentification
**Route** : `/connexion`
- Formulaire connexion : Email + Mot de passe uniquement — **pas d'auto-inscription** dans cette application (les comptes Administrateur/SuperAdministrateur sont créés par un SuperAdministrateur, cf. section 1)
- Si le compte authentifié n'a pas le rôle Administrateur ou SuperAdministrateur → refus de connexion et redirection `/non-autorise` (cette application n'est pas destinée aux Adorateur/Veilleur)
- Action : Se connecter → redirection `/`

##### Mon compte
**Route** : `/mon-compte`
- Affichage : informations du profil de l'Administrateur/SuperAdministrateur connecté
- Actions : modifier mes informations, déconnexion

##### Gestion des utilisateurs
**Route** : `/` (racine de l'application, liste) · `/utilisateurs/:id` (détail/édition)
- Affichage : liste des utilisateurs Adorateur/Veilleur (tableau)
- Colonnes : ID, Email, Nom, Prénoms, Rôle, Statut de validation (badge `EN_ATTENTE`/`VALIDE`/`REJETE`), Date création
- Recherche / filtres : email, téléphone, nom, prénoms, statut de validation (`GET /users?...&statutValidation=`) — raccourci "Comptes en attente" pré-filtré sur `EN_ATTENTE`
- Actions : voir détails, modifier rôle, **valider** (`POST /users/{id}/valider`) ou **rejeter** (`POST /users/{id}/rejeter`) un compte en attente — avec modal de confirmation, supprimer, ajouter un utilisateur
- Mise à jour de la ligne à partir du `UserResponse` renvoyé par valider/rejeter + invalidation du cache TanStack Query de la liste
- Restriction : un Administrateur ne voit pas d'action de création/modification sur les comptes Administrateur/SuperAdministrateur

##### Gestion du planning
**Route** : `/planning` (planning de tous les utilisateurs, règle 2.4) — `GET /planning`, `GET/POST /bookings`, `DELETE /bookings/{id}`
- Affichage : planning du jour avec toutes les réservations (tous utilisateurs)
- Actions : réserver un horaire pour soi-même ou pour un Veilleur, annuler n'importe quelle réservation
- Formulaire de réservation : Utilisateur bénéficiaire (optionnel, sinon soi-même) + Date + Heure début + Heure fin + Description (optionnel)

##### Gestion des annonces *(⚠️ backend non exposé dans le swagger fourni — cf. 6.1)*
**Route** : `/annonces` (liste) · `/annonces/nouveau` (création) · `/annonces/:id` (édition)
- Affichage : liste des annonces publiées
- Actions : créer, modifier, supprimer, publier/dépublier
- Formulaire : Titre + Contenu + Date publication

##### Gestion des administrateurs *(SuperAdministrateur uniquement)*
**Route** : `/administrateurs` (liste) · `/administrateurs/nouveau` (création)
- Affichage : liste des comptes Administrateur (tableau)
- Actions : créer un compte Administrateur, modifier, supprimer *(pas de "désactiver" : aucun endpoint dans le swagger, cf. 6.1)*
- Restriction : section entièrement masquée/inaccessible pour un Administrateur (redirection `/non-autorise` en accès direct)

#### Pages transverses *(présentes dans chacune des deux applications)*
**Routes** : `/non-autorise` (403, rôle insuffisant ou inapproprié pour cette application) · `*` (404, page introuvable)

### 7.1 ARBORESCENCE DES ROUTES (React Router 7, data router)

**Application Utilisateurs (`user-app`)**

| Route | Page / Composant | Layout | Accès |
|---|---|---|---|
| `/` | PageAccueil | PublicLayout | Public |
| `/connexion` | PageConnexion | PublicLayout | Public (non connecté) |
| `/inscription` | PageInscription | PublicLayout | Public (non connecté) |
| `/inscription/confirmation` | PageConfirmationInscription | PublicLayout | Public |
| `/agenda` | PageAgenda | PublicLayout | Public — actions réservation conditionnées au rôle |
| `/actualites` | PageActualites *(⚠️ backend annonces à confirmer)* | PublicLayout | Public |
| `/qui-sommes-nous` | PageQuiSommesNous | PublicLayout | Public |
| `/contact` | PageContact | PublicLayout | Public |
| `/mon-compte` | PageMonCompte | AppLayout | Veilleur (Adorateur : lecture seule) |
| `/non-autorise` | Page403 | PublicLayout | Public |
| `*` | Page404 | PublicLayout | Public |

**Règles de garde (`ProtectedRoute`, `user-app`)**
- Route protégée + utilisateur non connecté → redirection vers `/connexion` (avec retour à la route demandée après connexion)
- Route protégée + rôle Administrateur/SuperAdministrateur → redirection vers `/non-autorise` (ces rôles utilisent `admin-app`, pas cette application)

**Application Administration (`admin-app`)**

| Route | Page / Composant | Layout | Accès |
|---|---|---|---|
| `/connexion` | PageConnexion | PublicLayout | Public (non connecté) |
| `/` | PageGestionUtilisateurs | AdminLayout | Administrateur, SuperAdministrateur |
| `/utilisateurs/:id` | PageDetailUtilisateur | AdminLayout | Administrateur, SuperAdministrateur |
| `/planning` | PageGestionPlanning | AdminLayout | Administrateur, SuperAdministrateur |
| `/annonces` | PageGestionAnnonces *(⚠️ backend à confirmer)* | AdminLayout | Administrateur, SuperAdministrateur |
| `/annonces/nouveau` | PageCreationAnnonce | AdminLayout | Administrateur, SuperAdministrateur |
| `/annonces/:id` | PageEditionAnnonce | AdminLayout | Administrateur, SuperAdministrateur |
| `/administrateurs` | PageGestionAdministrateurs | AdminLayout | SuperAdministrateur uniquement |
| `/administrateurs/nouveau` | PageCreationAdministrateur | AdminLayout | SuperAdministrateur uniquement |
| `/mon-compte` | PageMonCompte | AdminLayout | Administrateur, SuperAdministrateur |
| `/non-autorise` | Page403 | PublicLayout | Public |
| `*` | Page404 | PublicLayout | Public |

**Règles de garde (`ProtectedRoute`, `admin-app`)**
- Route protégée + utilisateur non connecté → redirection vers `/connexion`
- Connexion réussie mais rôle Adorateur/Veilleur → refus, redirection `/non-autorise` (cette application est réservée aux rôles Administrateur/SuperAdministrateur)
- `/administrateurs/*` : accessible uniquement au rôle SuperAdministrateur

### 7.2 CORRESPONDANCE AVEC LES ENDPOINTS API

*(alignée sur le swagger réel — section 6 ; les lignes marquées ⚠️ n'ont pas d'endpoint dans le swagger fourni, cf. 6.1)*

| Page / Action | Application | Méthode | Endpoint API |
|---|---|---|---|
| Inscription | user-app | POST | `/auth/register` |
| Connexion | user-app + admin-app | POST | `/auth/login` |
| Rafraîchir la session | user-app + admin-app | POST | `/auth/refresh` |
| Déconnexion | user-app + admin-app | POST | `/auth/logout` |
| Consulter le planning d'un jour | user-app + admin-app | GET | `/planning?date=&page=&size=` |
| Liste des réservations (filtrable par utilisateur/période) | admin-app | GET | `/bookings?utilisateurId=&from=&to=&page=&size=` |
| Détail d'une réservation | user-app + admin-app | GET | `/bookings/{id}` |
| Réserver (soi-même, ou pour un Veilleur si Administrateur/SuperAdministrateur) | user-app + admin-app | POST | `/bookings` |
| Annuler une réservation | user-app + admin-app | DELETE | `/bookings/{id}` |
| Liste des utilisateurs | admin-app | GET | `/users?email=&telephone=&nom=&prenoms=&statutValidation=&page=&size=` |
| Détail utilisateur | admin-app | GET | `/users/{id}` |
| Créer un utilisateur | admin-app | POST | `/users` |
| Modifier un utilisateur / rôle | admin-app | PUT | `/users/{id}` |
| Supprimer un utilisateur | admin-app | DELETE | `/users/{id}` |
| Valider un compte | admin-app | POST | `/users/{id}/valider` |
| Rejeter un compte | admin-app | POST | `/users/{id}/rejeter` |
| Changer mon mot de passe | user-app + admin-app | ⚠️ | non exposé dans le swagger fourni — à confirmer |
| Liste des annonces (page `/actualites`) | user-app (lecture) + admin-app (CRUD) | ⚠️ | non exposé dans le swagger fourni — à confirmer |
| Créer/modifier/publier/supprimer une annonce | admin-app | ⚠️ | non exposé dans le swagger fourni — à confirmer |
| Envoyer un message de contact | user-app | ⚠️ | non exposé dans le swagger fourni — à confirmer |

### 8. EXIGENCES NON-FONCTIONNELLES (NFR)

**Sécurité**
- Authentification par session cookie `httpOnly` gérée par le backend (`AuthResponse` du swagger n'expose aucun token, cf. 6.1) — `credentials: "include"` côté `fetch`, aucun token à stocker côté frontend
- Cookie de session en `SameSite=None; Secure`, et backend en CORS multi-origine autorisant explicitement les domaines de `user-app` et `admin-app` avec `credentials: true` (cf. 6.1 et 5.1)
- Chaque application impose ses propres rôles autorisés à la connexion : `admin-app` refuse les rôles Adorateur/Veilleur, `user-app` refuse les rôles Administrateur/SuperAdministrateur
- Toutes les routes de réservation/gestion protégées côté frontend par rôle (`ProtectedRoute`)
- HTTPS obligatoire en production sur les deux domaines
- Aucune donnée sensible (mot de passe) en `localStorage`

**Performance** *(bundle initial, démarrage — LCP/TTI/FCP)*
- **Code-splitting obligatoire** via `React.lazy()` + `<Suspense>` pour toute page intégrant FullCalendar (`AgendaPage` dans `user-app`, `PlanningPage` dans `admin-app`, >100 ko gzippés à elles seules) ainsi que pour les sections d'administration (`superadmin/*`) — ces pages ne doivent jamais faire partie du chunk initial (cf. 5. Architecture & patterns)
- Pas d'Axios : client API en `fetch` natif (section 5.1) pour économiser ~11 ko gzippés et une dépendance
- Import dynamique des plugins FullCalendar (`dayGridPlugin`, `timeGridPlugin`, `interactionPlugin`) dans le composant calendrier lui-même, pas au niveau racine de l'application
- Budget indicatif de bundle initial (JS gzippé, hors chunks lazy) : **< 150 ko** par application — à vérifier via `vite build --mode analyze` ou équivalent (`rollup-plugin-visualizer`)
- Pagination des listes (utilisateurs, réservations) — 20 éléments/page
- Mise en cache des requêtes planning via TanStack Query (staleTime 60s)

**Accessibilité & Responsive**
- Respect WCAG 2.1 niveau AA sur les formulaires et le calendrier
- Interface responsive (mobile-first, breakpoints Tailwind : sm 640px, md 768px, lg 1024px)
- Navigation au clavier (focus management), labels accessibles et attributs ARIA sur les composants interactifs

**Gestion des erreurs**
- Affichage des erreurs API via toast/notification non bloquante
- États de chargement (skeleton/spinner) sur toutes les vues asynchrones
- Messages de confirmation avant toute action destructrice (annulation de réservation, suppression d'utilisateur)
- Page 404 et page d'erreur générique

**Internationalisation**
- Interface entièrement en français
- Formatage des dates au format français (`dd/MM/yyyy`), fuseau horaire Europe/Paris

### 9. TESTS ET QUALITÉ

Chaque application (`user-app`, `admin-app`) a sa propre suite de tests ; le package `packages/shared` a la sienne (types, `api/client.ts`, `utils/`, `ui/`).

**Tests unitaires**
- Vitest, exécuté par workspace (`npm run test --workspace=apps/user-app`, etc.)
- Coverage minimum : 80% sur les hooks et les utilitaires (`useAuth`, `validators`, `formatters`)

**Tests de composants**
- React Testing Library
- Tests des formulaires (validation, soumission, messages d'erreur)
- Tests des composants de réservation (affichage des réservations existantes sur le planning, actions réserver/annuler)
- Tests du `ProtectedRoute` (redirection `/connexion` si non authentifié, `/non-autorise` si rôle insuffisant ou inapproprié pour l'application)

**Tests d'intégration**
- MSW (Mock Service Worker) pour mocker les appels API — y compris les endpoints ⚠️ non exposés par le swagger fourni (annonces, contact, changement de mot de passe), en attendant leur implémentation backend
- `user-app` : inscription → connexion → consultation du planning → réservation → annulation
- `admin-app` : connexion → gestion des utilisateurs (filtre `EN_ATTENTE` → valider / rejeter) → planning (réservation pour un Veilleur) → gestion des annonces
- Tests du wrapper `fetch` (envoi du cookie de session, refresh, gestion erreurs 401/403, **pas de refresh/redirection sur 401 de `/auth/login`**) — factorisables via `packages/shared`
- Tests de connexion refusée (401) pour un Veilleur `EN_ATTENTE` et un compte `REJETE` : message affiché dans le formulaire
- Tests d'affichage du planning : entrées `estAnonymise = true` sans identité, entrées du Veilleur connecté avec identité
- Tests de rejet de connexion pour un rôle inapproprié (Veilleur sur `admin-app`, Administrateur sur `user-app`)

**Tests end-to-end**
- Playwright, une configuration par application (deux `baseURL` de dev distinctes)
- Parcours `user-app` : réservation, annulation, création de compte
- Parcours `admin-app` : connexion, validation et rejet d'un compte Veilleur en attente, réservation pour un Veilleur, création d'annonce
- Tests sur différentes tailles d'écran (mobile/desktop)

### 9.1 ENVIRONNEMENT DE DÉVELOPPEMENT

**Scripts npm** *(racine du monorepo, npm workspaces — `--workspace=apps/user-app` ou `--workspace=apps/admin-app` pour cibler une application, sinon `--workspaces` pour les deux)*
```bash
npm install                                  # Installation des dépendances (toutes les applications + le package partagé)
npm run dev --workspace=apps/user-app        # user-app en développement (port 3000)
npm run dev --workspace=apps/admin-app       # admin-app en développement (port 3001)
npm run build --workspaces                   # Build de production des deux applications
npm run preview --workspace=apps/user-app    # Preview du build de production
npm run test --workspaces                    # Lancer les tests (toutes les applications + le package partagé)
npm run test:coverage --workspaces           # Lancer les tests avec coverage
npm run lint --workspaces                    # Linting
npm run format                               # Formatage
```

**Docker**
- Un `Dockerfile` multi-stage (build + Nginx) par application (`apps/user-app/Dockerfile`, `apps/admin-app/Dockerfile`)
- Configuration Nginx pour SPA (fallback sur `index.html`), une par application
- `docker-compose.yml` à la racine avec deux services (`user-app` sur le port 3000, `admin-app` sur le port 3001) et une intégration avec le backend

**ESLint + Prettier**
- ESLint avec config `typescript-eslint`, règles strictes TypeScript (`strict` mode, `no-any`)
- Prettier pour le formatage automatique

### 10. LIVRABLES ATTENDUS

1. Un monorepo npm workspaces avec **deux applications React 19 + TypeScript déployables indépendamment** (`apps/user-app`, `apps/admin-app`) et un package partagé (`packages/shared`)
2. Configuration Vite optimisée (dev + production) pour chacune des deux applications
3. Types TypeScript alignés avec l'API backend (section 5.2), centralisés dans `packages/shared` et importés par les deux applications
4. Tests unitaires, composants et intégration (80%+ coverage) pour chaque application et le package partagé + scénarios E2E Playwright par application
5. README.md avec instructions d'installation, de lancement et de déploiement **des deux applications sur leurs domaines respectifs**
6. Fichiers `.env.example` pour `user-app` et `admin-app`
7. `docker-compose.yml` à la racine avec un service par application
8. Configuration ESLint + Prettier partagée entre les deux applications
9. Configuration Tailwind + composants UI de base (design system minimal) mutualisés et exposés via `@chapelle/shared/ui`, réutilisés par les deux applications pour garder une identité visuelle cohérente

### 11. CONTRAINTES ADDITIONNELLES

- TypeScript strict mode activé (pas de `any`)
- Composants fonctionnels uniquement (pas de classes)
- Pas de CSS-in-JS (Tailwind CSS exclusivement)
- Pas de librairie de composants lourde (pas de Material UI, Ant Design, etc.)
- Partir du template de base (section 0.1) : conserver son identité visuelle (palettes `gold`/`night`, polices, animations) et ses composants, sans reprendre `vite-plugin-singlefile`, le CDN Tailwind ni le contenu statique d'`index.html`
- Nommage des fichiers : PascalCase pour les composants, camelCase pour les utilitaires
- Pas de logique métier dans les composants (déléguée aux hooks et aux services)
- Gestion des erreurs API centralisée (wrapper `fetch` + toast de notification)
- Pas d'Axios ni d'autre client HTTP tiers : `fetch` natif exclusivement
- Code-splitting obligatoire (`React.lazy` + `Suspense`) pour toute page chargeant FullCalendar ou relevant de l'administration
- Tous les textes de l'interface en français
- Aucun code métier/type/composant dupliqué entre `apps/user-app` et `apps/admin-app` : tout ce qui est commun aux deux applications vit dans `packages/shared`
- `apps/user-app` et `apps/admin-app` ne doivent avoir aucune dépendance l'une envers l'autre (uniquement vers `packages/shared`), pour rester déployables indépendamment
- Imports depuis `@chapelle/shared` toujours via un sous-chemin explicite (`/types`, `/api`, `/ui`, `/utils`), jamais depuis la racine du package ni par un chemin profond dans `src/` — cf. `exports` + `"sideEffects": false` en section 5, pour garantir le tree-shaking et éviter qu'un bundle embarque du code non utilisé (ex. composants UI d'admin dans `user-app`)
