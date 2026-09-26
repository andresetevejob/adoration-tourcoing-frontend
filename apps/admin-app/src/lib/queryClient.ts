import { QueryClient } from "@tanstack/react-query";

/**
 * Instance QueryClient partagée par l'app. Les erreurs 401/403 étant déjà gérées
 * par `api/client.ts` (refresh + redirection via `lib/navigation.ts`), les requêtes
 * ne sont pas retentées automatiquement par TanStack Query pour éviter de dupliquer
 * les tentatives de refresh/redirection.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
