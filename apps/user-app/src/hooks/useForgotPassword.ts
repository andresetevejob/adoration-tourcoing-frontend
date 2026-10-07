import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "@chapelle/shared/api";
import type { ForgotPasswordRequest, ForgotPasswordResponse } from "@chapelle/shared/types";
import { useToast } from "@chapelle/shared/ui";
import { forgotPassword } from "../api/endpoints/auth";

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue, veuillez réessayer.";

export function useForgotPassword(): UseMutationResult<ForgotPasswordResponse, ApiError, ForgotPasswordRequest> {
  const { show } = useToast();

  return useMutation({
    mutationFn: forgotPassword,
    onError: (error: ApiError) => {
      show(error instanceof ApiError ? error.message || GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE, "error");
    },
  });
}
