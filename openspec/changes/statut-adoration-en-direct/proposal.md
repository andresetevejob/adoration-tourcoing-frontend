# Proposition — statut-adoration-en-direct

## Why
La section "Un veilleur prie en cet instant" de la page d'accueil (`AdorationLive.tsx`,
`PageAccueil.tsx:248`) est aujourd'hui **entièrement statique** : horloge temps réel et compteur de
jours depuis 1885, mais aucun appel API — le message "Un veilleur prie en cet instant" est affiché
inconditionnellement, qu'un créneau d'adoration soit réellement en cours ou non.

La demande est de rendre ce statut réel : afficher si l'instant courant est bien contenu dans un
créneau de réservation de statut `EFFECTUEE` (`StatutReservation.EFFECTUEE`,
`packages/shared/src/types/reservation.ts`), et un message alternatif sinon.

**Point d'architecture important** : l'endpoint public `GET /api/v1/planning?date=` existe déjà et
filtre *déjà* côté serveur sur `statut EFFECTUEE` (swagger `backend/src/main/resources/swagger.yml`
ligne 487 : "Retourne les créneaux d'adoration actifs (statut EFFECTUEE, non supprimés)"). Il aurait
été possible de le réutiliser côté frontend sans aucun changement backend. Décision prise avec
l'utilisateur : un **nouvel endpoint dédié** est préférable ici, car la page d'accueil a besoin d'une
réponse minimale et d'une logique de rafraîchissement événementielle (se re-synchroniser exactement à
la fin du créneau en cours) plutôt que d'un polling à intervalle fixe sur un endpoint pensé pour la
pagination d'un calendrier.

## Schéma d'API proposé (à communiquer au backend)

```
GET /api/v1/adoration/en-cours
```
- Public, sans authentification (même politique que `GET /api/v1/planning`).
- Aucun paramètre : le serveur calcule l'instant courant lui-même (comme `GET /api/v1/planning` sans
  `date` calcule "aujourd'hui" en Europe/Paris).
- Logique serveur : existe-t-il une réservation `status = EFFECTUEE`, `estArchivee = false`, telle
  que `dateDebut <= maintenant <= dateFin` ?

Réponse `200` :
```json
{
  "enCours": true,
  "creneauActuel": {
    "dateDebut": "2026-10-07T14:30:00+02:00",
    "dateFin": "2026-10-07T15:30:00+02:00"
  }
}
```
ou, si aucun créneau en cours :
```json
{
  "enCours": false,
  "creneauActuel": null
}
```

Aucune donnée d'identité exposée (contrairement à `/planning`, pas de besoin d'anonymisation RGPD —
seules les bornes temporelles du créneau en cours sont utiles à l'affichage).

## What Changes

### Frontend (ce repo)
- Nouveau type partagé `StatutAdorationDirectResponse` (`packages/shared/src/types/adoration.ts`).
- Nouvel endpoint client `getStatutAdorationDirect()` (`apps/user-app/src/api/endpoints/adoration.ts`)
  → `GET /adoration/en-cours`.
- Nouveau hook `useStatutAdorationDirect` (logique de planification du prochain appel) :
  - `enCours === true` → prochain appel programmé exactement à `dateFin` (+ petite marge de sécurité
    pour l'horloge client, ex. 1s), pas de polling à intervalle fixe.
  - `enCours === false` → prochain appel reprogrammé à intervalle fixe (30s, fallback de polling, car
    la date du prochain créneau n'est pas connue du frontend).
  - Erreur réseau/HTTP → traité comme `enCours === false` (message alternatif, nouvelle tentative au
    même intervalle de repli 30s) — ne doit jamais casser l'affichage de la page d'accueil.
- `AdorationLive.tsx` : affichage conditionnel —
  - `enCours === true` → contenu actuel inchangé ("Un veilleur prie en cet instant" + horloge +
    compteur de jours).
  - `enCours === false` (ou état inconnu/erreur, avant première réponse) → message alternatif à
    définir avec l'équipe produit (ex. "Aucun veilleur n'est présent à l'instant — soyez le prochain à
    rejoindre la chaîne de prière"), badge "En ce moment" neutralisé. L'horloge et le compteur de
    jours restent affichés dans tous les cas (inchangés, non concernés par ce statut).

### Backend (hors de ce repo frontend)
- Schéma d'API ci-dessus à communiquer pour implémentation (`GET /api/v1/adoration/en-cours`).

## Impact
- Nouvelle capacité `consultation-statut-adoration` (aucune spec existante — ni dans
  `specs/reservation-adoration` qui ne couvre que le format de date/durée max à la création, ni dans
  `specs/vitrine-acces` qui n'existe pas encore en tant que spec graduée, seulement comme change
  d'origine U8 non archivée). Documentée pour la première fois par ce change.
- Fichiers affectés :
  `apps/user-app/src/components/vitrine/AdorationLive.tsx`,
  `apps/user-app/src/components/vitrine/AdorationLive.test.tsx`,
  `apps/user-app/src/api/endpoints/adoration.ts` (nouveau),
  `apps/user-app/src/hooks/useStatutAdorationDirect.ts` (nouveau),
  `packages/shared/src/types/adoration.ts` (nouveau).
- Pas de rupture : page d'accueil déjà publique, aucune donnée existante concernée. Dégradation
  silencieuse si l'endpoint backend n'est pas encore disponible (tant que le backend n'a pas
  implémenté `GET /api/v1/adoration/en-cours`, le frontend affichera le message alternatif en
  continu, jamais d'erreur visible pour l'utilisateur final).

## Décisions confirmées avec l'utilisateur
- [Réponse]: Nouvel endpoint dédié (pas de réutilisation de `/planning`).
- [Réponse]: Message alternatif distinct affiché en l'absence de créneau en cours.
- [Réponse]: Pas de polling à intervalle fixe pendant qu'un créneau est en cours — prochain appel
  programmé exactement à `dateFin` du créneau renvoyé. Polling de repli (30s) uniquement en l'absence
  de créneau en cours (ou en cas d'erreur).
