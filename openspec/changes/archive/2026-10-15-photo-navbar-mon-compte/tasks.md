# Tasks — photo-navbar-mon-compte

## 1. Conception détaillée (api-architect)
- [x] 1.1 Trancher la forme exacte de la garde réseau pour `useUserPhoto` (user-app) dans ce
      nouveau contexte (`UserResponse.photo` porte un indicateur de présence, contrairement à
      `PlanningEntryResponse`) : paramètre optionnel ajouté au hook existant (sans casser les
      appelants agenda déjà en place, cf. `detail-reservation-veilleur`) vs. autre mécanisme.
      → Décision : `hasPhoto = true` (défaut), `enabled: hasPhoto`. Voir `design.md` §1.
- [x] 1.2 Confirmer la taille/le style de la miniature dans `AuthNav.tsx` (cohérence avec les
      miniatures déjà existantes — fiche admin ~96px, modales agenda — adaptée à un contexte de
      navbar, donc plus petite) et son positionnement exact par rapport au lien texte « Mon
      compte » (avant/après, espacement).
      → Décision : 32px (`h-8 w-8`), dans le `<Link>`, avant le texte, `gap-2`. Voir `design.md` §2.

## 2. Implémentation (api-developer)
- [x] 2.1 `apps/user-app/src/hooks/useUserPhoto.ts` : paramètre optionnel `hasPhoto = true`,
      `enabled: hasPhoto`
- [x] 2.2 `apps/user-app/src/components/layout/AuthNav.tsx` : hook appelé avant
      `if (!isAuthenticated)`, miniature circulaire 32px conditionnelle (`Boolean(user?.photo)`)
      dans le `<Link to="/mon-compte">`, avant le texte, `alt=""`

## 3. Tests (test-engineer)
- [x] 3.1 `useUserPhoto` (user-app) : non-régression sur les deux appelants agenda existants
      (`ReservationConfirmModal.tsx`, `ReservationDetailModal.tsx`, inchangés) + nouveau cas
      `hasPhoto = false` (aucun appel réseau, `enabled: false`)
- [x] 3.2 `AuthNav` : photo affichée pour un utilisateur avec photo, absente sans photo/non
      connecté (non-régression), aucun appel réseau si pas de photo à récupérer, dégradation
      silencieuse si la récupération échoue (403/404/réseau) — correctifs collatéraux
      `Navbar.test.tsx`/`PublicLayout.test.tsx` (même cause racine : `QueryClientProvider`
      manquant depuis que `AuthNav` appelle `useQuery`)

## 4. Bruno (bruno-developer)
- [x] 4.1 N/A — aucun nouvel endpoint backend créé dans ce repo (`GET /users/{id}/photo` déjà
      existant et déjà couvert)

## 5. Revue (code-reviewer)
- [x] 5.1 Revue correction/sécurité/conventions sur l'ensemble des fichiers listés dans
      `proposal.md` — 0 bloquant, 0 important, 1 mineur (dette de lisibilité sur le défaut
      `hasPhoto = true`, aucune action requise). Tous les points de vigilance demandés
      (non-régression agenda, règles des Hooks, dégradation silencieuse, `alt=""`, révocation
      URL objet) vérifiés conformes.

## 6. Graduation
- [x] 6.1 Mettre à jour `openspec/specs/gestion-utilisateurs/spec.md` (nouvel emplacement
      d'affichage de la photo : navbar `AuthNav`)
- [x] 6.2 Archiver vers `openspec/changes/archive/2026-10-15-photo-navbar-mon-compte/`
