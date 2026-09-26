# Conception — U4 : Gestion des utilisateurs

Sources : `aidlc-docs/inception/user-stories/stories.md` (US-USERS-01 à 08, Domaine 5), `aidlc-docs/inception/application-design/{unit-of-work,components,component-methods,services,component-dependency}.md` (section `UserManagementModule` : `UserTable`, `UserForm`, `UserProfile`, `StatutValidationBadge`, `ValidationActions`, `useUsers`/`useCreateUser`/`useUpdateUser`/`useDeleteUser`/`useValiderUser`/`useRejeterUser`), `prompt-frontend-revise.md` §5.4 (page "Gestion des utilisateurs") et §6 (swagger complet `/api/v1/users`, `/api/v1/users/{id}`, `/api/v1/users/{id}/valider`, `/api/v1/users/{id}/rejeter`), `packages/shared/src/types/user.ts` (`UserResponse`, `UserListFilters`, `CreateUserRequest`, `UpdateUserRequest`, non redéfinis), `packages/shared/src/ui/{Table,Pagination,Badge,Select,Input,Button,Modal,Card}.tsx` (props exactes vérifiées avant conception), et le code déjà livré par U1 (`api/endpoints/users.ts#updateUser`, `ProfileCard.tsx`, `router.tsx`, `Sidebar.tsx`, `authStore.ts`/`useAuth.ts`) et U3 (`api/endpoints/users.ts#listUsers`/`ListUsersParams`, `hooks/useVeilleurs.ts`, `hooks/useCreateBooking.ts`/`useCancelBooking.ts` pour le patron d'invalidation par préfixe).

Niveau conception uniquement : signatures, contrats, arborescence — **pas de corps de fonction, pas de JSX de rendu métier**.

**Rappel de périmètre (`unit-of-work.md`)** : U4 dépend de U0, U1 uniquement (pas de U2/U3), et ne concerne que `admin-app`. Elle bloque U5 (`AdminManagementModule`), qui réutilisera `UserTable`/`UserForm` avec `role=ADMINISTRATEUR` — décision structurante détaillée en §4, qui conditionne plusieurs choix de props ci-dessous.

---

## 1. Arborescence cible

```
apps/admin-app/src/
├── api/endpoints/
│   └── users.ts                              [MODIFIÉ] + getUser, createUser, deleteUser, validerUser, rejeterUser ;
│                                                         ListUsersParams + telephone ; updateUser gagne
│                                                         { skipForbiddenRedirect: true } (§3)
├── lib/
│   └── manageableRoles.ts                    [CRÉÉ] MANAGEABLE_ROLES / MANAGEABLE_ROLE_OPTIONS / isManageableRole (§4)
├── hooks/
│   ├── useUsers.ts                           [CRÉÉ] (§5.1)
│   ├── useUser.ts                            [CRÉÉ] extension non prévue par component-methods.md, nécessaire à /utilisateurs/:id (§5.2)
│   ├── useCreateUser.ts                      [CRÉÉ] (§5.3)
│   ├── useUpdateUser.ts                      [CRÉÉ] (§5.3)
│   ├── useDeleteUser.ts                      [CRÉÉ] (§5.3)
│   ├── useValiderUser.ts                     [CRÉÉ] (§5.4)
│   └── useRejeterUser.ts                     [CRÉÉ] (§5.4)
├── components/users/
│   ├── StatutValidationBadge.tsx             [CRÉÉ] (§6.1)
│   ├── UserFilters.tsx                       [CRÉÉ] (§6.2)
│   ├── UserTable.tsx                         [CRÉÉ] (§6.3)
│   ├── ValidationActions.tsx                 [CRÉÉ] (§6.4)
│   ├── ConfirmActionModal.tsx                [CRÉÉ] modal de confirmation générique, réutilisée par valider/rejeter/supprimer (§6.5)
│   ├── UserProfile.tsx                       [CRÉÉ] (§6.6)
│   └── UserForm.tsx                          [CRÉÉ] (§6.7)
├── components/profile/
│   └── ProfileCard.tsx                       [MODIFIÉ] consomme StatutValidationBadge, retire son mapping dupliqué (§6.1)
├── pages/
│   ├── PageGestionUtilisateurs.tsx           [CRÉÉ] remplace le placeholder de "/" (§7.1)
│   └── PageDetailUtilisateur.tsx             [CRÉÉ] remplace le placeholder de "/utilisateurs/:id" (§7.2)
└── router.tsx                                 [MODIFIÉ] branche les deux pages ci-dessus (§7.3)
```

Chaque fichier créé s'accompagne d'un `*.test.ts(x)` colocalisé (convention U0-U3), non détaillé ici. **Aucune extension de `packages/shared` n'est nécessaire** (comme U3) : `types/user.ts` couvre intégralement les DTO requis, `ui/{Table,Pagination,Badge,Select,Input,Button,Modal,Card}` couvrent tous les besoins de présentation, et aucune nouvelle dépendance npm n'est ajoutée (`react-hook-form`, `zod`, `@tanstack/react-query`, `react-router` sont déjà présents dans `apps/admin-app/package.json`).

---

## 2. Rappel des contrats déjà livrés, réutilisés tels quels

```typescript
// packages/shared/src/types/user.ts
export enum UserRole { ADORATEUR, VEILLEUR, ADMINISTRATEUR, SUPERADMINISTRATEUR }
export enum StatutValidation { EN_ATTENTE, VALIDE, REJETE }

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

export interface UserListFilters {
  email?: string;
  telephone?: string;
  nom?: string;
  prenoms?: string;
  statutValidation?: StatutValidation;
}

export interface CreateUserRequest {
  email: string;
  password: string;
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
}
```

Swagger (`prompt-frontend-revise.md` §6, extrait vérifié) — confirme sans ambiguïté le nom et la forme de tous les endpoints nécessaires à cette unité, ce qui **tranche définitivement** le point qui aurait pu rester ouvert sur le nom exact des actions de validation/rejet :

| Endpoint | Réponse |
|---|---|
| `GET /users/{id}` | `200` → `UserResponse` |
| `PUT /users/{id}` | `200` → `UserResponse` (déjà livré, `updateUser`) |
| `DELETE /users/{id}` | `204` |
| `GET /users?email=&telephone=&nom=&prenoms=&statutValidation=&page=&size=` | `200` → `PageUserResponse` (= `SpringPage<UserResponse>`, déjà livré, `listUsers`) |
| `POST /users` | `201` → `UserResponse` |
| `POST /users/{id}/valider` | `200` → `UserResponse` |
| `POST /users/{id}/rejeter` | `200` → `UserResponse` |

Statut initial confirmé (`prompt-frontend-revise.md` §5, note de confirmation) : un compte créé par un Administrateur/SuperAdministrateur via `POST /users` est `VALIDE` automatiquement, quel que soit le rôle (US-USERS-05) — aucune action de validation à déclencher après création.

---

## 3. Endpoints — extension de `api/endpoints/users.ts`

`updateUser` (U1) et `listUsers`/`ListUsersParams` (U3) sont conservés. Trois évolutions sur l'existant, plus cinq ajouts :

```typescript
// [MODIFIÉ] ListUsersParams gagne `telephone` : US-USERS-01/prompt-frontend-revise §5.4 listent
// explicitement "email, téléphone, nom, prénoms, statutValidation" parmi les filtres de la page
// liste, mais `ListUsersParams`/`listUsers` livrés en U3 (pour VeilleurSelect, qui n'en avait pas
// besoin) ne portaient que nom/prenoms/email/statutValidation.
export interface ListUsersParams {
  nom?: string;
  prenoms?: string;
  email?: string;
  telephone?: string;
  statutValidation?: StatutValidation;
  page?: number;
  size?: number;
}

export function listUsers(params: ListUsersParams): Promise<SpringPage<UserResponse>>;
// GET /users?nom=&prenoms=&email=&telephone=&statutValidation=&page=&size=

// [MODIFIÉ] updateUser gagne { skipForbiddenRedirect: true } (cf. §4 sur la nature purement
// UI, non confirmée côté serveur, de la restriction "pas d'action sur un compte admin") : un 403
// scoped sur cette route précise ne doit jamais rediriger toute l'application vers /non-autorise.
// Signature inchangée, appelants existants (useUpdateProfile de U1) non impactés.
export function updateUser(id: string, dto: UpdateUserRequest): Promise<UserResponse>; // PUT /users/{id}

// [CRÉÉ]
export function getUser(id: string): Promise<UserResponse>; // GET /users/{id}

export function createUser(dto: CreateUserRequest): Promise<UserResponse>;
// POST /users — apiClient.post("/users", dto, { skipForbiddenRedirect: true })

export function deleteUser(id: string): Promise<void>;
// DELETE /users/{id} — apiClient.delete(`/users/${id}`, { skipForbiddenRedirect: true })

export function validerUser(id: string): Promise<UserResponse>;
// POST /users/{id}/valider — apiClient.post(`/users/${id}/valider`, undefined, { skipForbiddenRedirect: true })

export function rejeterUser(id: string): Promise<UserResponse>;
// POST /users/{id}/rejeter — apiClient.post(`/users/${id}/rejeter`, undefined, { skipForbiddenRedirect: true })
```

`skipForbiddenRedirect` (option déjà ajoutée à `RequestOptions` par U3, cf. `packages/shared/src/api/client.ts`) est appliquée à **toutes les routes d'écriture** de ce fichier (`createUser`, `updateUser`, `deleteUser`, `validerUser`, `rejeterUser`) — jamais aux routes de lecture (`getUser`, `listUsers`), où un 403 signifierait une vraie régression de garde de rôle (`ProtectedRoute` déjà censé l'empêcher) et où la redirection standard reste donc le comportement voulu. Même raisonnement préventif que U3 §3.1/§9 point 3 : le swagger ne documente aucun code d'erreur spécifique pour un refus scoped (ex. tentative d'action sur un compte admin malgré le masquage UI, cf. §4), et ce plan préfère neutraliser par avance le risque de redirection intempestive plutôt que d'attendre une confirmation d'intégration.

