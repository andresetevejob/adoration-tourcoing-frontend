import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@chapelle/shared/ui";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { router } from "./router";
import { useAuthStore } from "./store/authStore";

const admin: UserResponse = {
  id: "a1",
  email: "admin@example.com",
  nom: "Curé",
  prenoms: "Michel",
  role: UserRole.ADMINISTRATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

const adorateur: UserResponse = {
  id: "u1",
  email: "adorateur@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function renderRouter() {
  // `/planning` (protégée) monte réellement `usePlanning` (TanStack Query) : un
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

describe("router (admin-app) — test de fumée", () => {
  afterEach(async () => {
    // Ramène le routeur singleton à un état neutre pour ne pas contaminer les autres
    // suites de tests qui importeraient `./router` (App.test.tsx notamment).
    useAuthStore.getState().clear();
    await act(async () => {
      await router.navigate("/connexion");
    });
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

  it("rend Page404 sur une route inconnue", async () => {
    await act(async () => {
      await router.navigate("/route-inexistante");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Page introuvable" })).toBeInTheDocument();
  });

  it("ProtectedRoute bloque l'accès non authentifié à '/' et redirige vers /connexion", async () => {
    await act(async () => {
      await router.navigate("/");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Connexion" })).toBeInTheDocument();
  });

  it("ProtectedRoute bloque l'accès non authentifié à /administrateurs et redirige vers /connexion", async () => {
    await act(async () => {
      await router.navigate("/administrateurs");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Connexion" })).toBeInTheDocument();
  });

  it("rend PageGestionUtilisateurs (U4) sur '/' pour un rôle autorisé", async () => {
    useAuthStore.getState().setUser(admin);
    await act(async () => {
      await router.navigate("/");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Gestion des utilisateurs" })).toBeInTheDocument();
  });

  it("rend PagePlanning (U2) sur '/planning' pour un rôle autorisé", async () => {
    useAuthStore.getState().setUser(admin);
    await act(async () => {
      await router.navigate("/planning");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Planning" })).toBeInTheDocument();
  });

  it("rend Page403 sur /non-autorise", async () => {
    await act(async () => {
      await router.navigate("/non-autorise");
    });
    renderRouter();

    expect(await screen.findByRole("heading", { name: "Accès non autorisé" })).toBeInTheDocument();
  });

  it("GuestRoute redirige un administrateur déjà authentifié loin de /connexion vers /", async () => {
    useAuthStore.getState().setUser(admin);
    await act(async () => {
      await router.navigate("/connexion");
    });
    act(() => {
      renderRouter();
    });

    expect(
      await screen.findByRole("heading", { name: "Gestion des utilisateurs" }),
    ).toBeInTheDocument();
  });

  it("GuestRoute redirige vers /non-autorise un utilisateur authentifié avec un rôle non prévu pour l'app", async () => {
    useAuthStore.getState().setUser(adorateur);
    await act(async () => {
      await router.navigate("/connexion");
    });
    act(() => {
      renderRouter();
    });

    expect(await screen.findByRole("heading", { name: "Accès non autorisé" })).toBeInTheDocument();
  });

  it("GuestRoute redirige un administrateur déjà authentifié loin de /mot-de-passe-oublie vers /", async () => {
    useAuthStore.getState().setUser(admin);
    await act(async () => {
      await router.navigate("/mot-de-passe-oublie");
    });
    act(() => {
      renderRouter();
    });

    expect(
      await screen.findByRole("heading", { name: "Gestion des utilisateurs" }),
    ).toBeInTheDocument();
  });

  it("GuestRoute redirige un administrateur déjà authentifié loin de /reinitialiser-mot-de-passe vers /", async () => {
    useAuthStore.getState().setUser(admin);
    await act(async () => {
      await router.navigate("/reinitialiser-mot-de-passe");
    });
    act(() => {
      renderRouter();
    });

    expect(
      await screen.findByRole("heading", { name: "Gestion des utilisateurs" }),
    ).toBeInTheDocument();
  });
});
