# Conception — U7 : Contact

Sources : `aidlc-docs/inception/user-stories/stories.md` (US-CONTACT-01), `aidlc-docs/inception/application-design/{unit-of-work,components,component-methods,services}.md` (contrat partiellement figé : `sendContactMessage(dto): Promise<void>` situé côté `apps/user-app` ; emplacement des handlers MSW explicitement laissé à trancher en conception fonctionnelle — cf. §1), code déjà livré par U0 (`createApiClient`/`ApiError`, `PublicLayout`, route placeholder `/contact` déjà posée dans `apps/user-app/src/router.tsx`) et par U6 (infrastructure MSW partagée `packages/shared/src/mocks/{handlers,browser,server}.ts`, patron `useMutation` + toast d'erreur de `useCreateAnnonce`/`useCreateBooking`, patron `AnnonceForm`/`buildAnnonceFormSchema` pour un formulaire Zod + React Hook Form), et `apps/user-app/src/legacy-template/pages/Contact.tsx` (gabarit visuel à reprendre : hero statique, cartes d'info de contact, formulaire, état `sent`, carte OpenStreetMap).

Niveau conception uniquement : signatures, contrats, arborescence — **pas de corps de fonction, pas de JSX de rendu métier**.

**Rappel de périmètre (`unit-of-work.md`)** : U7 dépend de U0 uniquement — route publique, aucune garde d'authentification, cohérent avec la persona Anonyme incluse dans US-CONTACT-01. Périmètre exclusivement `apps/user-app` : aucun composant, aucun type, aucune route `admin-app` n'est concerné par cette unité (`admin-app` ne consomme jamais `ContactModule`).

---

## 1. Décision structurante — emplacement du handler MSW `POST /contact`

**Étend le jeu de handlers déjà partagé dans `packages/shared/src/mocks/`, pas de handlers app-local.** Justification :

1. **Un seul worker/serveur MSW par app, déjà posé par U6.** `apps/user-app/src/main.tsx` démarre un unique `worker` (`@chapelle/shared/mocks/browser`) et `apps/user-app/vitest.setup.ts` branche un unique `server` (`@chapelle/shared/mocks/server`) sur tout le cycle de vie du process. `msw` ne prévoit pas plusieurs `setupWorker`/`setupServer` concurrents dans le même contexte runtime (navigateur ou Node) : un second worker app-local pour `/contact` entrerait en conflit avec celui déjà démarré par U6 (double enregistrement de service worker en dev, double interception `fetch` en test) plutôt que de coexister proprement. Ajouter le handler au jeu déjà consommé par `worker`/`server` est donc la seule option qui ne casse pas l'infrastructure U6.
2. **Aucune duplication de code d'infrastructure.** Créer un second couple `browser.ts`/`server.ts` local à `apps/user-app` reproduirait à l'identique la logique déjà écrite dans `packages/shared/src/mocks/` (import dynamique conditionnel en dev, branchement `beforeAll`/`afterEach`/`afterAll` en test) pour un seul handler supplémentaire — un coût de maintenance sans bénéfice, alors que `packages/shared` est justement le point d'extension prévu.
3. **Coût d'intégration nul pour `admin-app`.** `admin-app` importe déjà le même `server`/`worker` partagé (pour `/annonces`, U6) ; ajouter `contactHandlers` au tableau combiné n'impose **aucune modification** de `apps/admin-app/main.tsx` ni `apps/admin-app/vitest.setup.ts` — ces fichiers importent le singleton `server`/`worker` par référence, pas la liste des handlers qu'il contient. Le seul effet de bord est un handler `POST /contact` présent mais jamais exercé côté `admin-app` (`ContactModule` n'y est pas monté) : même situation, symétrique, que `user-app` chargeant aujourd'hui déjà les handlers CRUD `/annonces` qu'il n'exerce jamais (lecture seule côté `user-app`, cf. U6 §6.1).
4. **Aucun nouvel export ni nouvelle dépendance npm.** Les trois sous-chemins `./mocks/{handlers,browser,server}` et la dépendance `msw` sont déjà déclarés dans `packages/shared/package.json` par U6 — cette unité ne touche pas ce fichier.

