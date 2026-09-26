/**
 * Pont entre `api/client.ts` (contexte hors-React, hooks `onUnauthorized`/`onForbidden`)
 * et le routeur data de `react-router`. Volontairement sans dépendance à `react-router`
 * ni à `api/client.ts` pour éviter tout cycle d'import : `router.tsx` enregistre ici la
 * fonction de navigation du data router juste après sa création, `api/client.ts` l'importe
 * pour naviguer depuis les hooks du client HTTP.
 */
export type NavigateFn = (to: string, options?: { replace?: boolean }) => void;

let navigateFn: NavigateFn | null = null;

export function setNavigate(fn: NavigateFn): void {
  navigateFn = fn;
}

export function navigate(to: string, options?: { replace?: boolean }): void {
  navigateFn?.(to, options);
}
