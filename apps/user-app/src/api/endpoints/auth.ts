import type { AuthResponse, LoginRequest, RegisterRequest } from "@chapelle/shared/types";
import { apiClient } from "../client";

export function login(dto: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", dto, { skipAuthRetry: true });
}

export function register(dto: RegisterRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/register", dto, { skipAuthRetry: true });
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

/** Exposé pour complétude/tests : le flux de refresh réel vit dans `SharedApiClient`. */
export async function refresh(): Promise<void> {
  await apiClient.post("/auth/refresh", undefined, { skipAuthRetry: true });
}
