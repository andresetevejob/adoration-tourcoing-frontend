# Spec — reservation-adoration (format de date à la création)

> Périmètre gradué : uniquement le format de date soumis au backend à la création d'une
> réservation (`CreateBookingRequest.dateDebut`/`dateFin`). Le reste de la capacité
> reservation-adoration (règles de délai d'annulation, permissions par rôle, réservation pour un
> Veilleur par un Administrateur, etc.) n'est pas encore documenté ici — voir
> `openspec/changes/reservation-adoration/` (change ouverte) et
> `aidlc-docs/construction/plans/u3-reservation-annulation-design.md` pour le reste du
> comportement déjà implémenté.

## Format de date à la création d'une réservation

WHEN un utilisateur sélectionne un créneau sur le calendrier (`PageAgenda.tsx` côté user-app,
`PagePlanning.tsx` côté admin-app) THEN les dates transmises dans
`CreateBookingRequest.dateDebut`/`dateFin` DOIVENT être au format ISO 8601 complet exprimé en
heure locale Europe/Paris, avec l'offset UTC réel de l'instant concerné :
- `+01:00` (CET) en heure d'hiver
- `+02:00` (CEST) en heure d'été

Exemple : `2026-06-01T12:00:00+02:00` (pas `2026-06-01T10:00:00.000Z`).

L'offset est calculé dynamiquement pour chaque date (jamais codé en dur) — les bascules DST
(dernier dimanche de mars / dernier dimanche d'octobre) ne tombent pas à date fixe d'une année
sur l'autre. Implémentation : `toParisISOString(date: Date): string`
(`packages/shared/src/utils/formatters.ts`), utilisée par les deux apps.

WHY : décision initiale (U3, voir `u3-reservation-annulation-design.md`) : format UTC
(`Date.prototype.toISOString()`, suffixe `Z`) pour un DTO envoyé au backend. Revenue sur ce choix
pour représenter explicitement l'heure locale Europe/Paris (métier basé sur un lieu unique, pas
d'utilisateurs multi-fuseaux) plutôt que de forcer une normalisation UTC côté client.

### Dérivation de l'offset — comportement attendu

`getParisOffset` (fonction interne à `formatters.ts`) dérive l'offset via
`Intl.DateTimeFormat({ timeZone: "Europe/Paris", timeZoneName: "shortOffset" })` et lève une
erreur explicite (`throw`) si le format retourné ne correspond pas au motif `GMT±H[:MM]` attendu,
plutôt que de retomber silencieusement sur `+00:00` — un offset par défaut serait toujours faux
pour Europe/Paris et enverrait une date de réservation erronée au backend sans erreur visible.

### Hors périmètre de cette section

- `formatDate`/`formatDateTime`/`formatTime`/`toISODateString` (affichage utilisateur et
  paramètre `GET /planning?date=`) : inchangés, toujours au format qui leur est propre.
- Les dates renvoyées par le backend (`BookingResponse.dateDebut`/`dateFin`, utilisées entre
  autres par `canCancelBooking`) : interprétées telles que reçues, aucun changement de ce côté.
- `bookingSchema` (`packages/shared/src/utils/validators.ts`) : non appelé par le flux de
  réservation actuel (schéma local à `ReservationForm` utilisé à la place). Son
  `dateDebut`/`dateFin: z.string().datetime()` (sans `offset: true`) rejetterait le format décrit
  ci-dessus s'il était un jour réutilisé pour valider ce DTO — point de vigilance pour toute
  évolution future de ce schéma.

### Point de vigilance backend

Le contrat `POST /bookings` doit accepter un `dateDebut`/`dateFin` avec un offset non-`Z`
(`+01:00`/`+02:00`) — vérification à faire côté backend avant déploiement (hors périmètre de ce
repo frontend).

## Durée maximale d'un créneau (24h)

Un créneau d'adoration ne peut excéder 24 heures (`dateFin - dateDebut ≤ 24h`, borne incluse).

WHEN un utilisateur sélectionne une plage sur le calendrier (`CalendrierReservations.tsx` côté
user-app, `CalendrierPlanningAdmin.tsx` côté admin-app) dont la durée dépasse 24h (notamment en vue
`dayGrid` mois/intervalle, par glisser-déposer sur plusieurs jours) THEN la sélection est rejetée
(`selectAllow`) : aucun formulaire de réservation ne s'ouvre, identique au rejet déjà appliqué pour
une sélection dans le passé.

WHEN, par un autre chemin que le drag-select du calendrier, un `slot` de plus de 24h parvient malgré
tout jusqu'à `ReservationConfirmModal` (variant "create" uniquement — le variant "cancel", délai
d'annulation ≥24h, n'est pas concerné) THEN la confirmation est bloquée et un message d'erreur est
affiché (filet de sécurité, même logique défensive que la vérification du délai d'annulation ≥24h).

WHY : aucune règle de durée maximale n'existe dans le swagger (`CreateBookingRequest` ne la porte
pas) ; c'est une règle métier frontend pure, en attente de confirmation/alignement côté backend.

### Implémentation
`exceedsMaxDuration(dateDebut, dateFin, maxHeures = 24): boolean`
(`packages/shared/src/utils/formatters.ts`), utilisée par les deux points de vérification ci-dessus
dans les deux applications.
