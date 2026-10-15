# Design — photo-navbar-mon-compte

Conception légère (HOW) des deux points décrits dans `tasks.md` (section "1. Conception détaillée").
Stack : React 19 + Vite + Tailwind v4 + TanStack Query, `apps/user-app` uniquement.

Fichiers lus pour cette conception : `proposal.md`, `tasks.md`,
`openspec/specs/gestion-utilisateurs/spec.md` (sections "Affichage de la photo d'un Veilleur (fiche
admin)" et "Affichage de la photo d'un bénéficiaire dans l'agenda (`user-app`)"),
`apps/user-app/src/components/layout/AuthNav.tsx`,
`apps/user-app/src/hooks/useUserPhoto.ts` (+ test),
`apps/admin-app/src/hooks/useUserPhoto.ts`,
`apps/user-app/src/components/agenda/{ReservationConfirmModal,ReservationDetailModal}.tsx`,
`apps/admin-app/src/components/users/UserProfile.tsx`, `apps/user-app/src/hooks/useAuth.ts`,
`packages/shared/src/types/user.ts`,
`openspec/changes/archive/2026-10-14-detail-reservation-veilleur/design.md` (référence de format).

---

## 1. `useUserPhoto` (user-app) — garde réseau optionnelle (tasks.md 1.1)

### 1.1 Décision : paramètre `hasPhoto` optionnel avec défaut `true`

Option retenue : ajouter un second paramètre `hasPhoto: boolean = true` au hook existant, utilisé
pour `enabled` dans `useQuery` — exactement le mécanisme déjà en place côté admin-app
(`enabled: hasPhoto`), mais rendu optionnel pour ne rien changer au comportement des deux appelants
agenda actuels (`ReservationConfirmModal.tsx`, `ReservationDetailModal.tsx`), qui continuent
d'appeler `useUserPhoto(booking.idUtilisateur)` avec un seul argument.

Alternative écartée : dupliquer le hook (ex. `useUserPhotoGuarded`) ou créer un composant dédié
(`UserAvatar`) encapsulant la garde. Écartée parce que :
- La seule différence entre le besoin agenda (toujours appeler) et le besoin navbar (appeler
  seulement si `hasPhoto`) est l'option `enabled` de `useQuery` — un paramètre optionnel sur le hook
  existant couvre les deux cas sans dupliquer `useState`/`useEffect`/révocation d'URL objet.
