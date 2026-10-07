import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@chapelle/shared/types";
import { apiClient } from "../client";

export function login(dto: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", dto, { skipAuthRetry: true });
}

export function register(dto: RegisterRequest, photo?: File): Promise<AuthResponse> {
  const body = photo ? toMultipartFormData(dto, photo) : dto;
  return apiClient.post<AuthResponse>("/auth/register", body, { skipAuthRetry: true });
}

function toMultipartFormData(dto: RegisterRequest, photo: File): FormData {
  const formData = new FormData();
  formData.append("email", dto.email);
  formData.append("password", dto.password);
  formData.append("nom", dto.nom);
  formData.append("prenoms", dto.prenoms);
  if (dto.telephone) formData.append("telephone", dto.telephone);
  formData.append("role", dto.role);
  formData.append("photo", photo);
  return formData;
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
