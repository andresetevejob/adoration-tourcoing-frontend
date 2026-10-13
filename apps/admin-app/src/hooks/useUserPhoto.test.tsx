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

describe("hooks/useUserPhoto (admin-app)", () => {
  // jsdom ne définit pas `URL.createObjectURL`/`URL.revokeObjectURL` par défaut : on les
  // installe une seule fois pour tout le fichier (`beforeAll`/`afterAll`) plutôt qu'à
  // chaque test, pour ne pas les retirer avant le nettoyage automatique de
  // `@testing-library/react` (son `afterEach` de démontage s'exécute après celui déclaré
  // ici, et appelle l'effet de nettoyage du hook qui invoque `URL.revokeObjectURL`).
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

  it("ne déclenche aucun appel réseau quand hasPhoto est false", () => {
    const { result } = renderHook(() => useUserPhoto("u1", false), { wrapper });

    expect(getUserPhoto).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("appelle getUserPhoto et retourne une URL objet construite via URL.createObjectURL", async () => {
    const fakeBlob = new Blob(["contenu"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockResolvedValueOnce(fakeBlob);

    const { result } = renderHook(() => useUserPhoto("u1", true), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(getUserPhoto).toHaveBeenCalledWith("u1");
    expect(URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
    expect(result.current.data).toBe("blob:fake-url");
  });

  it("révoque l'URL objet précédente au démontage", async () => {
    const fakeBlob = new Blob(["contenu"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockResolvedValueOnce(fakeBlob);

    const { result, unmount } = renderHook(() => useUserPhoto("u1", true), { wrapper });

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

    const { result, rerender } = renderHook(({ userId }) => useUserPhoto(userId, true), {
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

  it("revisite A→B→A (cache TanStack Query réutilisé) : ne resservit jamais une URL objet déjà révoquée", async () => {
    const blobA = new Blob(["A"], { type: "image/jpeg" });
    const blobB = new Blob(["B"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockImplementation((userId: string) =>
      Promise.resolve(userId === "A" ? blobA : blobB),
    );
    vi.mocked(URL.createObjectURL)
      .mockReturnValueOnce("blob:a-url-1")
      .mockReturnValueOnce("blob:b-url")
      .mockReturnValueOnce("blob:a-url-2");

    const { result, rerender } = renderHook(({ userId }) => useUserPhoto(userId, true), {
      wrapper,
      initialProps: { userId: "A" },
    });

    // 1. Première visite de A : URL objet valide.
    await waitFor(() => {
      expect(result.current.data).toBe("blob:a-url-1");
    });
    expect(getUserPhoto).toHaveBeenCalledTimes(1);

    // 2. Passage à B : révoque l'URL de A, retourne une URL valide pour B.
    rerender({ userId: "B" });

    await waitFor(() => {
      expect(result.current.data).toBe("blob:b-url");
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:a-url-1");

    // 3. Retour à A (dans la fenêtre de cache TanStack Query, sans démontage) : le hook doit
    // produire une URL fraîche, jamais resservir "blob:a-url-1" (déjà révoquée à l'étape 2).
    rerender({ userId: "A" });

    await waitFor(() => {
      expect(result.current.data).toBe("blob:a-url-2");
    });
    expect(result.current.data).not.toBe("blob:a-url-1");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:b-url");
  });
});
