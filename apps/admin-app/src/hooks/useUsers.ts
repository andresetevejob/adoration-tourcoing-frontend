import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { SpringPage, UserListFilters, UserResponse } from "@chapelle/shared/types";
import { MANAGEABLE_ROLES } from "../lib/manageableRoles";
import { listUsers } from "../api/endpoints/users";

/**
 * `select` filtre les comptes `ADMINISTRATEUR`/`SUPERADMINISTRATEUR` du résultat, côté
 * client (`GET /users` n'exposant aucun filtre `role`) — cf. conception U4 §4/§5.1.
 * Anomalie de pagination assumée (`totalPages`/`totalElements` calculés côté backend
 * sur l'ensemble non filtré), cf. §9 point ouvert n°2 de la conception.
 */
export function useUsers(
  filters: UserListFilters & { page: number; size: number },
): UseQueryResult<SpringPage<UserResponse>> {
  return useQuery({
    queryKey: ["users", "list", filters],
    queryFn: () => listUsers(filters),
    select: (page) => ({
      ...page,
      content: page.content.filter((user) => MANAGEABLE_ROLES.includes(user.role)),
    }),
  });
}