Conséquence directe : **aucune modification de `apps/user-app/main.tsx` ni de `apps/user-app/vitest.setup.ts`** n'est nécessaire pour cette unité — seuls `packages/shared/src/mocks/{handlers,browser,server}.ts` sont modifiés (§3), le reste du câblage (import dynamique en dev, `beforeAll`/`afterEach`/`afterAll` en test) posé par U6 s'applique tel quel au nouveau handler.

---

## 2. Arborescence cible

```
packages/shared/
└── src/mocks/
    ├── handlers.ts                          [MODIFIÉ] + contactHandlers, POST /contact (§3)
    ├── handlers.test.ts                     [MODIFIÉ] + tests POST /contact (§3)
    ├── browser.ts                           [MODIFIÉ] setupWorker(...annoncesHandlers, ...contactHandlers)
    └── server.ts                            [MODIFIÉ] setupServer(...annoncesHandlers, ...contactHandlers)

apps/user-app/
├── router.tsx                                [MODIFIÉ] remplace le placeholder "/contact" (§7)
└── src/
    ├── api/endpoints/
    │   ├── contact.ts                        [CRÉÉ] `ContactMessageDto`, `sendContactMessage` (§4)
    │   └── contact.test.ts                   [CRÉÉ]
    ├── hooks/
    │   ├── useSendContactMessage.ts          [CRÉÉ] (§5)
    │   └── useSendContactMessage.test.tsx    [CRÉÉ]
    ├── components/contact/
    │   ├── ContactForm.tsx                   [CRÉÉ] (§6)
    │   └── ContactForm.test.tsx              [CRÉÉ]
    └── pages/
        ├── PageContact.tsx                   [CRÉÉ] remplace `legacy-template/pages/Contact.tsx` (§7)
        └── PageContact.test.tsx              [CRÉÉ]
```

**Fichiers explicitement non modifiés** (à souligner car U6 les avait touchés) : `packages/shared/package.json` (exports/dépendance `msw` déjà déclarés), `apps/user-app/main.tsx`, `apps/user-app/vitest.setup.ts`, `apps/user-app/public/mockServiceWorker.js` (rien à régénérer, même asset), et l'intégralité de `apps/admin-app/**` (§1 point 3). Aucun fichier sous `packages/shared/src/types/` n'est créé ou modifié : `ContactMessageDto` est un contrat propre à `user-app`, jamais consommé par `admin-app`, cf. préambule.

---

## 3. Mock — extension des handlers partagés (`packages/shared/src/mocks/`)

Pas de nouveau fichier `contactStore.ts` : contrairement à `/annonces` (U6 §3), `/contact` n'a besoin d'aucun état persistant — US-CONTACT-01 ne décrit qu'un envoi (fire-and-forget), aucun récit ne demande de relire les messages envoyés (pas de vue admin des messages dans le périmètre `unit-of-work.md` de cette unité). Le handler est donc **sans état**, à la différence des handlers `/annonces`.

```typescript
// packages/shared/src/mocks/handlers.ts — [MODIFIÉ, ajout après annoncesHandlers]

/** Sans état (contrairement à `annoncesHandlers`) : US-CONTACT-01 ne décrit qu'un envoi,
 *  aucun récit ne demande de relire les messages envoyés — pas de `contactStore.ts`.
 *  Pas de validation du corps de la requête côté mock : même choix que `/annonces`
 *  (§4 du plan U6, point ouvert 4) — `ContactForm` (Zod, §6) est l'unique point d'entrée
 *  de cette mutation, aucune revalidation "serveur" redondante. */
export const contactHandlers: HttpHandler[] = [
  http.post("*/contact", () => new HttpResponse(null, { status: 204 })),
];
```

