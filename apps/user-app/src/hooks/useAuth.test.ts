import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  StatutValidation,
  UserRole,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
} from "@chapelle/shared/types";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "./useAuth";

const loginMock = vi.fn<(dto: LoginRequest) => Promise<AuthResponse>>();
const registerMock = vi.fn<(dto: RegisterRequest, photo?: File) => Promise<AuthResponse>>();
const logoutMock = vi.fn<() => Promise<void>>();
const navigateMock = vi.fn<(to: string, options?: { replace?: boolean }) => void>();

vi.mock("../api/endpoints/auth", () => ({
  login: (dto: LoginRequest) => loginMock(dto),
  register: (dto: RegisterRequest, photo?: File) => registerMock(dto, photo),
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
    email: "a@b.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.ADORATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
  },
  authenticatedAt: "2026-01-01T00:00:00Z",
};

describe("hooks/useAuth (user-app)", () => {
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
      response = await result.current.login({ email: "a@b.com", password: "pw" });
    });

    expect(loginMock).toHaveBeenCalledWith({ email: "a@b.com", password: "pw" });
    expect(response).toBe(authResponse);
    expect(useAuthStore.getState().user).toEqual(authResponse.user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("register() appelle l'endpoint mais N'appelle PAS setUser (pas de connexion auto)", async () => {
    registerMock.mockResolvedValueOnce(authResponse);
    const { result } = renderHook(() => useAuth());

    let response: AuthResponse | undefined;
    await act(async () => {
      response = await result.current.register({
        email: "a@b.com",
        password: "pw",
        nom: "Dupont",
        prenoms: "Jean",
        telephone: "0612345678",
        role: UserRole.ADORATEUR,
      });
    });

    expect(registerMock).toHaveBeenCalled();
    expect(response).toBe(authResponse);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("register() propage la photo fournie à registerRequest", async () => {
    registerMock.mockResolvedValueOnce(authResponse);
    const { result } = renderHook(() => useAuth());
    const dto: RegisterRequest = {
      email: "veilleur@example.com",
      password: "pw",
      nom: "Dupont",
      prenoms: "Jean",
      telephone: "0612345678",
      role: UserRole.VEILLEUR,
    };
    const photo = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.register(dto, photo);
    });

    expect(registerMock).toHaveBeenCalledWith(dto, photo);
  });

  it("register() sans photo appelle registerRequest avec photo undefined", async () => {
    registerMock.mockResolvedValueOnce(authResponse);
    const { result } = renderHook(() => useAuth());
    const dto: RegisterRequest = {
      email: "adorateur@example.com",
      password: "pw",
      nom: "Dupont",
      prenoms: "Jean",
      telephone: "0612345678",
      role: UserRole.ADORATEUR,
    };

    await act(async () => {
      await result.current.register(dto);
    });

    expect(registerMock).toHaveBeenCalledWith(dto, undefined);
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

    expect(result.current.role).toBe(UserRole.ADORATEUR);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
