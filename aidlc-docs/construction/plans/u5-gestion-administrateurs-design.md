# Conception — U5 : Gestion des administrateurs

Sources : `aidlc-docs/inception/user-stories/stories.md` (US-ADMINS-01 à 04, Domaine 6), `aidlc-docs/inception/application-design/{unit-of-work,components,component-methods,services,component-dependency}.md` (section `AdminManagementModule` : `pages/superadmin/AdminsListPage`, `AdminCreatePage`, "réutilise `UserForm`/`UserTable` de U4 avec `role=ADMINISTRATEUR`" — aucune méthode/service dédié n'est documenté au-delà de cette phrase, `component-methods.md` ne liste que le trio `useUsers`/mutations déjà livré par U4), `packages/shared/src/types/user.ts` (`UserResponse`, `CreateUserRequest`, `UpdateUserRequest`, `UserRole`, non redéfinis), et le code déjà livré par U1 (`router.tsx` — routes `/administrateurs`/`/administrateurs/nouveau` déjà posées en `PagePlaceholder` sous `ProtectedRoute allowedRoles={[SUPERADMINISTRATEUR]}` ; `Sidebar.tsx` — lien déjà conditionnel à `role === SUPERADMINISTRATEUR`) et U4 (`api/endpoints/users.ts` complet — `listUsers`/`createUser`/`updateUser`/`deleteUser`/`getUser` ; `hooks/{useCreateUser,useUpdateUser,useDeleteUser}.ts` ; `components/users/{UserForm,ConfirmActionModal}.tsx` ; `hooks/useVeilleurs.ts`, U3, précédent direct de la stratégie de listage décrite en §3 ; `lib/manageableRoles.ts`, U4, **non réutilisé** ici — cf. §2).

Niveau conception uniquement : signatures, contrats, arborescence — **pas de corps de fonction, pas de JSX de rendu métier**.

**Rappel de périmètre (`unit-of-work.md`)** : U5 dépend de U0, U1, U4 (pas de U2/U3), ne concerne que `admin-app`, et est réservée au SuperAdministrateur (l'Administrateur simple ne doit ni voir ni accéder à cette section, US-ADMINS-04). Elle ne bloque aucune unité suivante.

---

## 1. Arborescence cible

```
apps/admin-app/src/
├── lib/
│   └── adminRoles.ts                         [CRÉÉ] ADMIN_ROLE_OPTIONS / isAdminAccount (§2)
├── hooks/
│   └── useAdmins.ts                          [CRÉÉ] modelé sur useVeilleurs (U3), pas sur useUsers (U4) (§3)
├── components/users/
│   └── UserTable.tsx                         [MODIFIÉ] + prop optionnelle renderRowActions,
│                                                        rétrocompatible (§4)
├── pages/superadmin/
│   ├── AdminsListPage.tsx                    [CRÉÉ] remplace le placeholder de "/administrateurs" (§5.1)
│   └── AdminCreatePage.tsx                   [CRÉÉ] remplace le placeholder de "/administrateurs/nouveau" (§5.2)
└── router.tsx                                 [MODIFIÉ] branche les deux pages ci-dessus sur les routes
                                                          déjà gardées depuis U1, aucune garde nouvelle (§6)
```

Chaque fichier créé s'accompagne d'un `*.test.ts(x)` colocalisé (convention U0-U4), non détaillé ici ; `UserTable.test.tsx` (U4) est complété d'un cas couvrant `renderRowActions`, sans qu'aucun cas existant n'ait à changer (§4). **Aucune extension de `packages/shared` n'est nécessaire** (comme U3/U4) : `types/user.ts` et `ui/{Table,Modal,Card,Button}` couvrent intégralement les besoins, aucune nouvelle dépendance npm n'est ajoutée.

Fichiers de U4 **explicitement réutilisés sans aucune modification** : `api/endpoints/users.ts` (tout le CRUD existe déjà, y compris `skipForbiddenRedirect: true` sur les routes d'écriture, §3 de la conception U4 — U5 n'a rien à y ajouter), `hooks/{useCreateUser,useUpdateUser,useDeleteUser}.ts` (invalidation déjà par préfixe `["users"]`, couvre donc automatiquement la queryKey de `useAdmins`, §3), `components/users/{UserForm,ConfirmActionModal}.tsx`, `router.tsx` (guard `ProtectedRoute allowedRoles={[SUPERADMINISTRATEUR]}`, déjà posée), `components/layout/Sidebar.tsx` (lien déjà conditionnel).

---

## 2. Pourquoi `lib/manageableRoles.ts` (U4) n'est pas réutilisé tel quel

`MANAGEABLE_ROLES`/`MANAGEABLE_ROLE_OPTIONS` (U4) valent `[ADORATEUR, VEILLEUR]` — **exclusion volontaire** d'`ADMINISTRATEUR`/`SUPERADMINISTRATEUR` (cf. conception U4 §4, décision structurante qui délègue justement ces deux rôles à U5). Les réutiliser en U5 produirait une liste vide et un formulaire sans option de rôle valide : contre-sens complet. U5 introduit donc son propre fichier, au même niveau (`lib/`), avec la même forme :

```typescript
// apps/admin-app/src/lib/adminRoles.ts
export const ADMIN_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: UserRole.ADMINISTRATEUR, label: "Administrateur" },
];

export function isAdminAccount(role: UserRole): boolean;
```

**Décision sur le périmètre exact du rôle géré — un seul rôle, pas deux** : `unit-of-work.md`/`components.md` disent explicitement "réutilise `UserForm`/`UserTable` de U4 avec `role=ADMINISTRATEUR`" (singulier), et le Gherkin US-ADMINS-01 est sans ambiguïté : *"Alors je vois un tableau des comptes de **rôle ADMINISTRATEUR**"* — pas `ADMINISTRATEUR` **et** `SUPERADMINISTRATEUR`. Ce plan retient donc `ADMIN_ROLE_OPTIONS`/`isAdminAccount` **strictement limités à `UserRole.ADMINISTRATEUR`** : `AdminsListPage` ne liste jamais de compte `SUPERADMINISTRATEUR` (y compris le compte du SuperAdministrateur connecté lui-même), et `AdminCreatePage` ne peut créer qu'un compte `ADMINISTRATEUR` — un SuperAdministrateur ne peut donc pas créer un autre SuperAdministrateur via cette page, conformément à l'intuition du cahier des charges. Cf. §7 point ouvert 1 : une lecture plus large ("tous les comptes à privilège élevé") resterait possible si l'orchestrateur souhaite donner au SuperAdministrateur une visibilité sur les autres comptes SuperAdministrateur, mais ce n'est pas ce que documente le Gherkin actuel.

Conséquence structurelle notable, non un bug à corriger : une fois un compte créé `ADMINISTRATEUR` (ici) ou `ADORATEUR`/`VEILLEUR` (U4), aucune page de l'application ne permet de le faire changer d'univers (`UserForm` de U4 n'offre jamais `ADMINISTRATEUR` comme option, `UserForm` ici n'offre jamais que `ADMINISTRATEUR`) — cohérent avec `Domaine 6`/US-ADMINS-03 ("aucune action 'désactiver' n'est proposée, endpoint inexistant") qui traite ces deux populations comme durablement disjointes.

---

## 3. Stratégie de listage — `hooks/useAdmins.ts`

Même contrainte qu'en U3/U4 : `GET /users` n'expose aucun filtre `role` (limitation déjà documentée en U3 §9 point 1 / U4 §9 point 2). U4 avait retenu, pour sa page liste paginée, un filtrage côté client *après* pagination backend (`useUsers`, U4 §5.1) — au prix d'une anomalie assumée (une page backend de 20 lignes peut afficher moins de 20 lignes après filtrage, `totalPages` non recalculé). Ce plan ne reproduit **pas** ce choix pour `useAdmins` : aucune des sources (Gherkin US-ADMINS-01, `unit-of-work.md`) ne mentionne de filtres de recherche ni de pagination pour `AdminsListPage`, et la population de comptes Administrateur est présumée nettement plus restreinte que la base Adorateur/Veilleur — l'anomalie de pagination de U4 serait ici disproportionnée (une page de 20 lignes non filtrées pourrait ne contenir aucun Administrateur).

Ce plan retient donc le patron de `useVeilleurs` (U3, précédent direct : lecture exhaustive à plat, sans pagination UI, via une unique page backend surdimensionnée) plutôt que celui de `useUsers` (U4) :

```typescript
// apps/admin-app/src/hooks/useAdmins.ts

/** Taille arbitraire, même rationale que VEILLEUR_LOOKUP_PAGE_SIZE (useVeilleurs, U3) :
 *  GET /users n'exposant aucun filtre `role`, cette page unique doit être suffisamment
 *  large pour couvrir l'ensemble des comptes Administrateur avant filtrage côté client. */
const ADMIN_LOOKUP_PAGE_SIZE = 100;

export function useAdmins(): UseQueryResult<UserResponse[]>;
// queryKey: ["users", "admins"]
// queryFn: () => listUsers({ page: 0, size: ADMIN_LOOKUP_PAGE_SIZE })
// select: (page) => page.content.filter((user) => isAdminAccount(user.role))
```

`queryKey` sous le préfixe `["users"]` : couvert par l'invalidation déjà en place dans `useCreateUser`/`useUpdateUser`/`useDeleteUser` (U4, `invalidateQueries({ queryKey: ["users"] })`) — **aucune modification de ces trois hooks n'est nécessaire**, effet de bord bienvenu identique à celui déjà documenté pour `useVeilleurs` en U4 §5.3. Pas de `useAdmin(id)` dédié : contrairement à U4 (`useUser`, nécessaire à `/utilisateurs/:id`), U5 ne nomme aucune page détail — l'édition d'un compte Administrateur se fait directement depuis la ligne de `AdminsListPage` (§5.1), à partir de la donnée déjà chargée par `useAdmins`, sans requête `GET /users/{id}` supplémentaire.

Cf. §7 point ouvert 2 sur la limite intrinsèque de `ADMIN_LOOKUP_PAGE_SIZE` (un compte Administrateur situé au-delà de la 100ᵉ ligne renvoyée par `GET /users`, triée par le backend selon un ordre non documenté, resterait invisible).

---

## 4. Écart justifié — extension de `UserTable.tsx` (U4)

**Constat qui interdit une réutilisation strictement inchangée de `UserTable`** : sa colonne Actions (U4 §6.3) rend, pour chaque ligne, un lien `Link to={"/utilisateurs/" + row.id}` ("Voir") **codé en dur**. Or `/utilisateurs/:id` (`PageDetailUtilisateur`, U4) applique une garde explicite (`isManageableRole`, U4 §4 point 3) qui affiche *"Ce compte n'est pas géré par cette page."* pour tout compte `ADMINISTRATEUR`/`SUPERADMINISTRATEUR` — précisément la population de `AdminsListPage`. Réutiliser `UserTable` sans modification ferait donc de "Voir" un lien systématiquement mort pour chaque ligne de la liste des administrateurs : ce n'est pas une simple limitation cosmétique, c'est une régression fonctionnelle (US-ADMINS-03 exige de pouvoir modifier/supprimer un compte Administrateur, ce que ce lien mort empêcherait d'atteindre par ce chemin).

Ce plan retient une extension **additive et rétrocompatible** plutôt qu'une duplication de `UserTable` (qui romprait la réutilisation explicitement voulue par `unit-of-work.md`, "réutilise `UserTable` de U4") :

```typescript
// apps/admin-app/src/components/users/UserTable.tsx — [MODIFIÉ]
export interface UserTableProps {
  users: UserResponse[];
  isLoading: boolean;
  /** [AJOUTÉ, U5] Quand fourni, remplace entièrement le contenu par défaut de la colonne
   *  Actions (lien "Voir" + ValidationActions) pour chaque ligne. Omis (cas de U4,
   *  PageGestionUtilisateurs), le rendu par défaut reste strictement identique — aucun
   *  changement de comportement pour l'appelant existant. */
  renderRowActions?: (user: UserResponse) => ReactNode;
}

export function UserTable(props: UserTableProps): JSX.Element;
```

Conséquence d'implémentation (non un changement de contrat) : la construction de `columns` doit se déplacer du niveau module vers l'intérieur du composant pour pouvoir fermer sur `renderRowActions` — sans effet observable, `ROLE_LABEL` et la définition des colonnes Email/Nom/Prénoms/Rôle/Statut/Date de création restent inchangées. Rétrocompatibilité stricte : `UserTable.test.tsx` (U4) continue de passer sans modification, un seul cas de test est ajouté pour la nouvelle branche.

`AdminsListPage` (§5.1) fournit `renderRowActions` pour rendre deux `Button size="sm"` ("Modifier" → ouvre la modale d'édition, "Supprimer" → ouvre `ConfirmActionModal`) à la place du lien "Voir". `ValidationActions` n'est donc jamais invoqué pour cette liste — cohérent avec le fait que tout compte Administrateur est créé `VALIDE` d'emblée (US-ADMINS-02, "le compte apparaît VALIDE", même règle que U4 §2 pour tout rôle) : il n'y a structurellement jamais de compte Administrateur `EN_ATTENTE` à valider/rejeter, et `StatutValidationBadge`/`ValidationActions` (U4) n'apportent aucune valeur à cette page — non réutilisés ici, conformément à l'indication de la tâche. La colonne "Statut" de `UserTable` reste néanmoins affichée telle quelle (non paramétrable, U4 ne l'a pas prévu) : elle affichera invariablement le badge "Validé" pour chaque ligne — redondant mais inoffensif, ne justifiant pas une modification supplémentaire de `UserTable`.

---

## 5. Pages — `pages/superadmin/`

Emplacement `pages/superadmin/` repris littéralement de `components.md`/`unit-of-work.md` ("`pages/superadmin/AdminsListPage`, `AdminCreatePage`"), distinct du reste de `pages/` (U0-U4) — seule unité à introduire un sous-dossier de pages, signalant explicitement le caractère SuperAdministrateur-only du module.

### 5.1 `pages/superadmin/AdminsListPage.tsx`

Remplace le `PagePlaceholder title="Administrateurs"` de `router.tsx` sur `/administrateurs`. État local : `editingAdmin: UserResponse | null` (compte en cours d'édition, `null` = modale fermée), `deletingAdmin: UserResponse | null` (idem, suppression). `useAdmins()` (§3), `useUpdateUser()`, `useDeleteUser()` (U4, réutilisés tels quels), `useNavigate()` (`react-router`).

- En-tête : titre "Gestion des administrateurs" + `Button onClick={() => navigate("/administrateurs/nouveau")}` "Ajouter un administrateur" — navigation vers la page dédiée (§5.2), pas d'ouverture de modale (contrairement à `PageGestionUtilisateurs`, U4 §7.1, cf. §6 sur cette asymétrie assumée par `unit-of-work.md` lui-même).
- `adminsQuery.isError` → message "Impossible de charger les administrateurs. Veuillez réessayer plus tard." (même sobriété que `PageGestionUtilisateurs`, U4).
- Sinon : `UserTable` (`users={adminsQuery.data ?? []}`, `isLoading={adminsQuery.isLoading}`, `renderRowActions={(admin) => (...)}` — deux `Button size="sm"` : "Modifier" (`variant="outline"`, `onClick={() => setEditingAdmin(admin)}`) et "Supprimer" (`variant="danger"`, `onClick={() => setDeletingAdmin(admin)}`), §4). Pas de `Pagination` (§3 : `useAdmins` renvoie un tableau à plat, pas un `SpringPage`).
- `editingAdmin && <Modal isOpen title="Modifier l'administrateur" onClose={() => setEditingAdmin(null)}><UserForm mode="edit" roleOptions={ADMIN_ROLE_OPTIONS} defaultValues={{ email: editingAdmin.email, nom: editingAdmin.nom, prenoms: editingAdmin.prenoms, telephone: editingAdmin.telephone, role: editingAdmin.role }} isSubmitting={updateUser.isPending} onSubmit={(dto) => updateUser.mutate({ id: editingAdmin.id, dto }, { onSuccess: () => setEditingAdmin(null) })} onCancel={() => setEditingAdmin(null)} /></Modal>` — modale d'édition inline sur la liste (pas de route dédiée, `unit-of-work.md` n'en nomme aucune pour l'édition, contrairement à la création).
- `<ConfirmActionModal isOpen={deletingAdmin !== null} title="Supprimer l'administrateur" message={deletingAdmin ? \`Voulez-vous vraiment supprimer le compte de ${deletingAdmin.prenoms} ${deletingAdmin.nom} ? Cette action est irréversible.\` : ""} confirmLabel="Supprimer" confirmVariant="danger" isSubmitting={deleteUser.isPending} onConfirm={() => deletingAdmin && deleteUser.mutate(deletingAdmin.id, { onSuccess: () => setDeletingAdmin(null) })} onClose={() => setDeletingAdmin(null)} />` (composant U4 §6.5, réutilisé sans modification, troisième usage après valider/rejeter/supprimer-U4).

### 5.2 `pages/superadmin/AdminCreatePage.tsx`

Remplace le `PagePlaceholder title="Nouvel administrateur"` de `router.tsx` sur `/administrateurs/nouveau`. `useCreateUser()` (U4, réutilisé tel quel), `useNavigate()`.

- Lien "Retour à la liste" (`Link to="/administrateurs"`, même convention que le lien de secours de `PageDetailUtilisateur`, U4 §7.2).
- `<Card title="Nouvel administrateur"><UserForm mode="create" roleOptions={ADMIN_ROLE_OPTIONS} isSubmitting={createUser.isPending} onSubmit={(dto) => createUser.mutate(dto, { onSuccess: () => navigate("/administrateurs") })} onCancel={() => navigate("/administrateurs")} /></Card>`.

**Confirmation de la décision de composition en page dédiée (`unit-of-work.md`)** : `UserForm` (U4 §6.7) a été conçu sans `Modal` interne précisément pour permettre son montage aussi bien dans une modale (U4, création) que dans une page pleine encapsulée par un simple `Card` (ici) — aucune modification de `UserForm` n'est nécessaire pour ce nouvel usage, confirmant l'anticipation actée en U4 §6.7/§9 point ouvert 5. `roleOptions={ADMIN_ROLE_OPTIONS}` ne contenant qu'une entrée (`ADMINISTRATEUR`), le `<Select role>` rendu par `UserForm` n'offre donc qu'un unique choix, déjà pré-sélectionné par défaut (`CreateUserForm`, U4, `defaultValues.role: allowedRoles[0]`) : léger effet de bord UX (un menu déroulant à une seule option, jamais masqué puisque `UserForm` ne prévoit pas ce cas) accepté ici plutôt que de modifier `UserForm` pour un unique appelant — cf. §7 point ouvert 3.

---

## 6. Routage & navigation — aucune garde nouvelle à ajouter

`router.tsx` (U1) porte déjà, pour les deux routes de cette unité, exactement la garde requise :

```typescript
// déjà présent, router.tsx (U1) — [MODIFIÉ] seul le contenu des deux routes change
{ path: "/administrateurs",         element: <ProtectedRoute allowedRoles={[UserRole.SUPERADMINISTRATEUR]}><AdminsListPage /></ProtectedRoute> },
{ path: "/administrateurs/nouveau", element: <ProtectedRoute allowedRoles={[UserRole.SUPERADMINISTRATEUR]}><AdminCreatePage /></ProtectedRoute> },
```

Vérification explicite de suffisance au regard de US-ADMINS-04 : `ProtectedRoute` (U1, cf. code déjà livré) redirige vers `/connexion` si non authentifié, puis vers `/non-autorise` si `role` est absent ou hors de `allowedRoles` — un Administrateur (non Super) authentifié qui accède directement à `/administrateurs` ou `/administrateurs/nouveau` par URL est donc bien redirigé vers `/non-autorise`, conformément au Gherkin. **Aucune garde applicative supplémentaire n'est nécessaire** dans `AdminsListPage`/`AdminCreatePage` (même conclusion que U4 §8 pour ses propres pages) : ni `useAuth()` ni vérification de rôle locale à ajouter.

`Sidebar.tsx` (U1) porte déjà `{role === UserRole.SUPERADMINISTRATEUR && <Link to="/administrateurs">Administrateurs</Link>}` — couvre littéralement la première moitié de US-ADMINS-04 ("le lien … n'apparaît pas dans la navigation" pour un Administrateur non-Super). **Aucune modification de `Sidebar.tsx` n'est nécessaire.**

Seule modification réelle de `router.tsx` : remplacer les deux imports `PagePlaceholder` par `AdminsListPage`/`AdminCreatePage` (`./pages/superadmin/AdminsListPage`, `./pages/superadmin/AdminCreatePage`) dans les deux routes ci-dessus — les routes elles-mêmes (chemin, position dans l'arbre, `allowedRoles`) ne changent pas.

Pas de `skipForbiddenRedirect` supplémentaire à introduire : les mutations utilisées (`useUpdateUser`/`useDeleteUser`/`useCreateUser`) l'ont déjà, U4 §3, sur `updateUser`/`deleteUser`/`createUser` — inchangé, réutilisé tel quel.

---

## 7. Points ouverts pour l'orchestrateur

1. **Portée exacte du rôle géré par `AdminsListPage`/`AdminCreatePage` — `ADMINISTRATEUR` seul, pas `SUPERADMINISTRATEUR`** (§2) : ce plan suit littéralement le Gherkin US-ADMINS-01 ("comptes de rôle ADMINISTRATEUR") et la formulation singulière de `unit-of-work.md`/`components.md` ("`role=ADMINISTRATEUR`"). Une lecture alternative — donner au SuperAdministrateur une vue/gestion des autres comptes `SUPERADMINISTRATEUR` — n'est étayée par aucun critère Gherkin actuel et n'est donc pas retenue ici. À confirmer si le besoin métier réel dépasse le texte des récits.
2. **Plafond `ADMIN_LOOKUP_PAGE_SIZE = 100` (`useAdmins`, §3)** : même famille de limitation que `useVeilleurs` (U3, non résolue) — un compte Administrateur situé au-delà de la première tranche de 100 utilisateurs renvoyée par `GET /users` (ordre de tri non documenté par le swagger) resterait invisible dans `AdminsListPage`. Jugé improbable à court terme (équipe d'administration réduite) mais non garanti ; une évolution du swagger (filtre `role` sur `GET /users`) résoudrait ce point pour U3/U4/U5 simultanément.
3. **`UserForm` en mode `create` avec une unique `roleOption`** (§5.2) : le `<Select role>` affiche un menu déroulant à un seul choix déjà présélectionné — fonctionnellement correct (empêche toute création d'un rôle autre qu'`ADMINISTRATEUR`) mais légèrement surprenant en ergonomie. Non corrigé ici pour éviter de modifier `UserForm` (U4) pour un unique appelant à un seul choix ; à reconsidérer si un troisième contexte à option unique apparaît.
4. **Édition en modale inline (`AdminsListPage`) vs page dédiée (`AdminCreatePage`)** : asymétrie assumée, dictée par `unit-of-work.md` qui ne nomme qu'`AdminsListPage`/`AdminCreatePage` (aucune page d'édition/détail pour cette unité). Si l'orchestrateur préfère une page `/administrateurs/:id` dédiée à l'édition (symétrique à `PageDetailUtilisateur`, U4), `UserForm`/`ConfirmActionModal` s'y prêteraient sans modification supplémentaire — seul le choix de composition de `AdminsListPage` serait à revoir.
5. **Absence de confirmation serveur d'une règle "un compte `ADMINISTRATEUR` ne peut être créé/modifié que par un `SUPERADMINISTRATEUR`"** : comme pour la restriction symétrique de U4 (§9 point ouvert 1, "pas d'action sur un compte admin" côté U4), ce plan traite la restriction comme purement UI (garde de route + absence d'option de rôle) sans confirmation que le backend appliquerait la même règle si l'API était appelée directement hors UI. À confirmer avec l'équipe backend, idéalement dans le même échange que le point ouvert équivalent de U4.
