import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, StatutValidation, type AuthResponse } from "@chapelle/shared/types";
import { login, logout, refresh } from "./auth";

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
    email: "admin@example.com",
    nom: "Curé",
    prenoms: "Michel",
    role: UserRole.ADMINISTRATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
  },
  authenticatedAt: "2026-01-01T00:00:00Z",
};

describe("api/endpoints/auth (admin-app)", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("login() poste sur /auth/login avec skipAuthRetry", async () => {
    postMock.mockResolvedValueOnce(authResponse);

    const result = await login({ email: "admin@example.com", password: "pw" });

    expect(postMock).toHaveBeenCalledWith(
      "/auth/login",
      { email: "admin@example.com", password: "pw" },
      { skipAuthRetry: true },
    );
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
