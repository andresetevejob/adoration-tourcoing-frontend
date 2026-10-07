import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { ResetPasswordRequest } from "@chapelle/shared/types";
import { resetPassword } from "../api/endpoints/auth";

/** Pas de toast `onError` ici : l'échec (401, token invalide/expiré) doit être affiché sur la
 *  page, pas en notification transitoire — c'est `PageReinitialisationMotDePasse` qui gère
 *  l'erreur via le callback `onError` passé à `.mutate(...)`. */
export function useResetPassword(): UseMutationResult<void, ApiError, ResetPasswordRequest> {
  return useMutation({
    mutationFn: resetPassword,
  });
}
