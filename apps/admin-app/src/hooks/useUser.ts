import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { UserResponse } from "@chapelle/shared/types";
import { getUser } from "../api/endpoints/users";

/**
 * Extension non prévue par `component-methods.md`, nécessaire à `/utilisateurs/:id`
 * (cf. conception U4 §5.2). Volontairement **non filtré** par `MANAGEABLE_ROLES`
 * (contrairement à `useUsers`) : la page détail a besoin de recevoir la donnée réelle,
 * y compris pour un compte admin consulté par URL directe, afin de pouvoir appliquer
 * la garde de §4 point 3 et afficher le message explicatif plutôt qu'une erreur
 * générique.
 */
export function useUser(id: string): UseQueryResult<UserResponse> {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => getUser(id),
  });
}
