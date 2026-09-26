import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { listUsers } from "../api/endpoints/users";

/**
 * Taille arbitraire (cf. conception U3 §7.2/§9 point ouvert n°4), délibérément distincte
 * de `DEFAULT_PAGE_SIZE` (20, pagination UI standard) : `GET /users` n'exposant aucun
 * filtre `role`, cette page unique de comptes `VALIDE` doit être suffisamment large pour
 * couvrir l'ensemble des Veilleurs avant filtrage côté client.
 */
const VEILLEUR_LOOKUP_PAGE_SIZE = 100;

/** `select` filtre `role === VEILLEUR` côté client, faute de filtre `role` sur `GET /users`. */
export function useVeilleurs(): UseQueryResult<UserResponse[]> {
  return useQuery({
    queryKey: ["users", "veilleurs"],
    queryFn: () =>
      listUsers({ statutValidation: StatutValidation.VALIDE, page: 0, size: VEILLEUR_LOOKUP_PAGE_SIZE }),
    select: (page) => page.content.filter((user) => user.role === UserRole.VEILLEUR),
  });
}
