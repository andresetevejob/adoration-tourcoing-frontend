import { createApiClient, type ApiClient } from "@chapelle/shared/api";
import { navigate } from "../lib/navigation";
import { useAuthStore } from "../store/authStore";

export const apiClient: ApiClient = createApiClient(import.meta.env.VITE_API_BASE_URL, {
  onUnauthorized: () => {
    useAuthStore.getState().clear();
    navigate("/connexion", { replace: true });
  },
  onForbidden: () => {
    navigate("/non-autorise", { replace: true });
  },
});