Réponse `204 No Content` (pas `200`/`202` avec corps) : même statut que `DELETE /annonces/:id` (U6 §4), seul autre endpoint mock à signature `Promise<void>` côté client — `createApiClient` (`packages/shared/src/api/client.ts`) traite déjà spécifiquement le `204` en retournant `undefined as T` sans tenter `response.json()`, ce qui correspond exactement à `Promise<void>`.

```typescript
// packages/shared/src/mocks/browser.ts — [MODIFIÉ]
import { setupWorker } from "msw/browser";
import { annoncesHandlers, contactHandlers } from "./handlers";

export const worker: ReturnType<typeof setupWorker> = setupWorker(...annoncesHandlers, ...contactHandlers);
```

```typescript
// packages/shared/src/mocks/server.ts — [MODIFIÉ]
import { setupServer } from "msw/node";
import { annoncesHandlers, contactHandlers } from "./handlers";

export const server: ReturnType<typeof setupServer> = setupServer(...annoncesHandlers, ...contactHandlers);
```

`handlers.test.ts` : ajout d'un bloc `describe("mocks/handlers — /contact")` suivant le patron déjà en place (`setupServer(...annoncesHandlers, ...contactHandlers)` local au fichier de test, `fetch` brut vers `${BASE_URL}/contact`) — vérifie `response.status === 204` sur un corps quelconque (aucune validation à couvrir côté mock, cf. ci-dessus).

---

## 4. `api/endpoints/contact.ts` (`apps/user-app`)

```typescript
// apps/user-app/src/api/endpoints/contact.ts
import { apiClient } from "../client";

/** Contrat propre à `user-app`, non partagé avec `admin-app` (cf. préambule) — pas de
 *  fichier `packages/shared/src/types/contact.ts` : la signature est déjà entièrement
 *  spécifiée par `component-methods.md`, rien à mutualiser. */
export interface ContactMessageDto {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}

/** POST /contact — endpoint public, aucune garde d'authentification (US-CONTACT-01,
 *  persona Anonyme incluse), même absence de garde que `listAnnonces` (U6)/`getPlanning` (U2). */
export function sendContactMessage(dto: ContactMessageDto): Promise<void> {
  return apiClient.post<void>("/contact", dto);
}
```

Pas de `{ skipForbiddenRedirect: true }` (contrairement aux mutations `admin-app` de U6) : cette route est publique, un `403` n'est pas un cas attendu ici — aucune précaution à répliquer.

---

## 5. `hooks/useSendContactMessage.ts` (`apps/user-app`)

```typescript
// apps/user-app/src/hooks/useSendContactMessage.ts
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import { useToast } from "@chapelle/shared/ui";
import { sendContactMessage, type ContactMessageDto } from "../api/endpoints/contact";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

/**
 * Patron `useCreateAnnonce`/`useCreateBooking` (toast d'erreur via `ApiError`), avec deux
 * écarts assumés :
 * - pas de `useQueryClient()`/`invalidateQueries` : aucune query en cache ne dépend de
 *   `/contact` (pas de `useContactMessages` dans le périmètre de cette unité, contrairement
 *   à `["annonces"]`/`["planning"]`/`["bookings"]`) ;
 * - pas de toast de succès : la confirmation d'envoi est portée par l'état inline `sent`
 *   de `PageContact` (§7), pas par une notification transitoire — décision motivée par le
 *   Gherkin US-CONTACT-01 ("une confirmation d'envoi s'affiche") et par le gabarit legacy
 *   déjà conçu pour cet usage (bloc de remerciement remplaçant le formulaire).
 */
export function useSendContactMessage(): UseMutationResult<void, ApiError, ContactMessageDto> {
  const { show } = useToast();

  return useMutation<void, ApiError, ContactMessageDto>({
    mutationFn: sendContactMessage,
    onError: (error) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
```

---

## 6. `components/contact/ContactForm.tsx` (`apps/user-app`)

