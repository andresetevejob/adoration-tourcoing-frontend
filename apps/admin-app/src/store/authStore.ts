import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserResponse } from "@chapelle/shared/types";
import { queryClient } from "../lib/queryClient";

export interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setUser: (user: UserResponse | null) => void;
  clear: () => void;
}

interface PersistedAuthState {
  user?: UserResponse | null;
}

/**
 * `user` est une information d'affichage optimiste persistée en localStorage (le
 * swagger n'expose aucun endpoint `/auth/me` : `AuthResponse.user` n'est renvoyé que
 * par `login`). La vérité de session reste le cookie httpOnly côté backend : tout 401
 * réel déclenche `onUnauthorized` (cf. `api/client.ts`), qui appelle `clear()`.
 *
 * `isHydrated` bascule à `true` via `merge` (plutôt que `onRehydrateStorage`) : `merge`
 * s'exécute avec les `set`/`get` internes du store, sans jamais référencer le binding
 * exporté `useAuthStore` — qui n'est pas encore initialisé tant que `create(...)` n'a
 * pas retourné (la réhydratation zustand/persist démarre de façon synchrone pendant la
 * création du store, avant que l'assignation `const useAuthStore = ...` ne soit terminée).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      setUser: (user) => {
        set({ user, isAuthenticated: user !== null });
      },
      clear: () => {
        // `clear()` est le point d'entrée unique de toute déconnexion (logout
        // explicite ET 401 forcé via `onUnauthorized`). C'est donc le bon endroit
        // pour vider le cache TanStack Query : sans ça, des données déjà chargées
        // en tant qu'utilisateur authentifié resteraient affichées après la
        // déconnexion sur une route restée montée.
        queryClient.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "chapelle-admin-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedAuthState | null | undefined;
        const user = persisted?.user ?? null;
        return {
          ...currentState,
          user,
          isAuthenticated: user !== null,
          isHydrated: true,
        };
      },
    },
  ),
);
