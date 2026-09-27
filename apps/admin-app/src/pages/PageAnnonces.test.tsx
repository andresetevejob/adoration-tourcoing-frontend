import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@chapelle/shared/mocks/server";
import { ToastProvider } from "@chapelle/shared/ui";
import PageAnnonces from "./PageAnnonces";

/**
 * Pas de `vi.mock` sur les hooks/endpoints `annonces` (contrairement à
 * `AdminsListPage`, U5) : `apiClient` réel, intercepté par le serveur MSW global (cf.
 * conception U6 §5.2) — vérifie le contrat HTTP simulé de bout en bout.
 */
function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={["/annonces"]}>
          <Routes>
            <Route path="/annonces" element={<PageAnnonces />} />
            <Route path="/annonces/nouveau" element={<div>Nouvelle annonce (stub)</div>} />
            <Route path="/annonces/:id" element={<div>Édition annonce (stub)</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("pages/PageAnnonces (admin-app)", () => {
  it("affiche le titre et toutes les annonces (tous statuts confondus)", async () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Gestion des annonces" })).toBeInTheDocument();
    expect(await screen.findByText("Nouveaux horaires d'adoration")).toBeInTheDocument();
    expect(screen.getByText("Retraite spirituelle d'été")).toBeInTheDocument();
  });

  it("affiche un message d'erreur quand la requête échoue", async () => {
    server.use(
      http.get("*/annonces", () =>
        HttpResponse.json({ code: "SERVER_ERROR", message: "Erreur" }, { status: 500 }),
      ),
    );

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible de charger les annonces. Veuillez réessayer plus tard.",
    );
  });

  it("navigue vers /annonces/nouveau au clic sur 'Ajouter une annonce'", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Ajouter une annonce" }));

    expect(screen.getByText("Nouvelle annonce (stub)")).toBeInTheDocument();
  });

  it("navigue vers /annonces/{id} au clic sur 'Modifier'", async () => {
    renderPage();

    await screen.findByText("Nouveaux horaires d'adoration");
    const editButtons = screen.getAllByRole("button", { name: "Modifier" });
    fireEvent.click(editButtons[0]);

    expect(screen.getByText("Édition annonce (stub)")).toBeInTheDocument();
  });

  it("publie une annonce brouillon au clic sur 'Publier'", async () => {
    renderPage();

    const titleCell = await screen.findByText("Retraite spirituelle d'été");
    const row = titleCell.closest("tr");
    if (!row) throw new Error("Ligne introuvable pour « Retraite spirituelle d'été »");
    fireEvent.click(within(row).getByRole("button", { name: "Publier" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Statut de l'annonce mis à jour.");
    });
  });

  it("supprime une annonce après confirmation dans la modale", async () => {
    renderPage();

    await screen.findByText("Concert de musique sacrée");
    const deleteButtons = screen.getAllByRole("button", { name: "Supprimer" });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    expect(screen.getByRole("heading", { name: "Supprimer l'annonce" })).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Supprimer" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText("Concert de musique sacrée")).not.toBeInTheDocument();
    });
  });
});
