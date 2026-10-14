# Proposition — detail-reservation-veilleur

## Contexte

Demande utilisateur initiale : « L'affichage des réservations dans l'espace Veilleur est très
mauvais. Il faudrait un fond bleu qui encadre le créneau dans l'agenda. Le nom du bénéficiaire doit
être affiché dans la modale, lorsqu'on souhaite voir le détail de la réservation, ainsi que sa
photo. »

Clarifications obtenues (format [Réponse]:) :

- [Réponse]: Pas de bleu — le problème signalé concerne les vues **Jour et/ou Semaine** de
  `/agenda` : en dehors de « Ma réservation », les réservations des autres Veilleurs n'ont
  aujourd'hui aucun cadre visuel (comportement **documenté**, cf. `consultation-planning/spec.md`,
  "Hors périmètre" de la section Mode Semaine). L'utilisateur souhaite un fond d'agenda blanc
  (normal) et un cadre doré sur les créneaux — pas un bug de rendu, une **extension volontaire** du
  cadre doré déjà existant (actuellement limité à "Ma réservation" partout + "tous les créneaux" en
  vue Mois uniquement) aux vues Jour et Semaine, pour tous les créneaux.
- [Réponse]: Le nom + la photo du bénéficiaire doivent être visibles pour **n'importe quelle**
  réservation cliquée, y compris celle d'un autre Veilleur — pas seulement les réservations du
  Veilleur connecté. Ceci est un changement de comportement (actuellement, cliquer sur la
  réservation d'un autre Veilleur ne déclenche rien, cf. `apps/user-app/src/pages/PageAgenda.tsx`,
  `onEventClick`), pas une simple évolution visuelle.

Aucun conflit détecté avec les changes ouvertes existantes (`planning-mois-surlignage-creneaux`,
`reservation-adoration`, `inscription-photo-veilleur`) : cette proposition étend des règles déjà
posées par ces travaux (surlignage CSS scopé par vue, photo Veilleur accessible via
`GET /users/{id}/photo`) sans les contredire. Elle réalise d'ailleurs explicitement le point laissé
« à traiter séparément plus tard » dans `inscription-photo-veilleur/proposal.md` (affichage de la
photo d'un Veilleur, jusqu'ici fait uniquement côté admin-app sur la fiche utilisateur).

## Why

Deux lacunes dans `/agenda` (user-app, rôle Veilleur) :

1. **Lisibilité** : en vue Jour/Semaine, seule "Ma réservation" est mise en évidence visuellement ;
   les réservations des autres Veilleurs sont quasiment invisibles dans la grille (rendu par défaut
   de FullCalendar, non stylé), rendant difficile de voir d'un coup d'œil la densité de
   réservations — ce que la vue Mois permet déjà.
2. **Identification** : un Veilleur qui voit un créneau réservé par un collègue ne peut aujourd'hui
   obtenir aucune information sur qui tient ce créneau (clic sans effet). Pouvoir consulter le nom
   et la photo du bénéficiaire aide à se reconnaître entre Veilleurs (contexte chapelle : les
   Veilleurs se croisent et veulent identifier qui est de garde à quel moment).

## What Changes

### 1. `consultation-planning` — cadre doré étendu aux vues Jour/Semaine (user-app)

- `packages/shared/src/ui/fullcalendar-overrides.css` : la règle aujourd'hui scopée à
  `.fc-dayGridMonth-view .fc-event` (tous les créneaux encadrés en gold en vue Mois) est étendue
  pour s'appliquer aussi en vue Jour (`.fc-timeGridDay-view`) et Semaine, desktop et mobile
  (`.fc-timeGridWeek-view`, `.fc-listWeek-view`) — **uniquement côté user-app** (admin-app n'est pas
  concerné par cette demande, qui porte explicitement sur « l'espace Veilleur »).
- Le badge/texte "Ma réservation" reste inchangé (seul signal qui distingue encore une réservation
  personnelle dans ces vues, la couleur de cadre devenant commune à tous les créneaux).
- Pas de changement en vue Mois (déjà conforme) ni côté admin-app.

### 2. `reservation-adoration` — modale de détail accessible pour toute réservation (user-app)

- `onEventClick` (`PageAgenda.tsx`) : déclenché désormais pour **toute** réservation visible par un
  Veilleur (plus seulement `isMine`), pas seulement les siennes.
- Nouveau composant `ReservationDetailModal` (lecture seule, sans action) utilisé quand la
  réservation cliquée n'est **pas** la sienne : affiche dates, bénéficiaire (nom complet — déjà
  présent dans `PlanningEntryResponse.nomUtilisateur`/`prenomsUtilisateur`, l'anonymisation du
  **titre affiché sur le calendrier** n'est pas modifiée, seul le contenu de cette modale de détail
  révèle le nom), description, et sa photo (nouveau, voir point 3).
