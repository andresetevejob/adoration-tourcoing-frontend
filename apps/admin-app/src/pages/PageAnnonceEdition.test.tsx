import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@chapelle/shared/ui";
import PageAnnonceEdition from "./PageAnnonceEdition";

/**
 * Pas de `vi.mock` (contrairement à `PageDetailUtilisateur`, U4) : `apiClient` réel,
 * intercepté par le serveur MSW global (cf. conception U6 §5.2).
 */
function renderPage(id: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[`/annonces/${id}`]}>
          <Routes>
            <Route path="/annonces/:id" element={<PageAnnonceEdition />} />
            <Route path="/annonces" element={<div>Liste des annonces (stub)</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("pages/PageAnnonceEdition (admin-app)", () => {
  it("pré-remplit le formulaire avec l'annonce chargée", async () => {
    renderPage("annonce-1");

    expect(await screen.findByRole("heading", { name: "Modifier l'annonce" })).toBeInTheDocument();
    expect(screen.getByLabelText<HTMLInputElement>("Titre").value).toBe("Nouveaux horaires d'adoration");
  });

  it("affiche 'Annonce introuvable.' pour un id inconnu", async () => {
    renderPage("inconnu");

    expect(await screen.findByRole("alert")).toHaveTextContent("Annonce introuvable.");
    expect(screen.getByRole("link", { name: "Retour à la liste" })).toHaveAttribute("href", "/annonces");
  });

  it("modifie l'annonce et affiche un toast de succès (pas de redirection, cf. conception U6 §10.3)", async () => {
    renderPage("annonce-1");

    await screen.findByRole("heading", { name: "Modifier l'annonce" });
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Titre modifié" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Annonce modifiée.");
    expect(screen.getByRole("heading", { name: "Modifier l'annonce" })).toBeInTheDocument();
  });

  it("navigue vers /annonces au clic sur Annuler", async () => {
    renderPage("annonce-1");

    await screen.findByRole("heading", { name: "Modifier l'annonce" });
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(screen.getByText("Liste des annonces (stub)")).toBeInTheDocument();
  });

  it("n'affiche pas d'action Publier/Dépublier/Supprimer sur cette page", async () => {
    renderPage("annonce-1");

    await screen.findByRole("heading", { name: "Modifier l'annonce" });
    expect(screen.queryByRole("button", { name: /Publier|Dépublier|Supprimer/ })).not.toBeInTheDocument();
  });
});
