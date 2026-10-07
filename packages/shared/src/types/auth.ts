import type { UserResponse, UserRole } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenoms: string;
  telephone?: string;
  role: Extract<UserRole, UserRole.ADORATEUR | UserRole.VEILLEUR>;
}

export interface AuthResponse {
  user: UserResponse;
  authenticatedAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
