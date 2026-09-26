import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clearMock = vi.fn();
const navigateMock = vi.fn<(to: string, options?: { replace?: boolean }) => void>();

vi.mock("../lib/navigation", () => ({
  navigate: (...args: Parameters<typeof navigateMock>) => {
    navigateMock(...args);
  },
}));

vi.mock("../store/authStore", () => ({
  useAuthStore: { getState: () => ({ clear: clearMock }) },
}));

interface FakeResponseInit {
  status: number;
  body?: unknown;
}

function fakeResponse({ status, body }: FakeResponseInit): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("apiClient (user-app)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    clearMock.mockClear();
    navigateMock.mockClear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("appelle clear() puis navigate('/connexion', { replace: true }) sur 401 quand le refresh échoue", async () => {
    fetchMock
      .mockResolvedValueOnce(
        fakeResponse({ status: 401, body: { code: "UNAUTHORIZED", message: "Expiré" } }),
      )
      .mockResolvedValueOnce(
        fakeResponse({ status: 401, body: { code: "UNAUTHORIZED", message: "Refresh KO" } }),
      );

    const { apiClient } = await import("./client");

    await expect(apiClient.get("/mon-compte")).rejects.toMatchObject({ status: 401 });

    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/connexion", { replace: true });
  });

  it("n'appelle pas onUnauthorized sur un 401 avec skipAuthRetry (ex. /auth/login)", async () => {
    fetchMock.mockResolvedValueOnce(
      fakeResponse({ status: 401, body: { code: "BAD_CREDENTIALS", message: "Identifiants invalides" } }),
    );

    const { apiClient } = await import("./client");

    await expect(
      apiClient.post("/auth/login", { email: "a@b.com" }, { skipAuthRetry: true }),
    ).rejects.toMatchObject({ status: 401 });

    expect(clearMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("appelle navigate('/non-autorise', { replace: true }) sans clear() sur 403", async () => {
    fetchMock.mockResolvedValueOnce(
      fakeResponse({ status: 403, body: { code: "FORBIDDEN", message: "Interdit" } }),
    );

    const { apiClient } = await import("./client");

    await expect(apiClient.delete("/admin/1")).rejects.toMatchObject({ status: 403 });

    expect(navigateMock).toHaveBeenCalledWith("/non-autorise", { replace: true });
    expect(clearMock).not.toHaveBeenCalled();
  });
});