- `ReservationConfirmModal` (variant `cancel`, déjà affiché quand la réservation cliquée est la
  sienne) : complété pour afficher aussi la photo du bénéficiaire (soi-même) en plus du nom déjà
  affiché aujourd'hui — pas de nouveau composant, `ReservationCard` est étendu avec une prop photo
  optionnelle, réutilisée par les deux modales.

### 3. Affichage de la photo côté user-app (nouveau, symétrique à l'admin-app)

- `apps/user-app/src/api/endpoints/users.ts` : ajout de `getUserPhoto(id)` (`GET
  /users/{id}/photo`, via `apiClient.getBlob`), identique à l'implémentation déjà existante côté
  admin-app (`apps/admin-app/src/api/endpoints/users.ts`).
- `apps/user-app/src/hooks/useUserPhoto.ts` (nouveau) : même implémentation que
  `apps/admin-app/src/hooks/useUserPhoto.ts` (cache du `Blob`, URL objet créée/révoquée en
  `useEffect`, cf. `openspec/specs/gestion-utilisateurs/spec.md`).
- **Dégradation silencieuse** si la photo est inaccessible (404 — pas de photo, 403 — non autorisé,
  réseau) : aucun message d'erreur, le bloc photo est simplement absent, même principe que
  l'affichage existant côté admin-app. Comme `PlanningEntryResponse` ne porte pas d'indicateur
  `hasPhoto` (à la différence de `UserResponse.photo`), l'appel est tenté systématiquement pour
  toute réservation affichée dans une modale (son coût réseau est négligeable, une requête par
  ouverture de modale, jamais en liste).

## Point de vigilance backend (bloquant potentiel, à vérifier avant de considérer la fonctionnalité complète)

`GET /users/{id}/photo` est documenté (`openspec/specs/gestion-utilisateurs/spec.md`) comme
accessible seulement au **titulaire ou à un administrateur**. Un Veilleur consultant la photo
**d'un autre Veilleur** correspond à aucun des deux cas : si cette autorisation backend est
appliquée strictement, l'appel renverra 403 et, du fait de la dégradation silencieuse ci-dessus, la
photo n'apparaîtra simplement jamais pour les réservations des autres — seul le nom sera visible
dans la pratique. **Vérification nécessaire côté backend avant/pendant l'implémentation** : soit
l'autorisation doit être étendue (ex. tout utilisateur authentifié peut consulter la photo d'un
Veilleur, donnée déjà non sensible car affichée publiquement sur le profil Veilleur), soit la
fonctionnalité "photo du bénéficiaire" devra être limitée en pratique à ses propres réservations
(le nom resterait affiché pour tous, conformément à la demande, la photo seulement pour soi-même).
Cette proposition implémente le code en assumant l'évolution backend nécessaire ; si elle n'est pas
confirmée avant la fin de la Construction, le point sera documenté comme limitation connue lors de
la graduation plutôt que de bloquer l'ensemble de la fonctionnalité (nom + cadre visuel restent
livrés dans tous les cas).

## Impact

- Affected specs :
  - `consultation-planning` (section "Surlignage de tous les créneaux réservés en vue Mois" →
    renommée/étendue pour couvrir aussi Jour/Semaine côté user-app).
  - `reservation-adoration` (nouvelle section : modale de détail d'une réservation, accessible à
    tout créneau visible par un Veilleur).
  - `gestion-utilisateurs` (section "Affichage de la photo d'un Veilleur" étendue : jusqu'ici
    documentée seulement pour la fiche admin, désormais aussi pour la modale de détail côté
    user-app).
- Affected code :
  - `packages/shared/src/ui/fullcalendar-overrides.css`
  - `apps/user-app/src/components/agenda/ReservationCard.tsx` (+ test) : prop photo optionnelle
  - `apps/user-app/src/components/agenda/ReservationConfirmModal.tsx` (+ test) : passe la photo
  - `apps/user-app/src/components/agenda/ReservationDetailModal.tsx` (nouveau, + test)
  - `apps/user-app/src/pages/PageAgenda.tsx` (+ test) : `onEventClick` élargi, nouvel état modal
    détail
  - `apps/user-app/src/api/endpoints/users.ts` (+ test) : `getUserPhoto`
  - `apps/user-app/src/hooks/useUserPhoto.ts` (nouveau, + test)
- Pas de breaking change d'API ; pas de nouvel appel réseau en liste (uniquement à l'ouverture d'une
  modale) ; pas de changement pour `admin-app`.

## Questions de clarification restantes

Aucune — les deux points d'ambiguïté initiaux (portée de la couleur, portée de l'identité révélée)
ont été tranchés via les réponses ci-dessus. Le seul point ouvert est le risque d'autorisation
backend documenté plus haut, qui n'empêche pas de démarrer la Construction (comportement de
dégradation déjà prévu).
