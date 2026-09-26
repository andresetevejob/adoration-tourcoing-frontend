import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { UserResponse } from "@chapelle/shared/types";
import { listUsers } from "../api/endpoints/users";
import { isAdminAccount } from "../lib/adminRoles";

/**
 * Taille arbitraire, même rationale que `VEILLEUR_LOOKUP_PAGE_SIZE` (`useVeilleurs`, U3) :
 * `GET /users` n'exposant aucun filtre `role`, cette page unique doit être suffisamment
 * large pour couvrir l'ensemble des comptes Administrateur avant filtrage côté client.
 */
const ADMIN_LOOKUP_PAGE_SIZE = 100;

/**
 * Modelé sur `useVeilleurs` (U3), pas sur `useUsers` (U4) : lecture exhaustive à plat,
 * sans pagination UI, `select` filtre `isAdminAccount` côté client. `queryKey` sous le
 * préfixe `["users"]` : couvert par l'invalidation déjà en place dans
 * `useCreateUser`/`useUpdateUser`/`useDeleteUser` (U4) — aucune modification de ces trois
 * hooks n'est nécessaire. Pas de `useAdmin(id)` dédié : l'édition se fait directement
 * depuis la ligne de `AdminsListPage`, à partir de la donnée déjà chargée ici.
 */
export function useAdmins(): UseQueryResult<UserResponse[]> {
  return useQuery({
    queryKey: ["users", "admins"],
    queryFn: () => listUsers({ page: 0, size: ADMIN_LOOKUP_PAGE_SIZE }),
    select: (page) => page.content.filter((user) => isAdminAccount(user.role)),
  });
}
