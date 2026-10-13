# Design — affichage-mobile-menu-agenda

Conception détaillée (HOW) des deux chantiers décrits dans `proposal.md`/`tasks.md`. Stack : React 19
+ Vite + Tailwind v4 + FullCalendar 6.1.21 + TanStack Query, `apps/user-app` uniquement.

Fichiers lus pour cette conception : `Navbar.tsx`, `AuthNav.tsx`, `Navbar.test.tsx`,
`AuthNav.test.tsx`, `PublicLayout.tsx`, `packages/shared/src/ui/Modal.tsx`, `Card.tsx`, `Badge.tsx`,
`CalendrierReservations.tsx` (+ test), `renderPlanningEvent.tsx` (+ test), `planningEntries.ts`,
`planningPeriode.ts`, `PageAgenda.tsx`, `FiltreDatePlanning.tsx`, `usePlanning.ts`,
`packages/shared/src/utils/formatters.ts`, `apps/user-app/vitest.setup.ts`/`vitest.config.ts`.

> Note de contexte : le répertoire de travail contient déjà des modifications non commitées liées à
> une autre proposition (`openspec/changes/agenda-planning-vue-semaine/`, mode "Semaine" via
> `getPlanningIntervalle`). Cette conception part de l'état actuel des fichiers (déjà modifié par ce
> chantier parallèle) et ne revient pas sur ce qui n'est pas listé dans `proposal.md`.

---

## 1. Drawer mobile — `Navbar.tsx`

### 1.1 Structure de fichiers

| Fichier | Statut |
|---|---|
| `apps/user-app/src/components/layout/Navbar.tsx` | modifié |
| `apps/user-app/src/components/layout/MobileDrawer.tsx` | **nouveau** |
| `apps/user-app/src/components/layout/MobileDrawer.test.tsx` | **nouveau** |
| `apps/user-app/src/components/layout/Navbar.test.tsx` | modifié (nouveaux cas, scoping `within`) |
| `apps/user-app/src/components/layout/AuthNav.tsx` | **inchangé** (réutilisé tel quel) |

**Décision : composant séparé `MobileDrawer.tsx`**, pas de logique fusionnée dans `Navbar.tsx`.
Raison : `MobileDrawer` est une coquille générique (overlay + panneau coulissant + fermeture
ESC/overlay/lien), sans connaissance de `SITE_LINKS`/`AuthNav` — `Navbar` lui fournit son contenu en
`children`. Cela le rend testable isolément (ouverture/fermeture/ARIA) sans dépendre du contenu
métier, et plus proche du style "coquille réutilisable" déjà illustré par `Modal` dans
`packages/shared`. Il reste dans `apps/user-app` (pas dans `packages/shared`) : le périmètre de la
proposition exclut explicitement tout changement dans `packages/shared`, et ce composant n'a pas de
vocation transverse `admin-app`/`user-app` identifiée pour l'instant.

### 1.2 `MobileDrawer.tsx` — signature

```ts
export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;            // id DOM du panneau — fourni par Navbar, référencé par aria-controls
  label: string;          // aria-label du dialog, ex. "Menu"
  children: ReactNode;    // contenu empilé verticalement (SITE_LINKS + AuthNav)
}

export function MobileDrawer({ isOpen, onClose, id, label, children }: MobileDrawerProps): ReactNode | null
```

Comportement interne :

- **Montage conditionnel** (`if (!isOpen) return null;`), comme `Modal` — pas de deux copies des
  liens simultanément dans le DOM par défaut (cf. §1.5 sur l'impact test). Conséquence acceptée :
  **pas d'animation de sortie** (fermeture instantanée, exactement comme `Modal` aujourd'hui qui n'a
  lui-même aucune transition de fermeture) — cohérence délibérée avec le composant existant plutôt
  qu'une sur-ingénierie (pas de `setTimeout`/`onTransitionEnd` pour retarder l'unmount).
- **Animation d'entrée** (slide depuis la droite) via le pattern "mount puis bascule de classe au
  frame suivant" (nécessaire car un composant qui monte déjà dans son état final ne déclenche aucune
  transition CSS) :
  ```ts
  const [isEntered, setIsEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => { setIsEntered(true); });
    return () => { cancelAnimationFrame(raf); setIsEntered(false); };
  }, []); // ce composant est démonté/remonté à chaque isOpen, cf. montage conditionnel ci-dessus
  ```
  Panneau : `className` de base
  `"fixed inset-y-0 right-0 z-10 flex w-72 max-w-[85vw] flex-col gap-6 bg-white p-6 shadow-xl transition-transform duration-300"`,
  plus `isEntered ? "translate-x-0" : "translate-x-full"`.