---

## 4. Restriction transverse — comptes Administrateur/SuperAdministrateur hors périmètre de U4

Décision structurante, qui conditionne toute la suite : **les pages de U4 (`/`, `/utilisateurs/:id`) ne gèrent jamais de compte `ADMINISTRATEUR`/`SUPERADMINISTRATEUR`, quel que soit le rôle de l'utilisateur connecté** (Administrateur ou SuperAdministrateur). Ce n'est pas une restriction conditionnée au rôle du viewer : `unit-of-work.md` place la gestion des comptes Administrateur dans un module séparé (`U5 — AdminManagementModule`, routes dédiées `/administrateurs`/`/administrateurs/nouveau`, déjà posées en placeholder par U1, SuperAdministrateur uniquement) qui **réutilise** `UserTable`/`UserForm` de U4 plutôt que d'étendre ses pages. US-USERS-08 ("Administrateur non-Super ne voit pas d'action sur un compte admin") est donc automatiquement vérifiée par construction pour ce persona, et reste vraie pour le SuperAdministrateur sur les routes de U4 par simple absence de ces comptes dans la table gérée ici — U5 lui donnera la vue dédiée.

```typescript
// apps/admin-app/src/lib/manageableRoles.ts
export const MANAGEABLE_ROLES: UserRole[] = [UserRole.ADORATEUR, UserRole.VEILLEUR];

export const MANAGEABLE_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: UserRole.ADORATEUR, label: "Adorateur" },
  { value: UserRole.VEILLEUR, label: "Veilleur" },
];

export function isManageableRole(role: UserRole): boolean;
```