- Le hook user-app est déjà documenté comme "miroir" du hook admin-app ; lui ajouter le même
  paramètre `hasPhoto` (plutôt qu'un nom différent) renforce la cohérence entre les deux, au lieu de
  créer un troisième idiome.

Pourquoi un défaut `true` et pas `false` : `true` reproduit exactement le comportement actuel
("l'appel est toujours tenté") pour tout appelant qui ne précise rien — c'est la condition pour ne
pas casser `ReservationConfirmModal.tsx`/`ReservationDetailModal.tsx` sans les modifier. Un défaut
`false` aurait désactivé silencieusement ces deux appelants (régression).

### 1.2 Signature finale et code exact

```ts
import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getUserPhoto } from "../api/endpoints/users";

/**
 * Miroir de `apps/admin-app/src/hooks/useUserPhoto.ts` pour la gestion de l'URL objet
 * (cache du `Blob`, jamais de l'URL ; création/révocation en `useEffect` à chaque
 * changement de référence du `Blob`).
 *
 * `hasPhoto` (optionnel, défaut `true`) : garde réseau optionnelle, cf. équivalent
 * admin-app (`enabled: hasPhoto`, paramètre obligatoire là-bas car `UserResponse.photo`
 * porte toujours un indicateur de présence pour ses appelants). Côté user-app, deux
 * familles d'appelants coexistent :
 * 1. Agenda (`ReservationConfirmModal`, `ReservationDetailModal`) : `PlanningEntryResponse`
 *    ne porte AUCUN indicateur de présence de photo — ces appelants n'ont rien à passer et
 *    comptent sur le défaut `true` (comportement inchangé : appel toujours tenté).
 * 2. `AuthNav` (navbar) : `UserResponse.photo` porte bien un indicateur de présence —
 *    `hasPhoto` y est passé explicitement (`Boolean(user?.photo)`) pour éviter tout appel
 *    réseau pour un Adorateur ou un Veilleur sans photo.
 *
 * `retry: false` : un 404 (pas de photo) est une issue COURANTE pour l'appelant agenda
 * (non gardé), pas une anomalie réseau transitoire. Conservé inconditionnellement même
 * quand `hasPhoto` est explicite (navbar) : un échec (403/réseau) n'y est pas plus une
 * anomalie transitoire à retenter.
 *
 * Dégradation silencieuse : ce hook ne lit/n'expose jamais `query.error` à ses appelants de
 * façon particulière — en cas d'erreur ou de `hasPhoto` à `false`, `data` reste `undefined`.
 */
export function useUserPhoto(
  userId: string,
  hasPhoto = true,
): Omit<UseQueryResult<Blob>, "data"> & { data: string | undefined } {
  const query = useQuery({
    queryKey: ["users", "photo", userId],
    queryFn: () => getUserPhoto(userId),
    enabled: hasPhoto,
    retry: false,
  });

  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!query.data) {
      setPhotoUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(query.data);
    setPhotoUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [query.data]);

  return { ...query, data: photoUrl };
}
```

Changement par rapport à l'existant : ajout de `hasPhoto = true` aux paramètres et de
`enabled: hasPhoto` dans `useQuery` (seule ligne ajoutée aux options). Aucune autre ligne modifiée.
`ReservationConfirmModal.tsx`/`ReservationDetailModal.tsx` : **aucune modification nécessaire**
(appel à un seul argument toujours valide, `hasPhoto` prend le défaut `true`).

### 1.3 Non-régression — vérification contre `useUserPhoto.test.tsx` existant

Les cinq tests actuels (`useUserPhoto.test.tsx`) appellent tous `useUserPhoto("u1")` ou
`useUserPhoto(userId)` à un seul argument : avec le défaut `true`, `enabled` vaut toujours `true`
pour ces tests, donc `getUserPhoto` est appelé exactement comme avant — tous les tests existants
restent valides sans modification. Un nouveau test (tâche 3.1, test-engineer) devra couvrir
`hasPhoto = false` : `getUserPhoto` jamais appelé, `data` reste `undefined` sans jamais passer par
`isLoading`/`isError`.

---

## 2. `AuthNav.tsx` — miniature et positionnement (tasks.md 1.2)

### 2.1 Taille et style

**32px (`h-8 w-8`), circulaire, `object-cover`** — dans la fourchette proposée par `tasks.md`
(28-32px), choisie à l'extrémité haute pour rester identifiable malgré un recadrage automatique à
une petite taille, tout en restant nettement plus petite que la miniature de fiche admin (~96px,
`h-24 w-24`) ou des modales agenda (même taille) : ce sont des contextes de lecture dédiés à la
photo, alors qu'ici la photo n'est qu'un indice secondaire à côté d'un lien texte dans une barre
étroite (`text-sm`, `gap-4`).

`alt=""` (décoratif), pas de texte alternatif décrivant la personne : contrairement à
`UserProfile.tsx`/`ReservationCard.tsx` où l'image identifie un *tiers* (bénéficiaire d'une
réservation, utilisateur consulté) et doit donc être nommée pour un lecteur d'écran, ici la photo
accompagne un lien dont le texte visible ("Mon compte") décrit déjà complètement la destination et
la fonction — doubler l'annonce ("Photo de Jean Dupont, Mon compte") serait redondant plutôt
qu'informatif. Pas de `Spinner`/indicateur de chargement, même raisonnement que `ReservationCard`
(`design.md` archivé §1.1) : éviter un clignotement sur une barre de navigation visible en
permanence.

### 2.2 Positionnement : à l'intérieur du `<Link>`, avant le texte

