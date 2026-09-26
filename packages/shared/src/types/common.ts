export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Forme JSON `{code, message}` du swagger. Renommée `ApiErrorPayload` pour
 * éviter la collision avec la classe `ApiError extends Error` de `@chapelle/shared/api`
 * (décision d'orchestrateur, point ouvert n°3 de la conception U0).
 */
export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface PageableParams {
  page: number;
  size: number;
  sort?: string[];
}
