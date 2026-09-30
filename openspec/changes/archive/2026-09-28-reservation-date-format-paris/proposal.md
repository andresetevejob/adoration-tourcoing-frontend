# Proposition — reservation-date-format-paris

## Why
À la création d'une réservation, `PageAgenda.tsx` (user-app) et `PagePlanning.tsx` (admin-app)
construisent `CreateBookingRequest.dateDebut`/`dateFin` via `info.start.toISOString()` /
`info.end.toISOString()` — un format UTC (suffixe `Z`). C'était une décision de conception
délibérée et documentée (`aidlc-docs/construction/plans/u3-reservation-annulation-design.md`,
§"Format de date transmis à l'API" : *"un format UTC non ambigu est de toute façon le bon choix
pour un DTO envoyé au backend"*), pas un bug — le comportement actuel correspond à ce qui a été
sciemment implémenté et testé (`PageAgenda.test.tsx`, `PagePlanning.test.tsx` assertent le
suffixe `.000Z`).

La demande actuelle revient sur ce choix : soumettre la date dans un format Europe/Paris,
reflétant l'heure d'hiver (CET, UTC+1) ou d'été (CEST, UTC+2) selon la date du créneau — plutôt
que de toujours normaliser en UTC. Aucune spec vivante n'existe encore pour la capacité
`reservation-adoration` (non graduée dans `openspec/specs/`) : le code actuel en tient lieu de
spec implicite, d'où la nécessité d'une proposition pour documenter le changement plutôt que de
corriger silencieusement.

## What Changes
- Nouvelle fonction utilitaire partagée `toParisISOString(date: Date): string` dans
  `packages/shared/src/utils/formatters.ts` : retourne une chaîne ISO 8601 complète
  (`yyyy-MM-ddTHH:mm:ss±HH:mm`) exprimée en heure locale Europe/Paris, avec l'offset correct
  selon la saison (`+01:00` en hiver CET, `+02:00` en été CEST, bascules calculées dynamiquement,
  pas codées en dur).
- `apps/user-app/src/pages/PageAgenda.tsx` (`onSelectSlot`) et
  `apps/admin-app/src/pages/PagePlanning.tsx` (`onSelectSlot`) : remplacent
  `info.start.toISOString()` / `info.end.toISOString()` par
  `toParisISOString(info.start)` / `toParisISOString(info.end)` pour peupler `selectedSlot`,
  qui alimente ensuite `CreateBookingRequest.dateDebut`/`dateFin`.
- Mise à jour des tests concernés (`PageAgenda.test.tsx`, `PagePlanning.test.tsx`,
  nouveaux tests unitaires pour `toParisISOString` couvrant un cas hiver et un cas été) pour
  attendre le nouveau format au lieu du suffixe `.000Z`.
- **Hors périmètre** : `formatDate`/`formatDateTime`/`formatTime`/`toISODateString` (affichage et
  paramètres `GET /planning?date=`) ne changent pas — seul le DTO de création de réservation est
  concerné. Les dates renvoyées par le backend (`BookingResponse.dateDebut/dateFin`,
  `canCancelBooking`) ne changent pas non plus : elles restent interprétées telles que reçues.

## Impact
- Affected capability : `reservation-adoration` (change ouverte, non graduée — aucun
  `openspec/specs/reservation-adoration/spec.md` à patcher pour l'instant).
- Affected code : `packages/shared/src/utils/formatters.ts`,
  `apps/user-app/src/pages/PageAgenda.tsx`, `apps/admin-app/src/pages/PagePlanning.tsx`,
  tests associés.
- Contrat API : le format de `dateDebut`/`dateFin` envoyé à `POST /bookings` change (offset
  `+01:00`/`+02:00` au lieu de `Z`) — les deux formats désignent le même instant, mais si le
  backend valide strictement le suffixe `Z` (`z.string().datetime()` côté client existe mais
  n'est pas appelé, cf. `u3-reservation-annulation-design.md` §1), il faut vérifier côté backend
  qu'un offset non-`Z` est accepté avant de livrer ce changement.