- **Overlay** : `<div className="fixed inset-0 z-50 md:hidden">` englobant, avec à l'intérieur
  `<div className="absolute inset-0 bg-night-950/60" onClick={onClose} aria-hidden="true" />` — même
  teinte que `Modal` (cf. lecture de `Modal.tsx`). `md:hidden` sur le conteneur racine : filet de
  sécurité CSS pur, en plus du fait que `Navbar` ne met `isOpen` à `true` qu'en dessous de 768px côté
  logique (le bouton hamburger lui-même est `md:hidden`, donc `isOpen` ne peut structurellement
  devenir vrai qu'en contexte mobile) — pas de dépendance à `useIsMobileViewport()` ici, uniquement
  du CSS responsive (cf. §1.4, pas de hook JS nécessaire côté Navbar).
- **Panneau** : `role="dialog" aria-modal="true" aria-label={label} id={id}`.
- **Fermeture Échap** : `useEffect` sur `isOpen`, écoute `keydown` sur `document`, ferme si
  `event.key === "Escape"`, nettoyage au démontage/changement de `isOpen`.
- **Fermeture au clic sur un lien** : délégation d'événement sur le conteneur de `children`, sans
  modifier `AuthNav`/`Link` :
  ```ts
  function handleContentClick(event: React.MouseEvent<HTMLDivElement>): void {
    if (event.target instanceof Element && event.target.closest("a")) {
      onClose();
    }
  }
  ```
  Placé sur le `<div onClick={handleContentClick}>` qui wrappe `children`. Ne se déclenche que sur un
  `<a>` (les `Link` de `SITE_LINKS` et d'`AuthNav`), pas sur le bouton "Déconnexion" d'`AuthNav` —
  cohérent avec l'énoncé de la proposition ("clic sur un lien du drawer" = fermeture, qui ne mentionne
  pas le bouton Déconnexion). Ce choix garantit que `AuthNav` est réutilisé **sans aucune
  modification**, condition explicite de la proposition ("le contenu actuel d'`AuthNav`").
- **Focus (minimal, pas de trap complet, conforme à la demande)** : au montage (`isOpen` devient
  `true`), focus posé sur le panneau lui-même (`panelRef.current?.focus()`, panneau avec
  `tabIndex={-1}`) ; à la fermeture, focus rendu au bouton hamburger (`triggerRef` détenu par
  `Navbar`, passé... en réalité la restauration de focus la plus simple est faite côté `Navbar`
  lui-même : `Navbar` garde une `ref` sur son bouton hamburger et appelle `.focus()` dans le
  `onClose` qu'il passe à `MobileDrawer`, pas besoin que `MobileDrawer` connaisse le bouton). Pas de
  cyclage Tab/Shift+Tab intercepté (pas de trap) : Tab peut sortir du panneau vers le reste de la
  page — accepté explicitement par la proposition ("focus trap minimal ou non").

### 1.3 `Navbar.tsx` — structure cible

```tsx
export function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closeDrawer(): void {
    setIsDrawerOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <nav className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex flex-wrap items-center gap-6">
        <Link to="/" ...>Chapelle du Vœux</Link>
        {/* Barre desktop : inchangée, juste encapsulée dans hidden md:flex */}
        <div className="hidden items-center gap-4 text-sm md:flex">
          {SITE_LINKS.map((link) => <Link key={link.to} to={link.to} ...>{link.label}</Link>)}
        </div>
      </div>
      <div className="hidden md:flex">
        <AuthNav />
      </div>

      {/* Bouton hamburger : visible seulement <768px */}
      <button
        ref={triggerRef}
        type="button"
        className="flex h-11 w-11 items-center justify-center md:hidden"
        aria-expanded={isDrawerOpen}
        aria-controls={drawerId}
        aria-label={isDrawerOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => { setIsDrawerOpen((open) => !open); }}
      >
        <HamburgerIcon isOpen={isDrawerOpen} />
      </button>

      <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer} id={drawerId} label="Menu">
        <div className="flex flex-col gap-4 text-sm">
          {SITE_LINKS.map((link) => <Link key={link.to} to={link.to} ...>{link.label}</Link>)}
        </div>
        <AuthNav />
      </MobileDrawer>
    </nav>
  );
}
```

Points notables :
- `SITE_LINKS` est rendu **deux fois** dans le JSX (barre desktop `hidden md:flex` + contenu du
  drawer), ce n'est pas un `map` partagé extrait en sous-composant — rendu volontairement dupliqué
  tel quel pour rester lisible, cohérent avec la taille modeste du composant (5 liens).
- `AuthNav` est rendu **deux fois** également (une fois dans un wrapper `hidden md:flex` pour la
  barre desktop, une fois tel quel dans le drawer) — **aucune modification d'`AuthNav` lui-même**.
- `HamburgerIcon` : petit composant local (ou fonction inline) à deux `<path>` SVG alternées selon
  `isOpen` (trois barres / croix), cohérent avec "icône SVG inline, pas de dépendance d'icônes" —
  décision mineure tranchée ici (pas demandée explicitement mais cohérente avec la convention du
  projet), peut être simplifiée à une icône fixe si jugé superflu en implémentation.
- Cible tactile ≥44px : `h-11 w-11` (44px en Tailwind v4, `11 * 4px`).
- `useId()` (React 19) pour l'id du drawer : robuste si `Navbar` était un jour rendu plusieurs fois
  dans un même arbre (tests), plutôt qu'une chaîne constante.

### 1.4 Seuil 768px : CSS uniquement, pas de hook JS

Contrairement à l'Agenda, **`Navbar` n'a pas besoin de `useIsMobileViewport()`** : la bascule
desktop/mobile ne pilote aucun choix de *composant FullCalendar* nécessitant du JS — un simple
`hidden md:flex` / `md:hidden` Tailwind suffit, et c'est plus robuste (pas de flash de contenu avant
hydratation d'un état React, pas de dépendance à `matchMedia`). Le bouton hamburger et le drawer sont
structurellement inatteignables en layout desktop (le bouton est `md:hidden`, donc `isDrawerOpen` ne
peut pas passer à `true` par une interaction utilisateur réelle au-dessus de 768px) ; il n'y a donc
aucun scénario de régression desktop à couvrir par un hook.

### 1.5 Impact sur les tests existants — point d'attention

`Navbar.test.tsx` actuel (lu) fait des `screen.getByRole("link", { name: "Agenda" })` globaux, en
s'attendant à un seul résultat. Avec le montage conditionnel décrit en §1.2 (`MobileDrawer` retourne
`null` quand `isOpen` est faux), **ces tests existants continuent de passer sans modification** : par
défaut (`isDrawerOpen = false` à l'état initial), seule la copie "barre desktop" de `SITE_LINKS`/
`AuthNav` est dans le DOM — le drawer n'existe pas encore. C'est la raison du choix "montage
conditionnel" plutôt que "toujours monté + masqué visuellement" : ce dernier aurait fait apparaître
**deux** liens `"Agenda"` dans le DOM dès le rendu initial (jsdom n'applique pas les media queries ni
le CSS Tailwind réel, donc `hidden md:flex` n'aurait eu aucun effet sur le DOM de test), cassant tous
les tests existants basés sur `getByRole` sans scope.

Les **nouveaux** tests qui ouvrent effectivement le drawer (clic sur le bouton hamburger) doivent, eux,
scoper leurs assertions avec `within(screen.getByRole("dialog"))` puisqu'à ce moment-là deux copies de
chaque lien coexistent (celle de la barre desktop, toujours présente dans le DOM même si elle serait
visuellement masquée en vrai navigateur, et celle du drawer).

### 1.6 Desktop (≥768px) — strictement inchangé
- Logo + 5 liens + `AuthNav` visibles en permanence, même rendu visuel qu'avant (juste encapsulés
  dans des `div` `hidden md:flex` qui n'ont aucun effet visuel ≥768px).
- Bouton hamburger et `MobileDrawer` : jamais visibles/accessibles (bouton `md:hidden`, drawer jamais
  ouvert car le seul déclencheur — le bouton — n'est pas atteignable).
- Tous les tests `Navbar.test.tsx`/`AuthNav.test.tsx` existants : verts sans modification.

---

## 2. `useIsMobileViewport()`

### 2.1 Fichiers
- `apps/user-app/src/hooks/useIsMobileViewport.ts` (nouveau)
- `apps/user-app/src/hooks/useIsMobileViewport.test.ts` (nouveau)
- `apps/user-app/vitest.setup.ts` (modifié — cf. §4.1, **piège critique**)

### 2.2 Signature

```ts
const MOBILE_QUERY = "(max-width: 767px)";

/** Réactif à `window.matchMedia("(max-width: 767px)")` — recalculé à l'abonnement (rotation
 *  d'écran, redimensionnement). Seuil 768px, identique à celui du drawer de navigation
 *  (`Navbar`), seule notion de "mobile" du projet. Pas de garde `typeof window === "undefined"` :
 *  `user-app` est un SPA Vite, jamais exécuté en SSR. */
export function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => { setIsMobile(event.matches); };
    mediaQueryList.addEventListener("change", handleChange);
    return () => { mediaQueryList.removeEventListener("change", handleChange); };
  }, []);

  return isMobile;
}
```

`addEventListener("change", ...)` (API moderne de `MediaQueryList`, supportée Safari ≥14/tous
navigateurs ciblés) plutôt que l'ancien `addListener`/`removeListener` dépréciés — pas de fallback
nécessaire, pas de navigateur legacy visé par ce projet.

### 2.3 Test (`useIsMobileViewport.test.ts`)
Mock de `window.matchMedia` retournant un objet `MediaQueryList`-like contrôlable (ex.
`vi.fn().mockReturnValue({ matches: true, addEventListener, removeEventListener, ... })`), puis
déclenchement manuel de `handleChange` capturé via le mock pour vérifier la réactivité (`act(() => {
capturedHandler({ matches: false } as MediaQueryListEvent); })` → hook retourne `false`).

---

## 3. Agenda mobile — `CalendrierReservations`/`renderPlanningEvent`

### 3.1 Où vit l'état du "jour sélectionné" (Mode Mois mobile) — décision

**Dans `CalendrierReservations`, pas remonté à `PageAgenda`.** Deux raisons convergentes :
1. `proposal.md` décrit explicitement `useIsMobileViewport()` comme "pilotant le rendu de
   `CalendrierReservations`" — le hook est appelé *dans* ce composant, pas dans `PageAgenda`.
2. La section "Impact / Affected code" de `proposal.md` liste
   `CalendrierReservations.tsx`/`renderPlanningEvent.tsx` comme fichiers impactés côté Agenda, mais
   **ne mentionne pas `PageAgenda.tsx`** — signal fort que ce fichier doit rester intact. Faire vivre
   `selectedDay` dans `PageAgenda` aurait nécessité d'y ajouter un état + une prop supplémentaire
   transmise à `CalendrierReservations`, contredisant ce signal.

Bénéfice induit : `PageAgenda.tsx` reste au mot près inchangé (déjà vérifié en lecture — son usage de
`<CalendrierReservations key={periodeCacheKey(periode)} ... />` n'a besoin d'aucune nouvelle prop).

### 3.2 Fichiers

| Fichier | Statut |
|---|---|
| `apps/user-app/src/components/agenda/CalendrierReservations.tsx` | modifié |
| `apps/user-app/src/components/agenda/CalendrierReservations.test.tsx` | modifié (nouveaux cas) |
| `apps/user-app/src/components/agenda/renderPlanningEvent.tsx` | modifié |
| `apps/user-app/src/components/agenda/renderPlanningEvent.test.tsx` | modifié (cf. §4.2, piège) |
| `apps/user-app/src/components/agenda/planningEntries.ts` | modifié (+ `filterEntriesByDay`) |
| `apps/user-app/src/components/agenda/planningEntries.test.ts` | modifié |
| `apps/user-app/src/components/agenda/ListeCreneauxJour.tsx` | **nouveau** |
| `apps/user-app/src/components/agenda/ListeCreneauxJour.test.tsx` | **nouveau** |
| `apps/user-app/src/hooks/useIsMobileViewport.ts` | nouveau (§2) |
| `apps/user-app/package.json` | + `@fullcalendar/list@6.1.21` |
| `apps/user-app/src/pages/PageAgenda.tsx` | **inchangé** |

### 3.3 `CalendrierReservations.tsx` — structure cible

```ts
import listPlugin from "@fullcalendar/list";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { filterEntriesByDay } from "./planningEntries";
import { ListeCreneauxJour } from "./ListeCreneauxJour";

function resolveCalendarConfig(periode: PlanningPeriode, isMobile: boolean) {
  switch (periode.mode) {
    case "jour":
      return { initialView: "timeGridDay", initialDate: periode.date, views: undefined }; // inchangé
    case "semaine":
      return isMobile
        ? { initialView: "listWeek", initialDate: periode.dateDebut, views: undefined }
        : { initialView: "timeGridWeek", initialDate: periode.dateDebut, views: undefined }; // inchangé si !isMobile
    case "mois":
      return { initialView: "dayGridMonth", initialDate: `...`, views: undefined }; // inchangé (isMobile n'affecte PAS la vue elle-même, seulement l'interactivité, cf. plus bas)
    case "intervalle":
      return { ...inchangé, isMobile ignoré } ; // mode retiré du sélecteur (FiltreDatePlanning), non prioritaire
  }
}

export default function CalendrierReservations({ periode, entries, isLoading, onSelectSlot, onEventClick }: CalendrierReservationsProps) {
  const isMobile = useIsMobileViewport();
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // "yyyy-MM-dd", FullCalendar dateStr

  if (isLoading) { return <Spinner .../>; }

  const isMoisMobileTactile = isMobile && periode.mode === "mois";
  const dayEntries = selectedDay ? filterEntriesByDay(entries, selectedDay) : [];

  return (
    <div className="flex flex-col gap-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        {...resolveCalendarConfig(periode, isMobile)}
        locale={frLocale}
        headerToolbar={false}
        height="auto"
        nowIndicator
        editable={false}
        selectable={Boolean(onSelectSlot) && !isMoisMobileTactile}
        selectOverlap={false}
        selectAllow={...} // inchangé
        select={onSelectSlot}
        dateClick={
          isMoisMobileTactile
            ? (info: DateClickArg) => {
                setSelectedDay((previous) => (previous === info.dateStr ? null : info.dateStr));
              }
            : undefined
        }
        eventClick={onEventClick}
        events={mapPlanningEntriesToEvents(entries)}
        eventContent={renderPlanningEvent}
      />
      {isMoisMobileTactile && <ListeCreneauxJour date={selectedDay} entries={dayEntries} />}
    </div>
  );
}
```

Points de conception précis :

- **`dateClick` utilise `info.dateStr`**, pas `info.date` reformaté côté client. FullCalendar fournit
  déjà, pour une cellule "jour entier" de `dayGridMonth`, une chaîne `"yyyy-MM-dd"` native — l'utiliser
  directement évite tout recalcul de fuseau horaire côté React (piège évité : `info.date` est un objet
  `Date` dont l'interprétation locale pourrait diverger selon le fuseau d'exécution du navigateur/CI).
- **`selectable={Boolean(onSelectSlot) && !isMoisMobileTactile}`** : désactive le *drag-select* (créer
  une réservation en glissant sur la grille) uniquement pour la combinaison Mode Mois + mobile — cf.
  question ouverte n°1 (§5) : cette combinaison peut sinon déclencher à la fois `select` et `dateClick`
  sur un simple tap (FullCalendar a une zone grise documentée où un clic bref sans déplacement peut
  être interprété comme un micro-select). Pour tous les autres cas (desktop, ou mobile hors Mode
  Mois), `selectable` est strictement inchangé.
- **`selectedDay` est un état local simple**, remis à `null` automatiquement à chaque changement de
  période grâce au `key={periodeCacheKey(periode)}` déjà posé par `PageAgenda` (qui démonte/remonte
  tout `CalendrierReservations`, y compris ses hooks internes) — **aucune logique de reset explicite
  à écrire**, le mécanisme existant suffit et n'a pas besoin d'être modifié.
- **Tap deux fois le même jour → referme le panneau** (`previous === info.dateStr ? null : ...`) :
  décision mineure (non demandée explicitement, mais cohérente avec l'ergonomie "accordéon" attendue
  d'un panneau Google-Agenda-like) ; peut être simplifiée en implémentation si jugée superflue.
- **`listPlugin` toujours inclus** dans `plugins`, même en mode desktop ou Jour — par cohérence avec
  le pattern déjà en place (les autres plugins sont eux aussi toujours tous importés, peu importe le
  mode actif), coût négligeable, pas de branchement conditionnel d'import.

### 3.4 `ListeCreneauxJour.tsx` — nouveau composant (pas `ReservationCard`)

**Décision : nouveau composant compact, pas de réutilisation de `ReservationCard`.**
`ReservationCard` (lu) affiche "Début :"/"Fin :"/"Bénéficiaire :"/"Description :" sur des lignes
séparées dans une `Card` avec bordure/ombre — pensé pour afficher **une seule** réservation dans une
modale de confirmation, pas pour empiler plusieurs créneaux compacts façon agenda. L'utiliser tel quel
pour une liste de N créneaux produirait un rendu bien plus verbeux que l'esprit "liste Google Agenda"
visé par la proposition. En revanche, **la dérivation titre/`isMine` est réutilisée** via
`mapPlanningEntriesToEvents` (déjà exportée par `planningEntries.ts`), pour ne pas dupliquer une
troisième fois la règle métier d'anonymisation.

```ts
export interface ListeCreneauxJourProps {
  date: string;                          // "yyyy-MM-dd", jour tapé
  entries: PlanningEntryResponse[];      // déjà filtrées pour ce jour par filterEntriesByDay
}

export function ListeCreneauxJour({ date, entries }: ListeCreneauxJourProps): ReactNode {
  const events = mapPlanningEntriesToEvents(entries); // réutilise title/isMine, pas de 3e calcul
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-pearl bg-white p-4">
      <h3 className="font-serif text-sm font-semibold text-night-900">{formatDate(date)}</h3>
      {events.length === 0 ? (
        <p className="text-sm text-night-500">Aucun créneau ce jour-là.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-pearl">
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-2 py-2 text-sm">
              <span className="font-medium text-night-800">
                {formatTime(event.start)} – {formatTime(event.end)}
              </span>
              <span className="truncate">{event.title}</span>
              {event.extendedProps.isMine && <Badge variant="info">Ma réservation</Badge>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Décision : liste en lecture seule** (aucun `onClick`/`onEventClick` câblé sur les lignes). Le flux
d'annulation (tap sur *sa* réservation → `onEventClick` → modale) reste joignable exactement comme
avant, via la puce d'événement déjà rendue par `renderPlanningEvent` **dans la grille elle-même**
(`eventClick={onEventClick}` sur `FullCalendar` est inchangé et continue de se déclencher sur un tap
direct de la puce, que le panneau du jour soit ouvert ou non — `dateClick` et `eventClick` sont deux
callbacks FullCalendar distincts, sans conflit). Documenté comme question ouverte n°2 (§5) si une
liste tactile avec action est souhaitée dès cette itération plutôt qu'en évolution ultérieure.

### 3.5 `planningEntries.ts` — ajout

```ts
/** Clé de jour "yyyy-MM-dd" calculée via les accesseurs *locaux* de `Date` (`getFullYear`/
 *  `getMonth`/`getDate`), volontairement PAS via `formatDate`/`toISODateString` (fuseau Europe/Paris
 *  forcé par Intl) : FullCalendar place ses événements dans les cellules de `dayGridMonth` selon le
 *  fuseau LOCAL du navigateur (accesseurs natifs `Date`, pas une conversion explicite vers Paris) —
 *  utiliser une autre base de calcul ferait diverger, en environnement dont le fuseau d'exécution
 *  n'est pas Europe/Paris (ex. CI en UTC), le panneau "jour sélectionné" des puces visuellement
 *  affichées dans la cellule tapée. */
function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${String(year)}-${month}-${day}`;
}

/** Filtre + trie chronologiquement les entrées dont `dateDebut` tombe sur `dateISO` ("yyyy-MM-dd",
 *  même format que `DateClickArg.dateStr`) — panneau "jour sélectionné" du Mode Mois mobile, calculé
 *  côté client depuis les `entries` déjà chargées (US consultation-planning, aucun nouvel appel
 *  réseau). */
export function filterEntriesByDay(entries: PlanningEntryResponse[], dateISO: string): PlanningEntryResponse[] {
  return entries
    .filter((entry) => localDateKey(new Date(entry.dateDebut)) === dateISO)
    .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
}
```

### 3.6 `renderPlanningEvent.tsx` — gestion de `listWeek`

```ts
export function renderPlanningEvent(arg: EventContentArg): ReactNode {
  const isMine = Boolean(arg.event.extendedProps.isMine);
  const viewType = arg.view.type;
  const estGrilleHoraire = viewType === "timeGridDay" || viewType === "timeGridWeek";
  const estVueListe = viewType === "listWeek";

  const timeText =
    !estGrilleHoraire && !estVueListe && arg.event.start && arg.event.end
      ? `${formatTime(arg.event.start)} – ${formatTime(arg.event.end)}`
      : arg.timeText;

  return (
    <div className="flex flex-col gap-1 overflow-hidden px-1 py-0.5 text-xs">
      <div className="flex items-center gap-1">
        {!estVueListe && <span className="font-medium">{timeText}</span>}
        <span className="truncate">{arg.event.title}</span>
      </div>
      {isMine && <Badge variant="info">Ma réservation</Badge>}
    </div>
  );
}
```

Changement minimal par rapport à l'existant (lu) : ajout de `estVueListe` et de la condition
`!estVueListe` sur le `<span>` d'heure. En vue `listWeek`, **aucune heure n'est rendue par cette
fonction** (ni `arg.timeText`, ni la plage calculée) : la colonne `.fc-list-event-time`, native au
rendu du plugin `@fullcalendar/list` (en dehors du contrôle d'`eventContent`), affiche déjà l'heure de
début — ne rien afficher ici évite la duplication visuelle décrite par la proposition. `dayGridMonth`/
`intervalle` (plage complète) et `timeGridDay`/`timeGridWeek` (`arg.timeText` seul) : **strictement
inchangés**.

---

## 4. Pièges transversaux

### 4.1 Piège critique : `window.matchMedia` absent de jsdom

`jsdom` (environnement de test de `apps/user-app`, cf. `vitest.config.ts`) **n'implémente pas**
`window.matchMedia` par défaut (`undefined`, pas une fonction). Dès que `useIsMobileViewport()` est
appelé — directement dans ses propres tests, mais surtout **indirectement** dans
`CalendrierReservations.test.tsx` (et tout futur test montant `PageAgenda`) puisque le hook est
désormais appelé dans `CalendrierReservations` à chaque rendu (§3.3) — tout test qui ne connaît rien
de cette proposition lèverait `TypeError: window.matchMedia is not a function` et casserait en masse
les tests existants (toutes les suites `CalendrierReservations.test.tsx` actuelles, qui ne mockent
pas `matchMedia`).

**Résolution recommandée, dans `apps/user-app/vitest.setup.ts`** : ajouter un stub global par défaut,
exactement sur le modèle déjà en place pour `window.scrollTo` (lu dans ce fichier, avec son
commentaire explicatif) :

```ts
// jsdom n'implémente pas `window.matchMedia` (cf. https://github.com/jsdom/jsdom/issues/1695) :
// `useIsMobileViewport` (Agenda mobile) l'appelle au premier rendu — sans ce stub, toute suite qui
// rend `CalendrierReservations`/`PageAgenda` (y compris les tests antérieurs à cette proposition, qui
// ignorent tout de `matchMedia`) lèverait `TypeError: window.matchMedia is not a function`. Valeur
// par défaut `matches: false` ("desktop") : préserve le comportement des tests existants (écrits
// avant la distinction desktop/mobile) sans qu'ils aient à mocker quoi que ce soit ; les tests qui
// veulent simuler un viewport mobile surchargent explicitement `window.matchMedia` localement.
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
```

Avec ce stub, **toutes les suites existantes (`CalendrierReservations.test.tsx` desktop,
`FiltreDatePlanning.test.tsx`, etc.) continuent de passer sans aucune modification**, puisque
`isMobile` vaut `false` par défaut partout — exactement le comportement d'aujourd'hui. Les nouveaux
tests "mobile" (§2.3, task 4.3/5.4 de `tasks.md`) surchargent `window.matchMedia` localement avant
rendu (`vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, ... } as MediaQueryList)`), ou
mockent un module wrapper — à trancher en implémentation, les deux approches sont équivalentes ici.

### 4.2 Test pré-existant à corriger : `renderPlanningEvent.test.tsx`

Le fichier (lu, déjà présent dans l'arbre de travail avec des modifications non commitées d'un autre
chantier) contient déjà un cas :

```ts
it("affiche la plage horaire début–fin en vue Intervalle (listWeek)", () => {
  // viewType: "listWeek", attend `screen.getByText("11:00 – 12:00")`
});
```

Cette assertion encode l'**ancien** comportement (avant cette proposition) où `listWeek` tombait dans
la branche "pas grille horaire" et affichait donc la plage complète en double. Avec le changement du
§3.6, ce test doit être réécrit pour vérifier l'**absence** de toute heure rendue par la fonction en
vue `listWeek` (ni `"11:00 – 12:00"`, ni `"10:00"`), seul `event.title` (et le badge éventuel) restant
visible — cf. task 4.2/4.3 de `tasks.md` qui anticipe cette mise à jour. Signalé explicitement ici
pour éviter toute confusion ("ce test existe déjà, il doit rester vert tel quel") : son intitulé
("vue Intervalle") est d'ailleurs trompeur — le mode "Intervalle" utilise `dayGridIntervalle`, jamais
`listWeek` (cf. `resolveCalendarConfig`, mode "intervalle" inchangé) ; `listWeek` n'est atteint que par
Mode Semaine + mobile (§3.3).

### 4.3 `key={periodeCacheKey(periode)}` (`PageAgenda.tsx`) — pas de régression

Ce `key` sur `<CalendrierReservations>` démonte/remonte entièrement le composant à chaque changement
de période (mode ou dates). Conséquences pour cette conception, vérifiées explicitement :
- `selectedDay` (état local du panneau Mois mobile, §3.3) repart toujours à `null` à chaque nouvelle
  période — comportement désiré (pas de panneau "collé" sur un jour d'un mois précédent) obtenu
  gratuitement, sans code de reset dédié.
- `useIsMobileViewport()` est réinitialisé (son `useState` lazy relit `window.matchMedia(...).matches`)
  à chaque remount — sans impact négatif (lecture bon marché, et il est de toute façon réabonné à
  `change` immédiatement après).
- Aucune modification de `PageAgenda.tsx` n'est nécessaire pour que ce mécanisme continue de fonctionner
  avec les nouveaux états internes de `CalendrierReservations`.

### 4.4 `@fullcalendar/list` — dépendance

`apps/user-app/package.json` : ajouter `"@fullcalendar/list": "6.1.21"` dans `dependencies`, aligné
avec les autres `@fullcalendar/*` déjà en `6.1.21` (`core`, `daygrid`, `interaction`, `react`,
`timegrid`). Pas de CSS à importer séparément (aucun des plugins déjà en place n'en importe, le
pattern CSS-in-JS de FullCalendar v6 est déjà en vigueur dans ce projet).

---

## 5. Questions ouvertes

[Question]: Mode Mois + mobile désactive le *drag-select* (`selectable`) pour éviter le conflit
`select`/`dateClick` sur un simple tap (cf. §3.3) — un veilleur perd ainsi la possibilité de créer une
réservation en glissant sur la grille mensuelle **uniquement sur mobile** (il garde cette possibilité
en Mode Jour/Semaine, et sur desktop en Mode Mois). Cette réduction de surface n'est pas mentionnée
explicitement dans `proposal.md`. Est-ce acceptable, ou faut-il conserver le drag-select en Mode Mois
mobile au prix d'un comportement potentiellement ambigu sur certains appareils (déclenchement
simultané possible de `select` et `dateClick`, à valider empiriquement selon le moteur tactile) ?
[Réponse]: Désactiver (décision de l'orchestrateur, suit la recommandation de cette conception)
(solution retenue par défaut ci-dessus), la création de réservation restant pleinement disponible via
Mode Jour/Semaine.

[Question]: Le panneau `ListeCreneauxJour` (Mode Mois mobile) est conçu **en lecture seule** — aucune
action tactile sur ses lignes ; l'annulation d'une réservation reste accessible uniquement via la puce
d'événement (petite, dans la cellule de grille), inchangée. Est-ce suffisant pour cette itération, ou
faut-il rendre les lignes du panneau elles-mêmes tapables pour déclencher `onEventClick` (ce qui
demanderait de reconstruire un objet compatible `EventClickArg` ou d'élargir le contrat de
`onEventClick`/`CalendrierReservations`, hors du périmètre actuel de `proposal.md`) ?
[Réponse]: Lecture seule pour cette itération (décision de l'orchestrateur, suit la recommandation
de cette conception — périmètre de `proposal.md` ne mentionne qu'un affichage), évolution tactile
du panneau à traiter comme amélioration séparée si souhaitée.

---

## 6. Récapitulatif — strictement inchangé en desktop (≥768px)

- **Navbar** : logo + 5 liens `SITE_LINKS` + `AuthNav` visibles en permanence sur une ligne ; bouton
  hamburger et `MobileDrawer` jamais montés/atteignables (`md:hidden` sur le seul déclencheur).
- **Agenda, Mode Jour** : `timeGridDay`, aucune dépendance à `isMobile`.
- **Agenda, Mode Semaine** : `timeGridWeek`, `resolveCalendarConfig` retourne exactement la même
  config qu'aujourd'hui quand `isMobile` est faux.
- **Agenda, Mode Mois** : `dayGridMonth` inchangé, surlignage gold inchangé, **aucun** `dateClick`
  câblé (`isMoisMobileTactile` faux ⇒ `dateClick={undefined}`), `selectable` strictement identique à
  aujourd'hui (`Boolean(onSelectSlot)`), `onEventClick` inchangé, aucun `<ListeCreneauxJour>` rendu.
- **Agenda, Mode Intervalle** : totalement inchangé (mode de toute façon retiré du sélecteur
  `FiltreDatePlanning` actuel).
- **`renderPlanningEvent`** : les 4 branches existantes (`timeGridDay`, `timeGridWeek`,
  `dayGridMonth`, `dayGridIntervalle`) produisent exactement le même rendu qu'avant ; seule la
  nouvelle branche `listWeek` est ajoutée, jamais atteinte sur desktop.
- **`PageAgenda.tsx`** : fichier non modifié (aucune prop, aucun état ajouté).
- Tous les tests existants listés en §4.1/§1.5 restent verts sans modification de leurs assertions,
  grâce au stub `matchMedia` par défaut (`matches: false`) et au montage conditionnel du drawer.
