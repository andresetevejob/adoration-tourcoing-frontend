import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@chapelle/shared/ui";
import PageAnnonceCreation from "./PageAnnonceCreation";

/**
 * Pas de `vi.mock` (contrairement à `AdminCreatePage`, U5) : `apiClient` réel,
 * intercepté par le serveur MSW global (cf. conception U6 §5.2).
 */
function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={["/annonces/nouveau"]}>
          <Routes>
            <Route path="/annonces/nouveau" element={<PageAnnonceCreation />} />
            <Route path="/annonces" element={<div>Liste des annonces (stub)</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("pages/PageAnnonceCreation (admin-app)", () => {
  it("affiche le titre, le lien retour et le formulaire de création", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Nouvelle annonce" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Retour à la liste" })).toHaveAttribute("href", "/annonces");
    expect(screen.getByLabelText("Titre")).toBeInTheDocument();
  });

  it("crée l'annonce et navigue vers /annonces au succès", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Titre" } });
    fireEvent.change(screen.getByLabelText("Contenu"), { target: { value: "Contenu" } });
    fireEvent.change(screen.getByLabelText("Date de publication"), { target: { value: "2026-09-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => {
      expect(screen.getByText("Liste des annonces (stub)")).toBeInTheDocument();
    });
  });

  it("navigue vers /annonces au clic sur Annuler", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(screen.getByText("Liste des annonces (stub)")).toBeInTheDocument();
  });
});
