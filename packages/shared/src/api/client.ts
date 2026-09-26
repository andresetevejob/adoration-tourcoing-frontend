import { API_TIMEOUT_MS } from "../utils/constants";

const REFRESH_PATH = "/auth/refresh";

export interface RequestOptions {
  signal?: AbortSignal;
  skipAuthRetry?: boolean;
}

export interface ApiClientHooks {
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}

export interface ApiClient {
  get<T>(path: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T = void>(path: string, options?: RequestOptions): Promise<T>;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function stringifyQueryValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, stringifyQueryValue(item));
    } else {
      search.append(key, stringifyQueryValue(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function parseErrorBody(response: Response): Promise<{ code: string; message: string }> {
  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "code" in body &&
      "message" in body &&
      typeof (body as { code: unknown }).code === "string" &&
      typeof (body as { message: unknown }).message === "string"
    ) {
      return { code: (body as { code: string }).code, message: (body as { message: string }).message };
    }
  } catch {
    // corps non JSON ou vide : on retombe sur le statusText
  }
  return { code: "UNKNOWN_ERROR", message: response.statusText || "Erreur inconnue" };
}

export function createApiClient(baseURL: string, hooks?: ApiClientHooks): ApiClient {
  async function request<T>(
    method: string,
    path: string,
    body: unknown,
    options?: RequestOptions,
    isRetry = false,
    isInternalRefresh = false,
  ): Promise<T> {
    const controller = options?.signal ? undefined : new AbortController();
    const timeoutId = controller
      ? setTimeout(() => {
          controller.abort();
        }, API_TIMEOUT_MS)
      : undefined;

    let response: Response;
    try {
      response = await fetch(`${baseURL}${path}`, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: options?.signal ?? controller?.signal,
      });
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }

    if (!response.ok) {
      if (response.status === 401 && !options?.skipAuthRetry && !isRetry) {
        try {
          await request(
            "POST",
            REFRESH_PATH,
            undefined,
            { skipAuthRetry: true },
            false,
            true,
          );
        } catch {
          hooks?.onUnauthorized?.();
          const { code, message } = await parseErrorBody(response);
          throw new ApiError(code, response.status, message);
        }
        return await request<T>(method, path, body, options, true);
      }

      if (response.status === 401 && !isInternalRefresh) {
        hooks?.onUnauthorized?.();
      }
      if (response.status === 403) {
        hooks?.onForbidden?.();
      }

      const { code, message } = await parseErrorBody(response);
      throw new ApiError(code, response.status, message);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  return {
    get<T>(path: string, params?: Record<string, unknown>, options?: RequestOptions) {
      return request<T>("GET", `${path}${buildQueryString(params)}`, undefined, options);
    },
    post<T>(path: string, body?: unknown, options?: RequestOptions) {
      return request<T>("POST", path, body, options);
    },
    put<T>(path: string, body?: unknown, options?: RequestOptions) {
      return request<T>("PUT", path, body, options);
    },
    delete<T = void>(path: string, options?: RequestOptions) {
      return request<T>("DELETE", path, undefined, options);
    },
  };
}
