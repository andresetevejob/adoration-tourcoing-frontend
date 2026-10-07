import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { router } from "./router";
import { useAuthStore } from "./store/authStore";

const adorateur: UserResponse = {
  id: "u1",
  email: "adorateur@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

const administrateur: UserResponse = {
  id: "a1",
  email: "admin@example.com",
  nom: "Curé",
  prenoms: "Michel",
  role: UserRole.ADMINISTRATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

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
    // Ramène le routeur singleton (et le store d'auth) à un état neutre pour ne pas
    // contaminer les autres suites de tests qui importeraient `./router` (App.test.tsx
    // notamment).
    useAuthStore.getState().clear();
    await act(async () => {
      await router.navigate("/");
    });
  });

  it("rend la page d'accueil (U8) sur '/'", async () => {
    await act(async () => {
      await router.navigate("/");
    });
    renderRouter();

    expect(
      await screen.findByRole("heading", { name: /Un cœur qui bat/, level: 1 }),
    ).toBeInTheDocument();
  });

  it("rend la page de connexion sur '/connexion'", async () => {
    await act(async () => {
      await router.navigate("/connexion");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Connexion" })).toBeInTheDocument();
  });

  it("rend PageMotDePasseOublie sur '/mot-de-passe-oublie'", async () => {
    await act(async () => {
      await router.navigate("/mot-de-passe-oublie");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Mot de passe oublié" })).toBeInTheDocument();
  });

  it("rend PageReinitialisationMotDePasse sur '/reinitialiser-mot-de-passe'", async () => {
    await act(async () => {
      await router.navigate("/reinitialiser-mot-de-passe");
    });
    renderRouter();

    expect(
      await screen.findByRole("heading", { name: "Réinitialisation du mot de passe" }),
    ).toBeInTheDocument();
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

  it("rend PageActualites (U6) sur '/actualites'", async () => {
    await act(async () => {
      await router.navigate("/actualites");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Actualités" })).toBeInTheDocument();
  });

  it("rend PageContact (U7) sur '/contact'", async () => {
    await act(async () => {
      await router.navigate("/contact");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Contact", level: 1 })).toBeInTheDocument();
  });

  it("rend PageQuiSommesNous (U8) sur '/qui-sommes-nous'", async () => {
    await act(async () => {
      await router.navigate("/qui-sommes-nous");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Qui sommes-nous ?", level: 1 })).toBeInTheDocument();
  });

  it("ProtectedRoute bloque l'accès non authentifié à /mon-compte et redirige vers /connexion", async () => {
    await act(async () => {
      await router.navigate("/mon-compte");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Connexion" })).toBeInTheDocument();
  });

  it("GuestRoute redirige un utilisateur déjà authentifié loin de /connexion vers /", async () => {
    useAuthStore.getState().setUser(adorateur);
    await act(async () => {
      await router.navigate("/connexion");
    });
    act(() => {
      renderRouter();
    });

    expect(
      await screen.findByRole("heading", { name: /Un cœur qui bat/, level: 1 }),
    ).toBeInTheDocument();
  });

  it("GuestRoute redirige un utilisateur déjà authentifié loin de /inscription vers /", async () => {
    useAuthStore.getState().setUser(adorateur);
    await act(async () => {
      await router.navigate("/inscription");
    });
    act(() => {
      renderRouter();
    });

    expect(
      await screen.findByRole("heading", { name: /Un cœur qui bat/, level: 1 }),
    ).toBeInTheDocument();
  });

  it("GuestRoute redirige un utilisateur déjà authentifié loin de /inscription/confirmation vers /", async () => {
    useAuthStore.getState().setUser(adorateur);
    await act(async () => {
      await router.navigate("/inscription/confirmation");
    });
    act(() => {
      renderRouter();
    });

    expect(
      await screen.findByRole("heading", { name: /Un cœur qui bat/, level: 1 }),
    ).toBeInTheDocument();
  });

  it("GuestRoute redirige vers /non-autorise un utilisateur authentifié avec un rôle non prévu pour l'app", async () => {
    useAuthStore.getState().setUser(administrateur);
    await act(async () => {
      await router.navigate("/connexion");
    });
    act(() => {
      renderRouter();
    });

    expect(await screen.findByRole("heading", { name: "Accès non autorisé" })).toBeInTheDocument();
  });

  it("GuestRoute redirige un utilisateur déjà authentifié loin de /mot-de-passe-oublie vers /", async () => {
    useAuthStore.getState().setUser(adorateur);
    await act(async () => {
      await router.navigate("/mot-de-passe-oublie");
    });
    act(() => {
      renderRouter();
    });

    expect(
      await screen.findByRole("heading", { name: /Un cœur qui bat/, level: 1 }),
    ).toBeInTheDocument();
  });

  it("GuestRoute redirige un utilisateur déjà authentifié loin de /reinitialiser-mot-de-passe vers /", async () => {
    useAuthStore.getState().setUser(adorateur);
    await act(async () => {
      await router.navigate("/reinitialiser-mot-de-passe");
    });
    act(() => {
      renderRouter();
    });

    expect(
      await screen.findByRole("heading", { name: /Un cœur qui bat/, level: 1 }),
    ).toBeInTheDocument();
  });
});
