# Tasks — reservation-date-format-paris

## 1. Utilitaire partagé
- [ ] 1.1 Ajouter `toParisISOString(date: Date): string` dans `packages/shared/src/utils/formatters.ts`
      (offset dynamique `+01:00`/`+02:00` selon la saison, calculé — pas codé en dur)
- [ ] 1.2 Exporter depuis `packages/shared/src/utils/index.ts`
- [ ] 1.3 Tests unitaires : un cas hiver (CET, +01:00), un cas été (CEST, +02:00), un cas proche
      d'une bascule DST

## 2. user-app
- [ ] 2.1 `PageAgenda.tsx` (`onSelectSlot`) : `toParisISOString(info.start)` /
      `toParisISOString(info.end)` au lieu de `info.start.toISOString()` / `info.end.toISOString()`
- [ ] 2.2 Mettre à jour `PageAgenda.test.tsx` (assertions sur `dateDebut`/`dateFin`)

## 3. admin-app
- [ ] 3.1 `PagePlanning.tsx` (`onSelectSlot`) : même changement que 2.1
- [ ] 3.2 Mettre à jour `PagePlanning.test.tsx` (assertions sur `dateDebut`/`dateFin`)

## 4. Vérification backend (bloquant avant livraison)
- [ ] 4.1 Confirmer que `POST /bookings` accepte `dateDebut`/`dateFin` avec un offset non-`Z`
      (`+01:00`/`+02:00`) — cf. proposal.md, section Impact
