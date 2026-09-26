import type { UserRole } from "@chapelle/shared/types";

/**
 * Fonction pure de résolution de la redirection post-connexion.
 * `ProtectedRoute` rattrape le cas où `from` pointe vers une route dont le rôle exact
 * n'est pas couvert (redirection vers `/non-autorise` au rendu de `from`) : pas de
 * duplication de la logique de garde ici.
 */
export function resolvePostLoginRedirect(
  role: UserRole,
  appAllowedRoles: UserRole[],
  from?: string,
): string {
  if (!appAllowedRoles.includes(role)) {
    return "/non-autorise";
  }
  return from ?? "/";
}
