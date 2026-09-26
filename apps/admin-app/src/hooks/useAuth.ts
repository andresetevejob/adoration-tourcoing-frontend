import type { AuthResponse, LoginRequest, UserResponse, UserRole } from "@chapelle/shared/types";
import { login as loginRequest, logout as logoutRequest } from "../api/endpoints/auth";
import { navigate } from "../lib/navigation";
import { useAuthStore } from "../store/authStore";

export interface UseAuthResult {
  user: UserResponse | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (dto: LoginRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clear = useAuthStore((state) => state.clear);

  async function login(dto: LoginRequest): Promise<AuthResponse> {
    const response = await loginRequest(dto);
    setUser(response.user);
    return response;
  }

  async function logout(): Promise<void> {
    // Le nettoyage local a lieu quoi qu'il arrive : un échec réseau/serveur de
    // `/auth/logout` ne doit pas laisser l'utilisateur "connecté" côté client
    // après un clic sur Déconnexion.
    try {
      await logoutRequest();
    } catch {
      // ignoré volontairement, cf. commentaire ci-dessus
    } finally {
      clear();
      navigate("/connexion");
    }
  }

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated,
    isHydrated,
    login,
    logout,
  };
}
