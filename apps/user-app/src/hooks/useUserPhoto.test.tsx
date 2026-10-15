import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { getUserPhoto } from "../api/endpoints/users";
import { useUserPhoto } from "./useUserPhoto";

vi.mock("../api/endpoints/users", () => ({
  getUserPhoto: vi.fn(),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/useUserPhoto (user-app)", () => {
  // jsdom ne définit pas `URL.createObjectURL`/`URL.revokeObjectURL` par défaut (cf.
  // équivalent admin-app, `apps/admin-app/src/hooks/useUserPhoto.test.tsx`).
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeAll(() => {
    URL.createObjectURL = vi.fn();
    URL.revokeObjectURL = vi.fn();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  beforeEach(() => {
    vi.mocked(URL.createObjectURL).mockReset().mockReturnValue("blob:fake-url");
    vi.mocked(URL.revokeObjectURL).mockReset();
  });

  afterEach(() => {
    vi.mocked(getUserPhoto).mockReset();
  });

  it("appelle systématiquement getUserPhoto (pas de garde hasPhoto/enabled, contrairement à l'admin-app) et retourne une URL objet construite via URL.createObjectURL", async () => {
    const fakeBlob = new Blob(["contenu"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockResolvedValueOnce(fakeBlob);

    const { result } = renderHook(() => useUserPhoto("u1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(getUserPhoto).toHaveBeenCalledWith("u1");
    expect(URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
    expect(result.current.data).toBe("blob:fake-url");
  });

  it("révoque l'URL objet au démontage", async () => {
    const fakeBlob = new Blob(["contenu"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockResolvedValueOnce(fakeBlob);

    const { result, unmount } = renderHook(() => useUserPhoto("u1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });

  it("révoque l'ancienne URL objet quand la donnée change (nouvel userId)", async () => {
    const firstBlob = new Blob(["premiere"], { type: "image/jpeg" });
    const secondBlob = new Blob(["seconde"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockResolvedValueOnce(firstBlob).mockResolvedValueOnce(secondBlob);
    vi.mocked(URL.createObjectURL)
      .mockReturnValueOnce("blob:first-url")
      .mockReturnValueOnce("blob:second-url");

    const { result, rerender } = renderHook(({ userId }) => useUserPhoto(userId), {
      wrapper,
      initialProps: { userId: "u1" },
    });

    await waitFor(() => {
      expect(result.current.data).toBe("blob:first-url");
    });

    rerender({ userId: "u2" });

    await waitFor(() => {
      expect(result.current.data).toBe("blob:second-url");
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first-url");
  });

  it("dégradation silencieuse : data reste undefined (pas d'URL objet créée) quand getUserPhoto échoue (404/403), sans relancer de tentative (retry: false)", async () => {
    vi.mocked(getUserPhoto).mockRejectedValueOnce(new Error("404 Not Found"));

    const { result } = renderHook(() => useUserPhoto("u1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    // `retry: false` : un seul appel, jamais retenté (ni pour un 404 "pas de photo",
    // issue courante, ni pour un 403 "autre Veilleur", cf. design.md §3.2).
    expect(getUserPhoto).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBeUndefined();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("hasPhoto = false : n'appelle jamais getUserPhoto (enabled: false) et data reste undefined sans jamais passer par isLoading/isError", () => {
    const { result } = renderHook(() => useUserPhoto("u1", false), { wrapper });

    // Pas de `waitFor` sur une transition d'état : la requête est désactivée, il n'y a
    // rien à attendre — on vérifie l'état stable immédiatement après le rendu.
    expect(getUserPhoto).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("ne lit/n'expose jamais query.error de façon particulière aux appelants : seul `data` conditionne l'affichage (dégradation silencieuse par construction)", async () => {
    const error = new Error("403 Forbidden");
    vi.mocked(getUserPhoto).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useUserPhoto("u1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    // Le champ `error` reste disponible via le spread de `UseQueryResult` (non masqué),
    // mais aucun composant de cette proposition ne le lit — `data` (seul champ consommé
    // par `ReservationCard`/les modales) est bien `undefined`.
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeUndefined();
  });
});
