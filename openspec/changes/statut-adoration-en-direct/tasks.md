# Tasks — statut-adoration-en-direct

## 1. Types & client API
- [x] 1.1 `StatutAdorationDirectResponse` dans `packages/shared/src/types/adoration.ts`
      (`enCours: boolean`, `creneauActuel: { dateDebut: string; dateFin: string } | null`)
- [x] 1.2 `getStatutAdorationDirect(): Promise<StatutAdorationDirectResponse>` dans
      `apps/user-app/src/api/endpoints/adoration.ts` → `GET /adoration/en-cours`, endpoint public
      (pas de garde d'authentification)
- [x] 1.3 Tests `adoration.test.ts` (requête correcte, pas de params)

## 2. Hook de planification
- [x] 2.1 `useStatutAdorationDirect()` dans `apps/user-app/src/hooks/useStatutAdorationDirect.ts` :
      - fetch initial au montage
      - si `enCours === true` : programme le prochain appel à `dateFin` (+ marge de sécurité ~1s),
        clamp à 0 si `dateFin` déjà dépassée (horloge client en retard)
      - si `enCours === false` ou erreur réseau/HTTP : programme le prochain appel à intervalle fixe
        (30s)
      - nettoyage du timer au démontage (pas de fuite, pas de double timer sur re-render)
- [x] 2.2 Tests (horloge simulée) : transition en-cours → absence à `dateFin`, polling de repli en
      absence, pas de crash/état incohérent sur erreur réseau, pas de double timer

## 3. Affichage (`AdorationLive.tsx`)
- [x] 3.1 Branchement du hook, affichage conditionnel du message selon `enCours`
      (badge "En ce moment" neutralisé si `enCours === false`), horloge/compteur de jours inchangés
      dans tous les cas
- [x] 3.2 État initial (avant première réponse) traité comme `enCours === false` (pas de flash du
      message "en cours" avant confirmation)
- [x] 3.3 Tests `AdorationLive.test.tsx` : rendu avec `enCours: true`, rendu avec `enCours: false`,
      rendu pendant l'état de chargement initial

## 4. Bruno
- [ ] 4.1 Requête Bruno pour `GET /adoration/en-cours` (dossier `adoration/`), à partager avec le
      backend comme référence du contrat attendu

## 5. Revue
- [x] 5.1 `code-reviewer` sur l'ensemble du change — un finding important relevé (cohérence
      architecturale : le hook réimplémentait fetch + `setTimeout` manuellement au lieu de
      `useQuery`/`refetchInterval` dynamique, mandaté par `.claude/tech-stack.md` pour tout state
      serveur) et corrigé par refactor ; logique de délai extraite dans une fonction pure
      `nextRefetchDelayMs` testée indépendamment. Seconde revue de confirmation : aucun finding
      bloquant, un point mineur de couverture de test comblé.
