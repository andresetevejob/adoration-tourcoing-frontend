import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@chapelle/shared/ui";
import { router } from "./router";

function renderRouter() {
  // `/agenda` (public) monte réellement `usePlanning` (TanStack Query) : un
  // `QueryClientProvider` est nécessaire ici, comme dans `App.tsx`.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("router (user-app) — test de fumée", () => {
  afterEach(async () => {
    // Ramène le routeur singleton à un état neutre pour ne pas contaminer les autres
    // suites de tests qui importeraient `./router` (App.test.tsx notamment).
    await act(async () => {
      await router.navigate("/");
    });
  });

  it("rend la page d'accueil sur '/'", async () => {
    await act(async () => {
      await router.navigate("/");
    });
    renderRouter();

    expect(
      await screen.findByRole("heading", { name: /Chapelle du Vœux — Adoration Eucharistique/ }),
    ).toBeInTheDocument();
  });

  it("rend la page de connexion sur '/connexion'", async () => {
    await act(async () => {
      await router.navigate("/connexion");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Connexion" })).toBeInTheDocument();
  });

  it("rend la page d'inscription sur '/inscription'", async () => {
    await act(async () => {
      await router.navigate("/inscription");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Inscription" })).toBeInTheDocument();
  });

  it("rend Page404 sur une route inconnue", async () => {
    await act(async () => {
      await router.navigate("/route-inexistante");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Page introuvable" })).toBeInTheDocument();
  });

  it("rend PageAgenda (U2) sur '/agenda'", async () => {
    await act(async () => {
      await router.navigate("/agenda");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Agenda" })).toBeInTheDocument();
  });

  it("rend toujours un placeholder sur une route hors périmètre U1/U2 (ex. /actualites)", async () => {
    await act(async () => {
      await router.navigate("/actualites");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Actualités" })).toBeInTheDocument();
  });

  it("ProtectedRoute bloque l'accès non authentifié à /mon-compte et redirige vers /connexion", async () => {
    await act(async () => {
      await router.navigate("/mon-compte");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Connexion" })).toBeInTheDocument();
  });
});