Patron direct de `AnnonceForm`/`buildAnnonceFormSchema` (admin-app, U6 §9.2) : schéma Zod local, non partagé. Un seul mode ici (pas d'union discriminée `create`/`edit` : le formulaire de contact n'a qu'un seul usage) — pas de scission en deux sous-composants, à la différence d'`AnnonceForm`.

```typescript
// apps/user-app/src/components/contact/ContactForm.tsx
export interface ContactFormProps {
  isSubmitting: boolean;
  onSubmit: (dto: ContactMessageDto) => void;
}

const SUJET_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Choisissez un sujet" },
  { value: "info", label: "Demande d'information" },
  { value: "priere", label: "Intention de prière" },
  { value: "visite", label: "Visite de groupe" },
  { value: "benevolat", label: "Bénévolat" },
  { value: "autre", label: "Autre" },
];
// Options reprises telles quelles du gabarit legacy (`legacy-template/pages/Contact.tsx`) —
// `AnnonceCreateRequest`/`ContactMessageDto` ne modélisent `sujet` que comme `string` libre :
// ces valeurs sont une convention purement front, à confirmer par l'orchestrateur (§8, point ouvert 1).

/** Reprend `.trim()` avant chaque `.min()` : le gabarit legacy valide sur `form.champ.trim()`
 *  (un nom/message composé uniquement d'espaces est rejeté) — Zod 3.23+ (`.trim()` déjà
 *  disponible, cf. `.claude/tech-stack.md`) reproduit ce comportement et, en prime, envoie
 *  au mock des valeurs déjà nettoyées (contrairement à `AnnonceForm`, qui n'a pas ce besoin). */
function buildContactFormSchema(): z.ZodSchema<ContactMessageDto> {
  return z.object({
    nom: z.string().trim().min(1, "Le nom est requis."),
    email: z.string().trim().min(1, "L'email est requis.").email("Email invalide."),
    sujet: z.string().min(1, "Veuillez choisir un sujet."),
    message: z.string().trim().min(1, "Le message est requis.").min(10, "Minimum 10 caractères."),
  });
}

export function ContactForm(props: ContactFormProps): JSX.Element;
// register("nom")/("email") côte à côte (grid sm:grid-cols-2, repris du gabarit),
// <Select label="Sujet" options={SUJET_OPTIONS} error={errors.sujet?.message} {...register("sujet")} />,
// <textarea>/Input multilignes pour "message" (aucun composant `Textarea` dans `@chapelle/shared/ui` —
// balise <textarea> brute avec les mêmes classes d'état d'erreur qu'`Input`, cf. point ouvert 2, §8),
// <Button type="submit" isLoading={isSubmitting}>Envoyer le message</Button> — pas de bouton "Annuler"
// (absent du gabarit legacy, aucun onCancel dans les props).
```

Remise à zéro du formulaire après envoi : **pas de `reset()` explicite dans `ContactForm`** — `PageContact` (§7) démonte `ContactForm` pendant l'affichage de la confirmation puis le remonte au clic sur « Nouveau message » ; un composant remonté repart de `defaultValues` vides sans code de reset dédié (même mécanisme implicite que l'alternance `create`/`edit` d'`AnnonceForm`, qui ne partage jamais une instance RHF entre deux rendus).

---

## 7. `pages/PageContact.tsx` (`apps/user-app`) — remplace `legacy-template/pages/Contact.tsx`

Reprend la structure visuelle du gabarit (Hero statique, colonne de cartes d'info + réseaux sociaux statiques, colonne formulaire, carte OpenStreetMap) en ne reconnectant que le formulaire à `useSendContactMessage` — les cartes d'info (adresse/téléphone/email/horaires), les icônes SVG inline, les liens réseaux sociaux et l'iframe OpenStreetMap n'ont aucune contrepartie API (`ContactMessageDto` ne les modélise pas) : ils restent en dur dans le composant, même traitement que le hero statique de `PageActualites` (U6 §7).

### 7.1 État de soumission et confirmation

```typescript
export default function PageContact() {
  const [sentNom, setSentNom] = useState<string | null>(null);
  // null -> formulaire affiché ; string (nom soumis) -> confirmation affichée.
  // Capturé explicitement (pas juste un booléen `sent`) pour reproduire le message
  // personnalisé du gabarit legacy ("Merci {form.nom}.") après démontage du formulaire.
  const sendContactMessage = useSendContactMessage();

  function handleSubmit(dto: ContactMessageDto): void {
    sendContactMessage.mutate(dto, { onSuccess: () => setSentNom(dto.nom) });
  }

  function handleNewMessage(): void {
    setSentNom(null);
  }
  // ...
}
```

- **Succès** : `sentNom` passe de `null` à `dto.nom` → la carte formulaire bascule sur un bloc de confirmation (icône de succès, « Message envoyé ! », « Merci {sentNom}. Nous vous répondrons dans les meilleurs délais. », bouton `Button variant="gold-outline"` « Nouveau message » → `handleNewMessage`) — repris à l'identique du gabarit legacy (`sent ? (...) : (...)`), remplace uniquement les classes `btn-gold-outline`/`btn-primary` par `Button` (`@chapelle/shared/ui`), cohérent avec le remplacement de la pagination/modal bespoke par des composants partagés en U6 (§7.2).
- **Échec réseau/serveur (`ApiError`)** : **pas d'état inline dédié** — le toast d'erreur est déjà déclenché par `useSendContactMessage` (§5), le formulaire reste affiché et rempli (React Hook Form ne réinitialise pas les valeurs sur `onError`), l'utilisateur peut corriger et soumettre à nouveau immédiatement. Choix aligné sur le patron transverse déjà établi (`useCreateAnnonce`/`useCreateBooking`, U6/U3) : aucune page consommatrice de ces hooks n'ajoute de bannière d'erreur en complément du toast.
- **En cours d'envoi** : `isSubmitting={sendContactMessage.isPending}` transmis à `ContactForm`, qui désactive le bouton et affiche le `Spinner` intégré à `Button` (`isLoading`) — même mécanique que `AnnonceForm`/`ReservationConfirmModal`.

### 7.2 Composition de la page

```typescript
<Card title={sentNom === null ? "Envoyez-nous un message" : undefined}>
  {sentNom !== null ? (
    // bloc de confirmation, cf. §7.1
  ) : (
    <ContactForm isSubmitting={sendContactMessage.isPending} onSubmit={handleSubmit} />
  )}
</Card>
```

`Card` (`@chapelle/shared/ui`) remplace le conteneur `bg-white rounded-3xl shadow-2xl ...` bespoke du gabarit — même substitution que `Modal`/`Pagination` en U6 (§7.2), au bénéfice de la cohérence transverse avec le design system plutôt qu'un conteneur réimplémenté.

---

## 8. Routage — `router.tsx` (`apps/user-app`)

```typescript
// apps/user-app/src/router.tsx — [MODIFIÉ] seul le contenu de la route change
{ path: "/contact", element: <PageContact /> }, // public, pas de ProtectedRoute (US-CONTACT-01, persona Anonyme)
```

Remplace `<PagePlaceholder title="Contact" />` (commentaire `// U7` déjà présent) — la route reste dans les enfants de `PublicLayout`, aucune modification de structure du routeur au-delà de l'import et du remplacement de l'élément.

---

## 9. Stratégie de test

Même différenciation qu'U6 (§5.2 du plan précédent) :

- **`api/endpoints/contact.ts`** : convention U0-U6 inchangée, `vi.mock("../client")` — vérifie que `sendContactMessage` effectue un `POST /contact` avec exactement le `dto` reçu, sans réseau.
- **`hooks/useSendContactMessage.test.tsx`** : **pas** de `vi.mock("../client")` — `apiClient` réel, intercepté par le `server` MSW global (déjà branché par `vitest.setup.ts`, U6, inchangé ici, cf. §1). Cas couverts : succès (`result.current.isSuccess`, `data` vaut `undefined`), échec (`server.use(http.post("*/contact", () => HttpResponse.json({ code, message }, { status: 500|400 })))`, assertion sur le toast d'erreur via `screen.findByRole("status")` — même patron que `useCreateAnnonce.test.tsx`).
- **`components/contact/ContactForm.test.tsx`** : test de composant pur (React Testing Library), **sans MSW** — même patron que `AnnonceForm.test.tsx` (admin-app, U6) : rendu, soumission avec champs invalides un à un (nom vide, email malformé, sujet non choisi, message < 10 caractères) → message d'erreur affiché et `onSubmit` (mock `vi.fn()`) non appelé ; soumission valide → `onSubmit` appelé avec le `dto` trimé.
- **`pages/PageContact.test.tsx`** : **pas** de `vi.mock` — `apiClient` réel + `server` MSW global, même patron que `PageAnnonceCreation.test.tsx` (admin-app, U6). Cas couverts : rendu initial (hero, cartes d'info, formulaire visible) ; soumission valide → bascule vers le bloc de confirmation avec le nom soumis, formulaire disparu ; clic « Nouveau message » → formulaire réaffiché, vidé ; échec simulé (`server.use(...)`) → formulaire toujours visible, toast d'erreur affiché.

---

## 10. Points ouverts pour l'orchestrateur

1. **Contenu statique du gabarit legacy non représentatif de la Chapelle du Vœux (Tourcoing).** `legacy-template/pages/Contact.tsx` contient une adresse, un numéro de téléphone, un email et des liens réseaux sociaux (`href="#"`) hérités d'un gabarit générique ("35 Rue du Chevalier de la Barre, 75018 Paris", "contact@sacrecoeur-sanctuaire.fr", etc.) — aucune autre page du projet (`PageAccueil`, `AppLayout`, footer) ne définit de coordonnées réelles pour la Chapelle du Vœux à Tourcoing à ce jour. Ces valeurs statiques (§7) devront être remplacées par les vraies coordonnées avant mise en production ; à défaut d'une source de vérité fournie, ce plan les reprend telles quelles du gabarit à titre de placeholder, à corriger explicitement lors de l'implémentation.
2. **Absence de composant `Textarea` dans `@chapelle/shared/ui`** (§6) : le champ "message" (multiligne) n'a pas d'équivalent du `Input`/`Select` existants. Deux options non tranchées ici : (a) une balise `<textarea>` brute stylée localement dans `ContactForm.tsx` (au plus proche du gabarit, mais un style de champ non mutualisé) ; (b) l'ajout d'un composant `Textarea` à `packages/shared/src/ui` (cohérence du design system, mais un ajout d'API partagée hors du contrat déjà figé par `component-methods.md` pour cette unité). Ce plan retient (a) par défaut (moindre impact, pas de nouvel export partagé) — à confirmer.
3. **Valeurs de l'énumération `sujet`** (§6, `SUJET_OPTIONS`) : ni `stories.md` ni `component-methods.md` ne fixent la liste des sujets proposés — reprise telle quelle du gabarit legacy (`info`/`priere`/`visite`/`benevolat`/`autre`), à confirmer ou ajuster pour le contexte réel de la Chapelle du Vœux.
4. **Aucune vue admin des messages de contact dans le périmètre de cette unité** (§3) : conforme à `unit-of-work.md` (U7 = `user-app` uniquement, aucune mention côté `admin-app`), mais implique qu'un message envoyé via `/contact` n'est ni persisté ni consultable nulle part (le mock ne fait que répondre `204`, cf. §3) — à confirmer que ce comportement (message "envoyé dans le vide") est acceptable pour la recette manuelle de cette unité, ou qu'une unité future doit introduire un `contactStore.ts` + une vue admin dédiée.
