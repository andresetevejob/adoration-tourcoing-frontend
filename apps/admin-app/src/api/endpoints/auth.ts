import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  ResetPasswordRequest,
} from "@chapelle/shared/types";
import { apiClient } from "../client";

export function login(dto: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", dto, { skipAuthRetry: true });
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

/** Exposé pour complétude/tests : le flux de refresh réel vit dans `SharedApiClient`. */
export async function refresh(): Promise<void> {
  await apiClient.post("/auth/refresh", undefined, { skipAuthRetry: true });
}

export function forgotPassword(dto: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", dto, { skipAuthRetry: true });
}

export async function resetPassword(dto: ResetPasswordRequest): Promise<void> {
  await apiClient.post("/auth/reset-password", dto, { skipAuthRetry: true });
}
