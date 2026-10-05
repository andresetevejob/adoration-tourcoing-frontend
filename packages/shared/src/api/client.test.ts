import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./client";

interface FakeResponseInit {
  status: number;
  body?: unknown;
  statusText?: string;
  jsonThrows?: boolean;
}

function fakeResponse({
  status,
  body,
  statusText = "",
  jsonThrows = false,
}: FakeResponseInit): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: vi.fn(() => {
      if (jsonThrows) return Promise.reject(new Error("corps non JSON"));
      return Promise.resolve(body);
    }),
  } as unknown as Response;
}

describe("createApiClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe("requêtes de base", () => {
    it("effectue un GET avec credentials include et Content-Type JSON", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, body: { id: "1" } }));
      const client = createApiClient("http://api.test");

      const result = await client.get<{ id: string }>("/users/1");

      expect(result).toEqual({ id: "1" });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("http://api.test/users/1");
      expect(init.method).toBe("GET");
      expect(init.credentials).toBe("include");
      expect(init.headers).toEqual({ "Content-Type": "application/json" });
      expect(init.body).toBeUndefined();
    });

    it("sérialise les query params à plat, ignore undefined/null, répète les tableaux", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, body: [] }));
      const client = createApiClient("http://api.test");

      await client.get("/bookings", {
        page: 0,
        size: 20,
        sort: ["dateDebut,asc", "dateFin,desc"],
        actif: true,
        ignore: undefined,
        ignoreNull: null,
      });

      const [url] = fetchMock.mock.calls[0] as [string];
      expect(url).toBe(
        "http://api.test/bookings?page=0&size=20&sort=dateDebut%2Casc&sort=dateFin%2Cdesc&actif=true",
      );
    });

    it("n'ajoute pas de query string si aucun paramètre n'est fourni", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, body: [] }));
      const client = createApiClient("http://api.test");

      await client.get("/annonces");

      const [url] = fetchMock.mock.calls[0] as [string];
      expect(url).toBe("http://api.test/annonces");
    });

    it("envoie le body JSON.stringify sur POST", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 201, body: { id: "42" } }));
      const client = createApiClient("http://api.test");

      const result = await client.post<{ id: string }>("/bookings", { dateDebut: "2026-01-01" });

      expect(result).toEqual({ id: "42" });
      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe("POST");
      expect(init.body).toBe(JSON.stringify({ dateDebut: "2026-01-01" }));
    });

    it("envoie le body JSON.stringify sur PUT", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, body: { id: "42" } }));
      const client = createApiClient("http://api.test");

      await client.put("/bookings/42", { description: "modifié" });

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe("PUT");
      expect(init.body).toBe(JSON.stringify({ description: "modifié" }));
    });

    it("envoie un corps FormData tel quel, sans fixer de Content-Type", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 201, body: { id: "42" } }));
      const client = createApiClient("http://api.test");
      const formData = new FormData();
      formData.append("email", "veilleur@example.com");
      formData.append("photo", new File(["contenu"], "photo.jpg", { type: "image/jpeg" }));

      const result = await client.post<{ id: string }>("/users", formData);

      expect(result).toEqual({ id: "42" });
      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe("POST");
      expect(init.body).toBe(formData);
      expect(init.headers).toBeUndefined();
    });

    it("continue d'envoyer du JSON avec Content-Type quand le body n'est pas un FormData", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, body: { id: "1" } }));
      const client = createApiClient("http://api.test");

      await client.put("/users/1", { email: "a@b.com" });

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.headers).toEqual({ "Content-Type": "application/json" });
      expect(init.body).toBe(JSON.stringify({ email: "a@b.com" }));
    });

    it("effectue un DELETE sans body et retourne undefined sur 204", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 204 }));
      const client = createApiClient("http://api.test");

      await expect(client.delete("/bookings/42")).resolves.toBeUndefined();

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe("DELETE");
      expect(init.body).toBeUndefined();
    });
  });

  describe("gestion des erreurs", () => {
    it("lève une ApiError avec code/message dérivés du corps JSON (contrat ErrorResponse backend) en cas d'échec", async () => {
      fetchMock.mockResolvedValueOnce(
        fakeResponse({
          status: 400,
          body: {
            status: 400,
            error: "Bad Request",
            message: "Champ requis",
            details: [],
            timestamp: "2026-01-01T00:00:00Z",
            path: "/bookings",
          },
        }),
      );
      const client = createApiClient("http://api.test");

      await expect(client.post("/bookings", {})).rejects.toMatchObject({
        name: "ApiError",
        code: "Bad Request",
        status: 400,
        message: "Champ requis",
      });
    });

    it("retombe sur UNKNOWN_ERROR/statusText quand le corps n'est pas du JSON exploitable", async () => {
      fetchMock.mockResolvedValueOnce(
        fakeResponse({ status: 500, statusText: "Internal Server Error", jsonThrows: true }),
      );
      const client = createApiClient("http://api.test");

      await expect(client.get("/boom")).rejects.toMatchObject({
        code: "UNKNOWN_ERROR",
        status: 500,
        message: "Internal Server Error",
      });
    });

    it("l'erreur levée est bien une instance d'ApiError", async () => {
      fetchMock.mockResolvedValueOnce(
        fakeResponse({ status: 404, body: { error: "Not Found", message: "Absent" } }),
      );
      const client = createApiClient("http://api.test");

      await expect(client.get("/missing")).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("401 et retry via /auth/refresh", () => {
    it("rejoue la requête une fois après un refresh réussi", async () => {
      fetchMock
        .mockResolvedValueOnce(
          fakeResponse({ status: 401, body: { error: "Unauthorized", message: "Expiré" } }),
        )
        .mockResolvedValueOnce(fakeResponse({ status: 200, body: {} }))
        .mockResolvedValueOnce(fakeResponse({ status: 200, body: { id: "1" } }));

      const client = createApiClient("http://api.test");
      const result = await client.get<{ id: string }>("/protege");

      expect(result).toEqual({ id: "1" });
      expect(fetchMock).toHaveBeenCalledTimes(3);
      const [refreshUrl, refreshInit] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect(refreshUrl).toBe("http://api.test/auth/refresh");
      expect(refreshInit.method).toBe("POST");
      const [retryUrl, retryInit] = fetchMock.mock.calls[2] as [string, RequestInit];
      expect(retryUrl).toBe("http://api.test/protege");
      expect(retryInit.method).toBe("GET");
    });

    it("rejoue un corps FormData tel quel (non consommé) après un refresh réussi, toujours sans Content-Type", async () => {
      fetchMock
        .mockResolvedValueOnce(
          fakeResponse({ status: 401, body: { error: "Unauthorized", message: "Expiré" } }),
        )
        .mockResolvedValueOnce(fakeResponse({ status: 200, body: {} }))
        .mockResolvedValueOnce(fakeResponse({ status: 201, body: { id: "42" } }));

      const client = createApiClient("http://api.test");
      const formData = new FormData();
      formData.append("email", "veilleur@example.com");
      formData.append("photo", new File(["contenu"], "photo.jpg", { type: "image/jpeg" }));

      const result = await client.post<{ id: string }>("/users", formData);

      expect(result).toEqual({ id: "42" });
      expect(fetchMock).toHaveBeenCalledTimes(3);
      const [firstUrl, firstInit] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(firstUrl).toBe("http://api.test/users");
      expect(firstInit.body).toBe(formData);
      expect(firstInit.headers).toBeUndefined();
      const [retryUrl, retryInit] = fetchMock.mock.calls[2] as [string, RequestInit];
      expect(retryUrl).toBe("http://api.test/users");
      expect(retryInit.method).toBe("POST");
      expect(retryInit.body).toBe(formData);
      expect(retryInit.headers).toBeUndefined();
    });

    it("appelle onUnauthorized et lève l'erreur originale si le refresh échoue", async () => {
      fetchMock
        .mockResolvedValueOnce(
          fakeResponse({ status: 401, body: { error: "Unauthorized", message: "Expiré" } }),
        )
        .mockResolvedValueOnce(
          fakeResponse({ status: 401, body: { error: "Unauthorized", message: "Refresh KO" } }),
        );

      const onUnauthorized = vi.fn();
      const client = createApiClient("http://api.test", { onUnauthorized });

      await expect(client.get("/protege")).rejects.toMatchObject({
        code: "Unauthorized",
        message: "Expiré",
        status: 401,
      });
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("appelle onForbidden (pas onUnauthorized) et propage l'erreur de la relance quand le refresh réussit mais la relance échoue en 403", async () => {
      fetchMock
        .mockResolvedValueOnce(
          fakeResponse({ status: 401, body: { error: "Unauthorized", message: "Expiré" } }),
        )
        .mockResolvedValueOnce(fakeResponse({ status: 200, body: {} }))
        .mockResolvedValueOnce(
          fakeResponse({ status: 403, body: { error: "Forbidden", message: "Interdit" } }),
        );

      const onUnauthorized = vi.fn();
      const onForbidden = vi.fn();
      const client = createApiClient("http://api.test", { onUnauthorized, onForbidden });

      await expect(client.get("/protege")).rejects.toMatchObject({
        code: "Forbidden",
        message: "Interdit",
        status: 403,
      });
      expect(onForbidden).toHaveBeenCalledTimes(1);
      expect(onUnauthorized).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("ne tente pas de refresh et n'appelle pas onUnauthorized quand skipAuthRetry est activé", async () => {
      fetchMock.mockResolvedValueOnce(
        fakeResponse({
          status: 401,
          body: { error: "Unauthorized", message: "Identifiants invalides" },
        }),
      );
      const onUnauthorized = vi.fn();
      const client = createApiClient("http://api.test", { onUnauthorized });

      await expect(
        client.post("/auth/login", { email: "a@b.com" }, { skipAuthRetry: true }),
      ).rejects.toMatchObject({ code: "Unauthorized", status: 401 });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it("ne plante pas quand aucun hook n'est fourni", async () => {
      fetchMock.mockResolvedValueOnce(
        fakeResponse({ status: 401, body: { error: "X", message: "Y" } }),
      );
      const client = createApiClient("http://api.test");

      await expect(client.post("/auth/login", {}, { skipAuthRetry: true })).rejects.toMatchObject({
        code: "X",
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("403 Forbidden", () => {
    it("appelle onForbidden et lève l'ApiError", async () => {
      fetchMock.mockResolvedValueOnce(
        fakeResponse({ status: 403, body: { error: "Forbidden", message: "Interdit" } }),
      );
      const onForbidden = vi.fn();
      const client = createApiClient("http://api.test", { onForbidden });

      await expect(client.delete("/admin/users/1")).rejects.toMatchObject({
        code: "Forbidden",
        status: 403,
      });
      expect(onForbidden).toHaveBeenCalledTimes(1);
    });

    it("n'appelle pas onForbidden quand skipForbiddenRedirect est activé, mais lève quand même l'ApiError", async () => {
      fetchMock.mockResolvedValueOnce(
        fakeResponse({ status: 403, body: { error: "CANCELLATION_DEADLINE_EXCEEDED", message: "Délai dépassé" } }),
      );
      const onForbidden = vi.fn();
      const client = createApiClient("http://api.test", { onForbidden });

      await expect(
        client.delete("/bookings/1", { skipForbiddenRedirect: true }),
      ).rejects.toMatchObject({
        code: "CANCELLATION_DEADLINE_EXCEEDED",
        status: 403,
      });
      expect(onForbidden).not.toHaveBeenCalled();
    });
  });

  describe("timeout et signal", () => {
    it("utilise le signal fourni sans créer de contrôleur interne", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, body: {} }));
      const controller = new AbortController();
      const client = createApiClient("http://api.test");

      await client.get("/annonces", undefined, { signal: controller.signal });

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.signal).toBe(controller.signal);
    });

    it("abandonne la requête après le timeout par défaut de 15s quand aucun signal n'est fourni", async () => {
      vi.useFakeTimers();
      fetchMock.mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      );

      const client = createApiClient("http://api.test");
      const pending = client.get("/lent");
      const expectation = expect(pending).rejects.toThrow();

      await vi.advanceTimersByTimeAsync(15000);
      await expectation;
    });
  });
});