La photo est placée **dans** le `<Link to="/mon-compte">` existant, avant le texte "Mon compte",
avec `gap-2` entre les deux (photo + texte forment un seul bloc cliquable cohérent — cliquer la
photo navigue aussi vers `/mon-compte`, comportement attendu puisque c'est la photo de
l'utilisateur connecté lui-même). Alternative écartée : photo en élément frère du `<Link>` dans le
`<nav>` — écartée parce qu'elle introduirait une zone cliquable séparée sans action propre, ce qui
serait une incohérence d'interaction (zone image non cliquable à côté d'un lien, ou cliquable vers
nulle part).

### 2.3 Code exact

```tsx
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useUserPhoto } from "../../hooks/useUserPhoto";

export function AuthNav() {
  const { isAuthenticated, user, logout } = useAuth();
  const hasPhoto = Boolean(user?.photo);
  const { data: photoUrl } = useUserPhoto(user?.id ?? "", hasPhoto);

  if (!isAuthenticated) {
    return (
      <nav className="flex items-center justify-end gap-4 text-sm">
        <Link to="/connexion" className="text-night-700 hover:text-gold-600">
          Connexion
        </Link>
        <Link to="/inscription" className="text-night-700 hover:text-gold-600">
          Inscription
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-end gap-4 text-sm">
      <Link
        to="/mon-compte"
        className="flex items-center gap-2 text-night-700 hover:text-gold-600"
      >
        {photoUrl && (
          <img src={photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        )}
        Mon compte
      </Link>
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
        className="text-night-700 hover:text-gold-600"
      >
        Déconnexion
      </button>
    </nav>
  );
}
```

Points de vigilance :
- `useUserPhoto(user?.id ?? "", hasPhoto)` est appelé **avant** le `if (!isAuthenticated)` (règle
  des Hooks React — un Hook ne peut pas être appelé conditionnellement selon une branche de rendu).
  Quand `user` est `null` (non connecté), `hasPhoto` vaut `false` ⇒ `enabled: false` ⇒ aucun appel
  réseau ; `userId` vaut `""` mais n'est jamais utilisé puisque la requête est désactivée.
- Dégradation silencieuse déjà couverte par `useUserPhoto` lui-même (§1) : aucune gestion d'erreur
  supplémentaire nécessaire dans `AuthNav` — en cas d'échec réseau/403/404, `photoUrl` reste
  `undefined`, le bloc `<img>` est simplement absent, "Mon compte" reste seul affiché.
- Composant partagé entre `Navbar.tsx` (desktop) et `MobileDrawer.tsx` (mobile) : aucun changement
  séparé nécessaire, la modification bénéficie aux deux automatiquement (confirmé par relecture des
  deux fichiers consommateurs).

### 2.4 Impact fichiers

| Fichier | Statut |
|---|---|
| `apps/user-app/src/hooks/useUserPhoto.ts` (+ test) | modifié (paramètre `hasPhoto = true`, `enabled: hasPhoto`) |
| `apps/user-app/src/components/layout/AuthNav.tsx` (+ test) | modifié (miniature conditionnelle 32px avant "Mon compte") |
| `apps/user-app/src/components/agenda/ReservationConfirmModal.tsx` | **aucun changement** (appel à un seul argument, défaut préservé) |
| `apps/user-app/src/components/agenda/ReservationDetailModal.tsx` | **aucun changement** (idem) |

---

## 3. Points ouverts

[Question]: `alt=""` (décoratif) retenu en §2.1 plutôt qu'un texte nommant l'utilisateur connecté
(ex. `alt="Photo de profil"` générique) — à confirmer que l'absence totale de texte alternatif est
bien souhaitée, par opposition à un texte générique non redondant avec "Mon compte" (ex. simplement
différent de celui utilisé pour un tiers).
[Réponse]: (non tranché — décision mineure d'accessibilité, ajustable librement en implémentation/
revue sans remettre en cause le reste de la conception).
