import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, StatutValidation, type AuthResponse } from "@chapelle/shared/types";
import { forgotPassword, login, logout, refresh, register, resetPassword } from "./auth";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock("../client", () => ({
  apiClient: {
    get: vi.fn(),
    post: postMock,
    put: vi.fn(),
    delete: vi.fn(),
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

describe("api/endpoints/auth (user-app)", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("login() poste sur /auth/login avec skipAuthRetry", async () => {
    postMock.mockResolvedValueOnce(authResponse);

    const result = await login({ email: "a@b.com", password: "pw" });

    expect(postMock).toHaveBeenCalledWith(
      "/auth/login",
      { email: "a@b.com", password: "pw" },
      { skipAuthRetry: true },
    );
    expect(result).toBe(authResponse);
  });

  it("register() poste sur /auth/register avec skipAuthRetry", async () => {
    postMock.mockResolvedValueOnce(authResponse);

    const dto = {
      email: "a@b.com",
      password: "pw",
      nom: "Dupont",
      prenoms: "Jean",
      telephone: "0612345678",
      role: UserRole.ADORATEUR as const,
    };
    const result = await register(dto);

    expect(postMock).toHaveBeenCalledWith("/auth/register", dto, { skipAuthRetry: true });
    expect(result).toBe(authResponse);
  });

  it("register() avec une photo construit un FormData avec tous les champs et poste dessus", async () => {
    postMock.mockResolvedValueOnce(authResponse);

    const dto = {
      email: "veilleur@example.com",
      password: "pw",
      nom: "Dupont",
      prenoms: "Jean",
      telephone: "0612345678",
      role: UserRole.VEILLEUR as const,
    };
    const photo = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    const result = await register(dto, photo);

    expect(postMock).toHaveBeenCalledTimes(1);
    const [path, body, options] = postMock.mock.calls[0] as [string, FormData, unknown];
    expect(path).toBe("/auth/register");
    expect(options).toEqual({ skipAuthRetry: true });
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("email")).toBe(dto.email);
    expect(body.get("password")).toBe(dto.password);
    expect(body.get("nom")).toBe(dto.nom);
    expect(body.get("prenoms")).toBe(dto.prenoms);
    expect(body.get("telephone")).toBe(dto.telephone);
    expect(body.get("role")).toBe(dto.role);
    expect(body.get("photo")).toBe(photo);
    expect(result).toBe(authResponse);
  });

  it("register() sans telephone et avec une photo omet le champ telephone du FormData", async () => {
    postMock.mockResolvedValueOnce(authResponse);

    const dto = {
      email: "veilleur@example.com",
      password: "pw",
      nom: "Dupont",
      prenoms: "Jean",
      role: UserRole.VEILLEUR as const,
    };
    const photo = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    await register(dto, photo);

    const [, body] = postMock.mock.calls[0] as [string, FormData];
    expect(body.has("telephone")).toBe(false);
  });

  it("register() sans photo reste un POST JSON identique à avant (non-régression)", async () => {
    postMock.mockResolvedValueOnce(authResponse);

    const dto = {
      email: "adorateur@example.com",
      password: "pw",
      nom: "Dupont",
      prenoms: "Jean",
      telephone: "0612345678",
      role: UserRole.ADORATEUR as const,
    };
    await register(dto);

    expect(postMock).toHaveBeenCalledWith("/auth/register", dto, { skipAuthRetry: true });
  });

  it("logout() poste sur /auth/logout sans skipAuthRetry", async () => {
    postMock.mockResolvedValueOnce(undefined);

    await logout();

    expect(postMock).toHaveBeenCalledWith("/auth/logout");
  });

  it("refresh() poste sur /auth/refresh avec skipAuthRetry et sans body", async () => {
    postMock.mockResolvedValueOnce(undefined);

    await refresh();

    expect(postMock).toHaveBeenCalledWith("/auth/refresh", undefined, {
      skipAuthRetry: true,
    });
  });

  it("forgotPassword() poste sur /auth/forgot-password avec skipAuthRetry et retourne la réponse", async () => {
    postMock.mockResolvedValueOnce({ message: "Email envoyé si le compte existe." });

    const result = await forgotPassword({ email: "adorateur@example.com" });

    expect(postMock).toHaveBeenCalledWith(
      "/auth/forgot-password",
      { email: "adorateur@example.com" },
      { skipAuthRetry: true },
    );
    expect(result).toEqual({ message: "Email envoyé si le compte existe." });
  });

  it("resetPassword() poste sur /auth/reset-password avec skipAuthRetry", async () => {
    postMock.mockResolvedValueOnce(undefined);

    await resetPassword({ token: "tok-123", newPassword: "Azerty1!" });

    expect(postMock).toHaveBeenCalledWith(
      "/auth/reset-password",
      { token: "tok-123", newPassword: "Azerty1!" },
      { skipAuthRetry: true },
    );
  });
});
