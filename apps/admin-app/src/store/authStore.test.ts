import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";

const STORAGE_KEY = "chapelle-admin-auth-store";

const user: UserResponse = {
  id: "admin-1",
  email: "admin@example.com",
  nom: "Curé",
  prenoms: "Michel",
  telephone: "0612345678",
  role: UserRole.ADMINISTRATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

describe("store/authStore (admin-app)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("utilise la clé de storage 'chapelle-admin-auth-store'", async () => {
    const { useAuthStore } = await import("./authStore");
    useAuthStore.getState().setUser(user);

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("isHydrated bascule à true après réhydratation (via merge), état initial non authentifié sans localStorage", async () => {
    const { useAuthStore } = await import("./authStore");
    const state = useAuthStore.getState();

    expect(state.isHydrated).toBe(true);
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("restaure l'utilisateur persisté en localStorage au chargement du module", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { user }, version: 0 }));

    const { useAuthStore } = await import("./authStore");
    const state = useAuthStore.getState();

    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isHydrated).toBe(true);
  });

  it("gère un localStorage sans utilisateur persisté (state.user absent)", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: {}, version: 0 }));

    const { useAuthStore } = await import("./authStore");
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isHydrated).toBe(true);
  });

  it("setUser(user) met à jour user/isAuthenticated et persiste uniquement { user } en localStorage", async () => {
    const { useAuthStore } = await import("./authStore");

    useAuthStore.getState().setUser(user);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as {
      state: Record<string, unknown>;
    };
    expect(Object.keys(persisted.state)).toEqual(["user"]);
    expect(persisted.state.user).toEqual(user);
  });

  it("setUser(null) marque isAuthenticated à false", async () => {
    const { useAuthStore } = await import("./authStore");
    useAuthStore.getState().setUser(user);

    useAuthStore.getState().setUser(null);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("clear() réinitialise l'état en mémoire et le storage persistant", async () => {
    const { useAuthStore } = await import("./authStore");
    useAuthStore.getState().setUser(user);

    useAuthStore.getState().clear();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as {
      state: { user: unknown };
    };
    expect(persisted.state.user).toBeNull();
  });

  it("ne persiste ni mot de passe ni token : uniquement { user }", async () => {
    const { useAuthStore } = await import("./authStore");
    useAuthStore.getState().setUser(user);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as {
      state: Record<string, unknown>;
    };
    expect(persisted.state).not.toHaveProperty("isAuthenticated");
    expect(persisted.state).not.toHaveProperty("isHydrated");
    expect(persisted.state).not.toHaveProperty("password");
    expect(persisted.state).not.toHaveProperty("token");
  });
});
