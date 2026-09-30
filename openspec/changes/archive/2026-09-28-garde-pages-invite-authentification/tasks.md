# Tasks — garde-pages-invite-authentification

## 1. Composant GuestRoute
- [ ] 1.1 Créer `apps/user-app/src/components/auth/GuestRoute.tsx` (basé sur `useAuth` +
      `resolvePostLoginRedirect`, même structure que `ProtectedRoute.tsx`)
- [ ] 1.2 Créer `apps/admin-app/src/components/auth/GuestRoute.tsx` (idem)
- [ ] 1.3 Tests unitaires `GuestRoute.test.tsx` (deux apps) : non hydraté → spinner ; authentifié
      rôle autorisé → redirection `/` ; authentifié rôle non autorisé → redirection
      `/non-autorise` ; non authentifié → rendu des enfants

## 2. Câblage routeur
- [ ] 2.1 `apps/user-app/src/router.tsx` : envelopper `/connexion`, `/inscription` et
      `/inscription/confirmation` avec `GuestRoute`
- [ ] 2.2 `apps/admin-app/src/router.tsx` : envelopper `/connexion` avec `GuestRoute`
- [ ] 2.3 Mettre à jour `router.test.tsx` des deux apps pour couvrir la redirection d'un
      utilisateur déjà authentifié depuis `/connexion` (et `/inscription`,
      `/inscription/confirmation` pour user-app)

## 3. Revue
- [ ] 3.1 Revue de code (`code-reviewer`)
