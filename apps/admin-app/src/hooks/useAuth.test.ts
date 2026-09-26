import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  StatutValidation,
  UserRole,
  type AuthResponse,
  type LoginRequest,
} from "@chapelle/shared/types";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "./useAuth";

const loginMock = vi.fn<(dto: LoginRequest) => Promise<AuthResponse>>();
const logoutMock = vi.fn<() => Promise<void>>();
const navigateMock = vi.fn<(to: string, options?: { replace?: boolean }) => void>();

vi.mock("../api/endpoints/auth", () => ({
  login: (dto: LoginRequest) => loginMock(dto),
  logout: () => logoutMock(),
}));

vi.mock("../lib/navigation", () => ({
  navigate: (...args: Parameters<typeof navigateMock>) => {
    navigateMock(...args);
  },
}));

const authResponse: AuthResponse = {
  user: {
    id: "1",
    email: "admin@example.com",
    nom: "Curé",
    prenoms: "Michel",
    role: UserRole.ADMINISTRATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
  },
  authenticatedAt: "2026-01-01T00:00:00Z",
};

describe("hooks/useAuth (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clear();
  });

  it("expose user/role/isAuthenticated/isHydrated dérivés du store", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isHydrated).toBe(true);
  });

  it("login() appelle l'endpoint, met à jour le store avec setUser puis retourne la réponse", async () => {
    loginMock.mockResolvedValueOnce(authResponse);
    const { result } = renderHook(() => useAuth());

    let response: AuthResponse | undefined;
    await act(async () => {
      response = await result.current.login({ email: "admin@example.com", password: "pw" });
    });

    expect(loginMock).toHaveBeenCalledWith({ email: "admin@example.com", password: "pw" });
    expect(response).toBe(authResponse);
    expect(useAuthStore.getState().user).toEqual(authResponse.user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("logout() appelle l'endpoint, vide le store puis navigue vers /connexion", async () => {
    logoutMock.mockResolvedValueOnce(undefined);
    useAuthStore.getState().setUser(authResponse.user);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutMock).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith("/connexion");
  });

  it("logout() vide le store et navigue vers /connexion même si l'appel réseau échoue", async () => {
    logoutMock.mockRejectedValueOnce(new Error("network error"));
    useAuthStore.getState().setUser(authResponse.user);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutMock).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith("/connexion");
  });

  it("role reflète user?.role ?? null quand un utilisateur est connecté", () => {
    useAuthStore.getState().setUser(authResponse.user);
    const { result } = renderHook(() => useAuth());

    expect(result.current.role).toBe(UserRole.ADMINISTRATEUR);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("n'expose pas de méthode register() (absente côté admin-app)", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current).not.toHaveProperty("register");
  });
});
