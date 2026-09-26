import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, StatutValidation, type AuthResponse } from "@chapelle/shared/types";
import { login, logout, refresh, register } from "./auth";

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
});