(`MANAGEABLE_ROLE_OPTIONS` reprend exactement la forme/les libellés déjà utilisés par `RegisterForm.tsx`, user-app, U1 — dupliqué plutôt que remonté dans `packages/shared`, cohérent avec la politique déjà actée de ne pas factoriser au premier besoin identique entre les deux apps indépendantes.)

La garde s'applique à **trois endroits distincts**, chacun avec un rôle précis :

1. **`useUsers` (§5.1, filtrage de la liste)** : `select` retire du résultat toute ligne dont `role` n'est pas dans `MANAGEABLE_ROLES`, côté client — `GET /users` n'exposant aucun filtre `role` (limitation déjà documentée en U3 §3.3/§9 point 1), il n'existe aucun moyen de demander directement "les comptes non-admin" au backend. Couvre US-USERS-08 ("la liste ... ne présente que les comptes Adorateur/Veilleur").
2. **`UserForm` (§6.7, options de rôle)** : le `<Select role>` n'affiche jamais que les `roleOptions` passées en prop par la page appelante (`MANAGEABLE_ROLE_OPTIONS` pour U4) — pas de valeur `ADMINISTRATEUR`/`SUPERADMINISTRATEUR` **structurellement absente de la liste**, pas seulement désactivée. Couvre littéralement US-USERS-08 ("le rôle Administrateur/SuperAdministrateur n'apparaît pas comme option").
3. **`PageDetailUtilisateur` (§7.2, garde de défense en profondeur)** : `GET /users/{id}` n'est, lui, soumis à aucun filtre de rôle — un accès direct par URL à l'identifiant d'un compte admin (contournant le filtrage de la table) resterait possible sans cette garde explicite. La page vérifie `isManageableRole(user.role)` après chargement et, si faux, n'affiche ni `UserForm`, ni `ValidationActions`, ni le bouton Supprimer — seulement un message ("Ce compte n'est pas géré par cette page.") renvoyant vers `/`.

Aucune vérification supplémentaire n'est ajoutée dans les hooks de mutation eux-mêmes (`useUpdateUser`/`useDeleteUser`/`useValiderUser`/`useRejeterUser`) : ils font confiance au composant appelant, exactement comme `useCreateBooking`/`useCancelBooking` (U3) ne re-valident pas côté client les règles métier déjà vérifiées en amont — cf. §9 point ouvert 1 sur l'absence de confirmation que le backend applique lui-même cette règle.

---

## 5. Hooks — `useUsers` et mutations

### 5.1 `hooks/useUsers.ts`

```typescript
export function useUsers(
  filters: UserListFilters & { page: number; size: number },
): UseQueryResult<SpringPage<UserResponse>>;
// queryKey: ["users", "list", filters]
// queryFn: () => listUsers(filters)
// select: (page) => ({ ...page, content: page.content.filter((u) => MANAGEABLE_ROLES.includes(u.role)) })
```

