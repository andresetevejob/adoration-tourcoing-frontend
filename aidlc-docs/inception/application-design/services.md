# Services — couche d'orchestration

Il n'y a pas de "couche service" séparée au sens backend : l'orchestration côté frontend est portée par les **hooks métier** (`hooks/useXxx.ts`), qui appellent les **modules d'endpoints** (`api/endpoints/*.ts`), eux-mêmes construits sur `SharedApiClient`. Ce document décrit les flux d'orchestration transverses.

## Service : Authentification & session

**Composants impliqués** : `LoginForm`/`RegisterForm` → `useAuth` → `api/endpoints/auth.ts` → `SharedApiClient` → `authStore`

```
1. L'utilisateur soumet LoginForm (email, password), validé par loginSchema (Zod)
2. useAuth.login() appelle auth.ts#login(dto) -> apiClient.post("/auth/login", dto, { skipAuthRetry: true })
3. Succès (200) -> authStore.setUser(response.user) -> redirection selon rôle et application
4. Échec (401) -> ApiError remontée telle quelle au formulaire (message générique, PAS de refresh/retry, cf. NFR sécurité)
```

**Rafraîchissement de session (hors /auth/*)** :
```
1. Un appel API quelconque reçoit 401
2. SharedApiClient appelle POST /auth/refresh
3. Succès -> la requête d'origine est rejouée une fois
4. Échec -> authStore.clear() -> redirection /connexion
```

## Service : Gestion centralisée des erreurs

**Composants impliqués** : `SharedApiClient` → intercepteur d'erreur → service de notification (`Toast`, `packages/shared/ui`)

```
1. Toute réponse !response.ok lève une ApiError { code, message, status }
2. Un hook global (ex. QueryClient onError / mutation onError) capture l'ApiError et déclenche un Toast
3. 401 (hors /auth/*) -> flux de rafraîchissement (voir ci-dessus)
4. 403 -> redirection /non-autorise
5. Les erreurs de validation métier (409 chevauchement, 422 délai d'annulation dépassé, etc.) sont affichées via Toast sans redirection
```

## Service : Consultation & anonymisation du planning

**Composants impliqués** : `CalendrierReservations`/`CalendrierPlanningAdmin` → `usePlanning` → `api/endpoints/planning.ts`

```
1. Le composant calendrier appelle usePlanning({ date, page, size })
2. Le backend renvoie PlanningEntryResponse[] avec estAnonymise déjà calculé selon l'utilisateur courant
3. Le composant n'applique aucune logique d'anonymisation : il affiche l'identité si estAnonymise=false, sinon "Créneau réservé"
4. Les entrées dont idUtilisateur === user.id (Veilleur connecté) sont mises en évidence "Ma réservation"
```

## Service : Réservation / Annulation

**Composants impliqués** : `ReservationForm`/`ReservationConfirmModal` → `useCreateBooking`/`useCancelBooking` → `api/endpoints/bookings.ts`

```
1. Sélection d'une plage libre -> ouverture de ReservationConfirmModal (récapitulatif)
2. Confirmation -> useCreateBooking.mutate(dto) -> POST /bookings
3. Succès -> invalidation des queryKeys ["planning"], ["bookings"] -> le calendrier se met à jour
4. Annulation -> ReservationConfirmModal -> useCancelBooking.mutate(id) -> DELETE /bookings/{id} -> invalidation identique
```

## Service : Validation / rejet de compte (admin-app)

**Composants impliqués** : `ValidationActions` → `useValiderUser`/`useRejeterUser` → `api/endpoints/users.ts`

```
1. Clic sur "Valider"/"Rejeter" -> modal de confirmation
2. Confirmation -> POST /users/{id}/valider ou /rejeter
3. Succès -> mise à jour optimiste de la ligne (UserResponse renvoyé) + invalidation queryKey ["users"]
```

## Service : Annonces & Contact (mocks MSW)

**Composants impliqués** : `useAnnonces`/`sendContactMessage` → handlers MSW (`packages/shared` ou app-local, à trancher en Conception fonctionnelle de l'unité correspondante)

```
Même contrat d'interface que les futurs endpoints réels (mêmes types de requête/réponse déjà définis dans SharedContracts),
afin que le rebranchement sur le backend réel ne nécessite qu'un changement de handler MSW -> appel HTTP réel,
sans modification des hooks ni des composants consommateurs.
```
