# Méthodes des composants — signatures de haut niveau

*Les règles métier détaillées (contraintes de délai, chevauchement, etc.) seront définies dans la Conception fonctionnelle par unité (Construction). Ce document fixe les signatures et types d'entrée/sortie.*

## `packages/shared/api` — SharedApiClient

```typescript
function createApiClient(baseURL: string): ApiClient;

interface ApiClient {
  get<T>(path: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T = void>(path: string, options?: RequestOptions): Promise<T>;
}

interface RequestOptions {
  signal?: AbortSignal;      // par défaut : AbortController interne, timeout 15s
  skipAuthRetry?: boolean;   // true pour /auth/login, /auth/register, /auth/refresh (cf. NFR sécurité)
}

class ApiError extends Error {
  code: string;
  status: number;
  message: string;
}
```

## `packages/shared/utils` — validators (Zod, extraits)

```typescript
const emailSchema: ZodString;
const passwordSchema: ZodString; // min 8, 1 chiffre, 1 caractère spécial (pattern swagger)
const telephoneSchema: ZodOptional<ZodString>; // ^\+?[0-9]{10,15}$
const registerSchema: ZodObject; // RegisterRequest + confirmPassword (front-only, .refine())
const loginSchema: ZodObject;
const bookingSchema: ZodObject; // dateDebut < dateFin, dateDebut >= now
```

## `apps/*/store/authStore.ts` — AuthStore (Zustand, une instance par app)

```typescript
interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser(user: UserResponse | null): void;
  clear(): void;
}
```

## `apps/*/hooks/useAuth.ts`

```typescript
function useAuth(): {
  user: UserResponse | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login(dto: LoginRequest): Promise<void>;   // appelle auth.ts login(), setUser au succès
  register(dto: RegisterRequest): Promise<AuthResponse>; // user-app uniquement
  logout(): Promise<void>;
};
```

## `apps/*/hooks/usePlanning.ts`

```typescript
function usePlanning(params: { date?: string; page?: number; size?: number }): UseQueryResult<PageResponse<PlanningEntryResponse>>;
// TanStack Query, staleTime 60s, queryKey ["planning", params]
```

## `apps/*/hooks/useBookings.ts`

```typescript
function useBookings(params?: { utilisateurId?: string; from?: string; to?: string; page?: number; size?: number }): UseQueryResult<PageResponse<BookingResponse>>;
function useCreateBooking(): UseMutationResult<BookingResponse, ApiError, CreateBookingRequest>;
function useCancelBooking(): UseMutationResult<void, ApiError, string /* id */>;
// Les mutations invalident la queryKey ["planning"] et ["bookings"] au succès
```

## `apps/admin-app/hooks/useUsers.ts`

```typescript
function useUsers(filters: UserListFilters & { page: number; size: number }): UseQueryResult<SpringPage<UserResponse>>;
function useCreateUser(): UseMutationResult<UserResponse, ApiError, CreateUserRequest>;
function useUpdateUser(): UseMutationResult<UserResponse, ApiError, { id: string; dto: UpdateUserRequest }>;
function useDeleteUser(): UseMutationResult<void, ApiError, string /* id */>;
function useValiderUser(): UseMutationResult<UserResponse, ApiError, string /* id */>;
function useRejeterUser(): UseMutationResult<UserResponse, ApiError, string /* id */>;
```

## `apps/*/hooks/useAnnonces.ts` *(⚠️ mock MSW)*

```typescript
function useAnnonces(filters?: { statut?: StatutAnnonce }): UseQueryResult<AnnonceResponse[]>;
function useCreateAnnonce(): UseMutationResult<AnnonceResponse, ApiError, AnnonceCreateRequest>; // admin-app
function useUpdateAnnonce(): UseMutationResult<AnnonceResponse, ApiError, { id: string; dto: Partial<AnnonceCreateRequest> }>; // admin-app
function useDeleteAnnonce(): UseMutationResult<void, ApiError, string>; // admin-app
function usePublishAnnonce(): UseMutationResult<AnnonceResponse, ApiError, { id: string; statut: StatutAnnonce }>; // admin-app
```

## `apps/user-app/api/endpoints/contact.ts` *(⚠️ mock MSW)*

```typescript
function sendContactMessage(dto: { nom: string; email: string; sujet: string; message: string }): Promise<void>;
```

## `components/auth/ProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}
// Non connecté -> redirect /connexion (avec `state.from`) ; rôle non autorisé -> redirect /non-autorise
```
