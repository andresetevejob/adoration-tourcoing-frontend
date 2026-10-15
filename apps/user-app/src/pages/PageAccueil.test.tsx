import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@chapelle/shared/mocks/server";
import PageAccueil from "./PageAccueil";

/**
 * Pas de `vi.mock` sur `useAnnonces` : `apiClient` réel, intercepté par le serveur MSW
 * global (même patron que `PageActualites.test.tsx`, U6).
 */
function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PageAccueil />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("pages/PageAccueil (user-app)", () => {
  it("affiche le hero et les CTA vers des routes réelles", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: /Un cœur qui bat.*pour le monde/s, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Devenir veilleur" })).toHaveAttribute("href", "/inscription");
    expect(screen.getByRole("link", { name: "Découvrir l'actualité" })).toHaveAttribute("href", "/actualites");
  });

  it("affiche les dernières annonces publiées (statut PUBLIE du seed)", async () => {
    renderPage();

    expect(await screen.findByText("Nouveaux horaires d'adoration")).toBeInTheDocument();
    expect(screen.queryByText("Retraite spirituelle d'été")).not.toBeInTheDocument();
  });

  it("affiche un message d'erreur si le chargement des actualités échoue", async () => {
    server.use(
      http.get("*/annonces", () => HttpResponse.json({ code: "SERVER_ERROR", message: "Erreur" }, { status: 500 })),
    );

    renderPage();

    expect(await screen.findByRole("alert", undefined, { timeout: 3000 })).toHaveTextContent(
      "Impossible de charger les actualités. Veuillez réessayer plus tard.",
    );
  });

  it("affiche le message vide si aucune annonce publiée", async () => {
    server.use(http.get("*/annonces", () => HttpResponse.json([])));

    renderPage();

    expect(await screen.findByText("Aucune actualité pour le moment.")).toBeInTheDocument();
  });

  it("ouvre la Lightbox au clic sur une image de la galerie", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Mosaïques du chœur/ }));

    expect(await screen.findByRole("button", { name: "Fermer" })).toBeInTheDocument();
  });

  it("affiche les témoignages et les horaires", () => {
    renderPage();

    expect(screen.getByText(/Marie L\./)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Horaires & Visites" })).toBeInTheDocument();
  });

  it("ne rend pas la section STATS BAR (masquée temporairement, chiffres placeholders)", () => {
    renderPage();

    expect(screen.queryByText("Années d'adoration")).not.toBeInTheDocument();
    expect(screen.queryByText("Ouvert toute l'année")).not.toBeInTheDocument();
    expect(screen.queryByText("Présence ininterrompue")).not.toBeInTheDocument();
    expect(screen.queryByText("Visiteurs par an")).not.toBeInTheDocument();
  });
});
