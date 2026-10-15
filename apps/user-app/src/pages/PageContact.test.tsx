import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@chapelle/shared/mocks/server";
import { ToastProvider } from "@chapelle/shared/ui";
import PageContact from "./PageContact";

/**
 * Pas de `vi.mock` : `apiClient` réel, intercepté par le serveur MSW global (cf.
 * conception U7 §9, même patron que `PageAnnonceCreation.test.tsx`, U6).
 */
function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PageContact />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "Jean Dupont" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jean@test.fr" } });
  fireEvent.change(screen.getByLabelText("Sujet"), { target: { value: "info" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Un message suffisamment long." } });
}

describe("pages/PageContact (user-app)", () => {
  it("affiche le hero, les cartes d'info et le formulaire", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Adresse" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
  });

  it("affiche l'adresse email de contact réelle de la Chapelle du Vœux", () => {
    renderPage();

    expect(screen.getByText("adorationtourcoing@gmail.com")).toBeInTheDocument();
    expect(screen.queryByText("contact@sacrecoeur-sanctuaire.fr")).not.toBeInTheDocument();
  });

  it("bascule vers la confirmation avec le nom soumis après un envoi réussi", async () => {
    renderPage();

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));

    expect(await screen.findByRole("heading", { name: "Message envoyé !" })).toBeInTheDocument();
    expect(screen.getByText(/Merci Jean Dupont\./)).toBeInTheDocument();
    expect(screen.queryByLabelText("Nom")).not.toBeInTheDocument();
  });

  it("réaffiche un formulaire vide au clic sur 'Nouveau message'", async () => {
    renderPage();

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));
    await screen.findByRole("heading", { name: "Message envoyé !" });

    fireEvent.click(screen.getByRole("button", { name: "Nouveau message" }));

    expect(screen.getByLabelText<HTMLInputElement>("Nom").value).toBe("");
  });

  it("garde le formulaire affiché et montre un toast d'erreur si l'envoi échoue", async () => {
    server.use(
      http.post("*/contact", () => HttpResponse.json({ code: "SERVER_ERROR", message: "Erreur serveur" }, { status: 500 })),
    );
    renderPage();

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Erreur serveur");
    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
  });
});