Signature reprise à l'identique de `component-methods.md`. `select` applique le filtrage de rôle décrit en §4 — cf. §9 point ouvert 2 sur l'anomalie de pagination que cela introduit (une page backend de 20 lignes peut afficher moins de 20 lignes après filtrage, sans que `totalPages`/`totalElements`, calculés côté backend sur l'ensemble non filtré, ne le reflètent).

### 5.2 `hooks/useUser.ts` — extension non prévue par `component-methods.md`

```typescript
export function useUser(id: string): UseQueryResult<UserResponse>;
// queryKey: ["users", "detail", id]
// queryFn: () => getUser(id)
```

Nécessaire à `/utilisateurs/:id` (`unit-of-work.md` exige explicitement une page détail), alors que `component-methods.md` ne documente que le trio liste + mutations. Même situation que `login`/`register` en U1 §6 ou `useUser`-like lecture unitaire absente des specs amont : ce fichier étant créé par U4 (pas un contrat déjà figé), l'ajout n'entre en contradiction avec rien d'acté. Volontairement **non filtré** par `MANAGEABLE_ROLES` (contrairement à `useUsers`) : la page détail a besoin de recevoir la donnée réelle, y compris pour un compte admin consulté par URL directe, afin de pouvoir appliquer la garde de §4 point 3 et afficher le message explicatif plutôt qu'une erreur générique.

### 5.3 CRUD — `useCreateUser.ts`, `useUpdateUser.ts`, `useDeleteUser.ts`

```typescript
export function useCreateUser(): UseMutationResult<UserResponse, ApiError, CreateUserRequest>;
// mutationFn: createUser
// onSuccess: invalide ["users"] (préfixe), toast "Utilisateur créé."
// onError: toast (error instanceof ApiError ? error.message || message générique : message générique)

export function useUpdateUser(): UseMutationResult<UserResponse, ApiError, { id: string; dto: UpdateUserRequest }>;
// mutationFn: ({ id, dto }) => updateUser(id, dto)
// onSuccess: invalide ["users"] (préfixe), toast "Utilisateur modifié."
// onError: identique

export function useDeleteUser(): UseMutationResult<void, ApiError, string /* id */>;
// mutationFn: deleteUser
// onSuccess: invalide ["users"] (préfixe), toast "Utilisateur supprimé."
// onError: identique
```

Signatures reprises à l'identique de `component-methods.md`. **Invalidation par préfixe `["users"]`**, pas de clé exacte (même choix que `["planning"]`/`["bookings"]` en U3 §4) : couvre en une seule invalidation `["users", "list", ...]` (`useUsers`, toute page/filtre confondus), `["users", "detail", id]` (`useUser`) et, effet de bord bienvenu, `["users", "veilleurs"]` (`useVeilleurs`, U3) — créer/modifier/supprimer un compte Veilleur depuis U4 rafraîchit donc automatiquement le sélecteur de bénéficiaire du calendrier admin (`/planning`) sans mécanisme supplémentaire.

Écart volontaire par rapport à la formulation de `services.md` ("mise à jour optimiste de la ligne à partir du `UserResponse` renvoyé") : ce plan retient l'invalidation de cache déjà systématiquement utilisée dans le projet (`useCreateBooking`/`useCancelBooking`, U3) plutôt qu'un `queryClient.setQueryData` manuel — la réponse de mutation contient déjà tout ce qu'il faut pour re-render immédiatement la ligne concernée une fois le refetch (quasi instantané, pas de round-trip perceptible) résolu, sans dupliquer la logique de fusion de cache. `services.md` n'est pas contredit sur le fond (la ligne est bien mise à jour visuellement dès la réponse), seulement sur le mécanisme.

### 5.4 Validation/rejet — `useValiderUser.ts`, `useRejeterUser.ts`

```typescript
export function useValiderUser(): UseMutationResult<UserResponse, ApiError, string /* id */>;
// mutationFn: validerUser
// onSuccess: invalide ["users"] (préfixe), toast "Compte validé."
export function useRejeterUser(): UseMutationResult<UserResponse, ApiError, string /* id */>;
// mutationFn: rejeterUser
// onSuccess: invalide ["users"] (préfixe), toast "Compte rejeté."
// onError (les deux) : identique à §5.3
```

---

## 6. `UserManagementModule` — composants

### 6.1 `components/users/StatutValidationBadge.tsx`

```typescript
export interface StatutValidationBadgeProps {
  statut: StatutValidation;
}

export function StatutValidationBadge(props: StatutValidationBadgeProps): JSX.Element;
```

Reprend exactement le mapping déjà écrit (dupliqué localement) dans `ProfileCard.tsx` (U1) : `EN_ATTENTE` → `Badge variant="warning"` "En attente", `VALIDE` → `variant="success"` "Validé", `REJETE` → `variant="danger"` "Rejeté". **`ProfileCard.tsx` est modifié** pour consommer ce composant à la place de ses deux `Record` locaux (`STATUT_BADGE_VARIANT`/`STATUT_LABEL`, supprimés) — petite dette technique intra-`admin-app` résorbée en passant (aucun changement de comportement visible, mêmes variantes/libellés), justifiée parce que U4 introduit de toute façon le composant nommé exactement pour cet usage dans `unit-of-work.md`.

### 6.2 `components/users/UserFilters.tsx`

```typescript
export interface UserFiltersValues {
  email?: string;
  telephone?: string;
  nom?: string;
  prenoms?: string;
  statutValidation?: StatutValidation;
}

export interface UserFiltersProps {
  defaultValues: UserFiltersValues;
  onSubmit: (values: UserFiltersValues) => void;
  onPendingShortcut: () => void;
}

export function UserFilters(props: UserFiltersProps): JSX.Element;
```

Formulaire RHF (pas de schéma Zod : ce sont des filtres, pas des données à valider avant envoi — mêmes contraintes `maxLength: 255` que le backend, non bloquantes côté client) : quatre `Input` (email, téléphone, nom, prénoms) + un `Select` (`statutValidation`, options `""` "Tous" / `EN_ATTENTE` / `VALIDE` / `REJETE`), bouton `type="submit"` "Rechercher". Soumission **explicite** (pas de filtrage en direct à la frappe, contrairement à `FiltreDatePlanning`/`FiltreMesReservations` de U3 dont les contrôles sont des `date`/`checkbox` à changement discret) : aucun utilitaire de *debounce* n'existe dans `packages/shared/src/utils` à ce jour, et déclencher un `GET /users` à chaque frappe sur un champ texte serait coûteux sans lui — cf. §9 point ouvert 3. `onSubmit` convertit les chaînes vides en `undefined` avant transmission (une chaîne vide serait autrement envoyée telle quelle par `buildQueryString`, cf. `packages/shared/src/api/client.ts`, qui ne filtre que `undefined`/`null`).

Bouton séparé `Button variant="gold-outline"` "Comptes en attente" (US-USERS-02) : appelle directement `onPendingShortcut()`, indépendamment de l'état interne du formulaire. La page appelante (`PageGestionUtilisateurs`, §7.1) remonte alors `UserFilters` avec une nouvelle `key` (dérivée de `filters`, même technique que `key={date}` sur `CalendrierReservations`/`CalendrierPlanningAdmin` en U2/U3) pour que les champs affichés (RHF, non contrôlés au-delà du montage) reflètent bien `statutValidation=EN_ATTENTE` après le clic, plutôt que d'introduire un formulaire contrôlé pour ce seul besoin.

### 6.3 `components/users/UserTable.tsx`

```typescript
export interface UserTableProps {
  users: UserResponse[];
  isLoading: boolean;
}

export function UserTable(props: UserTableProps): JSX.Element;
```

Construit sur `Table<UserResponse>` (`@chapelle/shared/ui`). Colonnes (US-USERS-01) : Email, Nom, Prénoms, Rôle (libellé via une table de correspondance locale identique à `MANAGEABLE_ROLE_OPTIONS`, §4), Statut (`<StatutValidationBadge statut={row.statutValidation} />`), Date de création (`formatDate`, `@chapelle/shared/utils`), Actions. La colonne Actions rend un lien `Link to={"/utilisateurs/" + row.id}` ("Voir") **plus**, conditionnellement (`row.statutValidation === StatutValidation.EN_ATTENTE`), `<ValidationActions user={row} />` (§6.4) — directement dans la ligne, conformément à US-USERS-03/04 ("le statut passe à VALIDE **dans la ligne du tableau**"). Choix délibéré de ne pas ajouter de prop `onRowClick`/navigation sur la ligne entière à `Table` (`packages/shared/ui/Table.tsx` n'expose pas ce mécanisme et ce plan ne modifie pas ce composant partagé, cf. précédent U3 "aucune extension de `packages/shared` nécessaire") : le lien "Voir" explicite dans la colonne Actions suffit et reste cohérent avec l'API `render` par colonne déjà utilisée ailleurs (`MyBookingsList`, U1).

### 6.4 `components/users/ValidationActions.tsx`

```typescript
export interface ValidationActionsProps {
  user: UserResponse;
}

export function ValidationActions(props: ValidationActionsProps): JSX.Element | null;
```

Retourne `null` si `user.statutValidation !== StatutValidation.EN_ATTENTE` (rien à afficher pour un compte déjà `VALIDE`/`REJETE`). Sinon, deux `Button size="sm"` ("Valider" `variant="primary"`, "Rejeter" `variant="danger"`), chacun ouvrant un état local `pendingAction: "valider" | "rejeter" | null` piloté par `useValiderUser()`/`useRejeterUser()` (§5.4) et un unique `<ConfirmActionModal>` (§6.5) paramétré selon l'action en cours. Composant **réutilisé tel quel** dans deux contextes distincts sans variante : une ligne de `UserTable` (§6.3) et l'en-tête de `PageDetailUtilisateur` (§7.2) — cohérent avec le fait que `unit-of-work.md`/`components.md` le nomment comme un composant unique, pas un par emplacement.

### 6.5 `components/users/ConfirmActionModal.tsx`

```typescript
export interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "danger";
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmActionModal(props: ConfirmActionModalProps): JSX.Element;
```

Construit directement sur `Modal`/`Button` (`@chapelle/shared/ui`) : `title`, corps = `<p>{message}</p>`, footer = `Button variant="outline"` ("Annuler"/`onClose`) + `Button variant={confirmVariant ?? "primary"}` (`confirmLabel`/`onConfirm`, `isLoading={isSubmitting}`). Seul composant réellement générique du module (contrairement à `ReservationConfirmModal` de U3, spécialisé avec un récapitulatif métier `ReservationCard`) : réutilisé par `ValidationActions` (valider "Confirmer la validation du compte" / rejeter "Confirmer le rejet du compte") **et** par `PageDetailUtilisateur` pour la suppression ("Confirmer la suppression de l'utilisateur", `confirmVariant="danger"`) — trois usages, un seul composant, pas de duplication de la structure `Modal` + footer à deux boutons.

### 6.6 `components/users/UserProfile.tsx`

```typescript
export interface UserProfileProps {
  user: UserResponse;
}

export function UserProfile(props: UserProfileProps): JSX.Element;
```

`Card` (titre "Informations") + `<dl>` : Nom, Prénoms, Email, Téléphone (`user.telephone ?? "—"`), Rôle (libellé), Statut (`<StatutValidationBadge statut={user.statutValidation} />`), Date de création (`formatDate`). Forme jumelle de `ProfileCard` (U1, `components/profile/`) mais générique à un utilisateur *cible* passé en prop plutôt qu'à l'utilisateur connecté lu via `useAuth()` — les deux composants restent distincts (l'un est un composant de lecture-seule sur soi-même dans le contexte "Mon compte", l'autre sur un tiers dans le contexte "Gestion des utilisateurs"), cf. §9 point ouvert 4 sur une possible fusion future.

### 6.7 `components/users/UserForm.tsx`

```typescript
export type UserFormProps =
  | {
      mode: "create";
      roleOptions: { value: UserRole; label: string }[];
      isSubmitting: boolean;
      onSubmit: (dto: CreateUserRequest) => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      roleOptions: { value: UserRole; label: string }[];
      defaultValues: { email: string; nom: string; prenoms: string; telephone?: string; role: UserRole };
      isSubmitting: boolean;
      onSubmit: (dto: UpdateUserRequest) => void;
      onCancel?: () => void;
    };

export function UserForm(props: UserFormProps): JSX.Element;
```

Schémas Zod locaux (non partagés, structure propre à ce formulaire — même rationale que `ReservationForm`, U3 §7.1) :

```typescript
function buildUserFormSchema(mode: "create" | "edit", allowedRoles: UserRole[]) {
  const roleField = z.custom<UserRole>((value) => allowedRoles.includes(value as UserRole), {
    message: "Rôle invalide",
  });
  const base = {
    email: emailSchema,
    nom: nomSchema,
    prenoms: prenomsSchema,
    telephone: telephoneSchema,
    role: roleField,
  };
  return mode === "create" ? z.object({ ...base, password: passwordSchema }) : z.object(base);
}
```

`allowedRoles` = `roleOptions.map((option) => option.value)`, jamais codé en dur : c'est ce qui permet à U5 de réutiliser `UserForm` avec `roleOptions=[{ value: UserRole.ADMINISTRATEUR, label: "Administrateur" }]` sans toucher à ce fichier (`unit-of-work.md`, "U5 réutilise `UserForm`/`UserTable` de U4 avec `role=ADMINISTRATEUR`"). `emailSchema`/`passwordSchema`/`nomSchema`/`prenomsSchema`/`telephoneSchema` importés de `@chapelle/shared/utils` (déjà livrés, mêmes règles que `registerSchema`/`updateProfileSchema`, U0/U1).

Rendu : `Input` email (éditable ici, contrairement à `ProfileEditForm`/U1 où le champ est `disabled` — US-USERS-06 autorise explicitement la modification de l'email d'un tiers par un Administrateur), `Input type="password"` uniquement en `mode="create"` (jamais en édition — US-USERS-06, "sans champ mot de passe"), `Input` nom/prénoms/téléphone, `Select` role (`options={roleOptions}`). Bouton `type="submit"` ("Créer"/"Enregistrer" selon `mode`) + bouton "Annuler" (`onCancel`, optionnel en édition — pas toujours pertinent d'annuler une édition en place).

**Décision de composition, différente de `ReservationForm` (U3)** : `UserForm` n'encapsule pas son propre `Modal`. En mode `edit`, il est rendu tel quel à l'intérieur d'un `<Card>` sur `/utilisateurs/:id` (même patron que `ProfileEditForm` dans `PageMonCompte`, U1) ; en mode `create`, c'est la page appelante (`PageGestionUtilisateurs`, §7.1) qui l'englobe dans un `<Modal>`. Ce découplage est nécessaire pour que U5 puisse réutiliser `UserForm` dans un contexte de page dédiée (`AdminCreatePage`, `unit-of-work.md`) plutôt que dans une modal, sans avoir à extraire quoi que ce soit du composant.

---

## 7. Pages & routage

### 7.1 `pages/PageGestionUtilisateurs.tsx`

Remplace le `PagePlaceholder title="Gestion des utilisateurs"` de `router.tsx` sur `/`. État local : `filters: UserListFilters` (initial `{}`), `page: number` (initial `0`), `isCreateModalOpen: boolean`. `useUsers({ ...filters, page, size: DEFAULT_PAGE_SIZE })`, `useCreateUser()`.

- `UserFilters` (`defaultValues={filters}`, `key={JSON.stringify(filters)}`, cf. §6.2) : `onSubmit` → `setFilters(values); setPage(0)` ; `onPendingShortcut` → `setFilters({ statutValidation: StatutValidation.EN_ATTENTE }); setPage(0)`.
- `Button` "Ajouter un utilisateur" → `setIsCreateModalOpen(true)`.
- `UserTable` (`users={usersQuery.data?.content ?? []}`, `isLoading={usersQuery.isLoading}`).
- `Pagination` (`page={usersQuery.data?.number ?? 0}`, `totalPages={usersQuery.data?.totalPages ?? 0}`, `onPageChange={setPage}`) — noter `SpringPage.number` (pas `.page`, cf. `packages/shared/src/types/common.ts`) comme source de l'index courant, à ne pas confondre avec l'état local `page` qui pilote la requête suivante.
- `isCreateModalOpen && <Modal isOpen title="Ajouter un utilisateur" onClose={...}><UserForm mode="create" roleOptions={MANAGEABLE_ROLE_OPTIONS} isSubmitting={createUser.isPending} onSubmit={(dto) => createUser.mutate(dto, { onSuccess: () => setIsCreateModalOpen(false) })} onCancel={() => setIsCreateModalOpen(false)} /></Modal>`.
- `usersQuery.isError` → message "Impossible de charger les utilisateurs. Veuillez réessayer plus tard." (même sobriété que `PageAgenda`/`PagePlanning`, U2/U3).

### 7.2 `pages/PageDetailUtilisateur.tsx`

Remplace le `PagePlaceholder title="Détail utilisateur"` de `router.tsx` sur `/utilisateurs/:id`. `useParams<{ id: string }>()`, `useNavigate()` (`react-router`). `useUser(id)`, `useUpdateUser()`, `useDeleteUser()`. État local `isDeleteModalOpen: boolean`.

- `userQuery.isLoading` → `Spinner`.
- `userQuery.isError || !userQuery.data` → message "Utilisateur introuvable." (pas de distinction fine 404/autre — même simplicité que le traitement d'erreur de lecture ailleurs dans le projet, ex. `usePlanning` dans `PageAgenda`).
- `!isManageableRole(userQuery.data.role)` → message "Ce compte n'est pas géré par cette page." + lien retour vers `/` (garde de §4 point 3) ; ni `UserForm`, ni `ValidationActions`, ni bouton Supprimer ne sont rendus dans ce cas.
- Sinon : `<UserProfile user={userQuery.data} />`, `<ValidationActions user={userQuery.data} />` (no-op si pas `EN_ATTENTE`, §6.4), `<Card title="Modifier les informations"><UserForm mode="edit" roleOptions={MANAGEABLE_ROLE_OPTIONS} defaultValues={{...}} isSubmitting={updateUser.isPending} onSubmit={(dto) => updateUser.mutate({ id, dto })} /></Card>`, `Button variant="danger"` "Supprimer" → `setIsDeleteModalOpen(true)`.
- `isDeleteModalOpen && <ConfirmActionModal title="Supprimer l'utilisateur" message={...} confirmLabel="Supprimer" confirmVariant="danger" isSubmitting={deleteUser.isPending} onConfirm={() => deleteUser.mutate(id, { onSuccess: () => navigate("/") })} onClose={() => setIsDeleteModalOpen(false)} />`.

### 7.3 `router.tsx` — branchement

```typescript
// [MODIFIÉ] remplace les deux PagePlaceholder marqués `// U4`
import PageGestionUtilisateurs from "./pages/PageGestionUtilisateurs";
import PageDetailUtilisateur from "./pages/PageDetailUtilisateur";
// ...
{ path: "/",                 element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PageGestionUtilisateurs /></ProtectedRoute> },
{ path: "/utilisateurs/:id", element: <ProtectedRoute allowedRoles={ADMIN_ROLES}><PageDetailUtilisateur /></ProtectedRoute> },
```

Aucune route `/utilisateurs/nouveau` n'est ajoutée : la création (US-USERS-05) passe par la modal de `PageGestionUtilisateurs` (§7.1), pas par une route dédiée — `unit-of-work.md` ne liste que `/` et `/utilisateurs/:id` pour U4 (contrairement à U5, qui nomme explicitement une `AdminCreatePage` séparée). Cf. §9 point ouvert 5 sur cette asymétrie assumée. `Sidebar.tsx` (U1) n'est pas modifiée : son lien "Utilisateurs" pointe déjà vers `/`, et aucun lien Sidebar séparé n'est ajouté pour le raccourci "Comptes en attente" (US-USERS-02 le décrit comme un contrôle sur la page liste elle-même, pas comme une entrée de navigation globale).

---

## 8. Rappel — pas de garde de rôle applicative supplémentaire

Comme `PagePlanning`/`PageAgenda` (U2/U3), `ProtectedRoute`/`ADMIN_ROLES` (déjà posés par `router.tsx`, U1) garantissent l'accès aux deux pages de cette unité pour tout utilisateur `ADMINISTRATEUR`/`SUPERADMINISTRATEUR` connecté — aucun appel supplémentaire à `useAuth()` n'est nécessaire dans `PageGestionUtilisateurs`/`PageDetailUtilisateur` au-delà de ce que `ProtectedRoute` fournit déjà. La distinction Administrateur/SuperAdministrateur n'a aucune incidence sur le comportement de ces deux pages (cf. §4) : elle n'intervient que pour l'accès aux routes de U5.

---

## 9. Points ouverts pour l'orchestrateur

1. **Absence de confirmation serveur de la restriction "pas d'action sur un compte admin"** (§4) : ni le swagger extrait ni `requirements.md`/`stories.md` ne documentent un code d'erreur ou une règle métier serveur qui empêcherait `PUT`/`DELETE`/`valider`/`rejeter` sur un `UserResponse` de rôle `ADMINISTRATEUR`/`SUPERADMINISTRATEUR`. Ce plan traite donc la restriction comme **purement côté UI** (masquage dans la table, absence d'option de rôle, garde de page sur accès direct par URL, §4) et neutralise par précaution le risque de redirection globale via `skipForbiddenRedirect` (§3) si le backend venait malgré tout à renvoyer un 403 scoped. Si le backend n'applique aucune garde équivalente de son côté, un appel direct à l'API (hors UI) resterait techniquement capable d'agir sur un compte admin. À confirmer avec l'équipe backend.
2. **Anomalie de pagination induite par le filtrage client des rôles** (§5.1) : `useUsers` retire les lignes `ADMINISTRATEUR`/`SUPERADMINISTRATEUR` d'une page déjà paginée côté backend (`totalElements`/`totalPages` calculés sur l'ensemble non filtré, cf. `SpringPage`). Une page de 20 lignes contenant, par exemple, 2 comptes admin n'afficherait que 18 lignes visibles sans qu'aucun indicateur ne le signale, et la numérotation de `Pagination` resterait calée sur le total non filtré. Risque jugé mineur (les comptes admin sont présumés rares face à la base Adorateur/Veilleur) mais non résolu : même limitation de fond que l'absence de filtre `role` sur `GET /users`, déjà actée en U3 §9 point 1, qu'une évolution du swagger (filtre `role`) résoudrait pour les deux unités à la fois.
3. **Filtres soumis explicitement (`UserFilters`, §6.2) plutôt qu'en direct à la frappe** : choisi faute d'utilitaire de *debounce* disponible dans `packages/shared/src/utils`. Si l'ergonomie "recherche en direct" est jugée nécessaire, il faudrait soit ajouter un tel utilitaire à `packages/shared` (impact transverse, à trancher au niveau orchestrateur plutôt que localement dans U4), soit l'accepter comme limitation UX mineure.
4. **`UserProfile` (U4) et `ProfileCard` (U1) restent deux composants distincts** malgré une structure très proche (dl de champs + badge de statut) : l'un lit `useAuth().user` (soi-même), l'autre reçoit `user` en prop (un tiers). Une factorisation en un seul composant paramétré par `user` serait possible mais toucherait un fichier déjà livré par U1 au-delà du simple remplacement de mapping déjà fait en §6.1 — non retenue ici pour limiter la surface de modification d'un module d'une unité antérieure. À reconsidérer si une troisième occurrence apparaît (ex. U5).
5. **Création via modal (U4) vs page dédiée (`AdminCreatePage`, U5)** : asymétrie assumée entre les deux unités qui réutilisent pourtant le même `UserForm` — `unit-of-work.md` ne liste qu'une route liste + une route détail pour U4 (pas de route de création), mais nomme explicitement une page de création séparée pour U5. `UserForm` est conçu (§6.7, pas de `Modal` interne) pour être indifférent à ce choix de composition, donc aucun refactor ne serait nécessaire si l'orchestrateur préfère harmoniser U4 sur une route `/utilisateurs/nouveau` dédiée plutôt qu'une modal. À confirmer.
