import { render, screen, waitFor, within } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@chapelle/shared/mocks/server";
import { StatutAnnonce, type AnnonceResponse } from "@chapelle/shared/types";
import PageActualites from "./PageActualites";

/**
 * Pas de `vi.mock` sur `useAnnonces`/`api/endpoints/annonces` (contrairement à
 * `PageAgenda`) : `apiClient` réel, intercepté par le serveur MSW global (cf.
 * conception U6 §5.2) — vérifie le contrat HTTP simulé de bout en bout.
 */
function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PageActualites />
    </QueryClientProvider>,
  );
}

describe("pages/PageActualites", () => {
  it("affiche uniquement les annonces au statut PUBLIE du seed", async () => {
    renderPage();

    expect(await screen.findByText("Nouveaux horaires d'adoration")).toBeInTheDocument();
    expect(await screen.findByText("Célébration de la Pentecôte 2026")).toBeInTheDocument();
    expect(screen.queryByText("Retraite spirituelle d'été")).not.toBeInTheDocument();
  });

  it("affiche un message d'erreur si le chargement échoue", async () => {
    server.use(
      http.get("*/annonces", () =>
        HttpResponse.json({ code: "SERVER_ERROR", message: "Erreur" }, { status: 500 }),
      ),
    );

    renderPage();

    expect(
      await screen.findByRole("alert", undefined, { timeout: 3000 }),
    ).toHaveTextContent("Impossible de charger les actualités. Veuillez réessayer plus tard.");
  });

  it("affiche le message vide si aucune annonce publiée", async () => {
    server.use(http.get("*/annonces", () => HttpResponse.json([])));

    renderPage();

    expect(await screen.findByText("Aucune actualité pour le moment.")).toBeInTheDocument();
  });

  it("ouvre la modale de détail au clic sur une carte, avec le contenu intégral", async () => {
    renderPage();

    const title = await screen.findByText("Nouveaux horaires d'adoration");
    fireEvent.click(title);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/adoration eucharistique sera étendue/)).toBeInTheDocument();
  });

  it("pagine par 4 annonces et permet de naviguer à la page suivante", async () => {
    const manyPublished: AnnonceResponse[] = Array.from({ length: 5 }, (_, index) => ({
      id: `p${String(index)}`,
      titre: `Annonce ${String(index)}`,
      contenu: `Contenu ${String(index)}`,
      datePublication: `2026-0${String(index + 1)}-01`,
      statut: StatutAnnonce.PUBLIE,
    }));
    server.use(http.get("*/annonces", () => HttpResponse.json(manyPublished)));

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("article")).toHaveLength(4);
    });
    expect(screen.queryByText("Annonce 4")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));

    await waitFor(() => {
      expect(screen.getByText("Annonce 4")).toBeInTheDocument();
    });
  });
});
