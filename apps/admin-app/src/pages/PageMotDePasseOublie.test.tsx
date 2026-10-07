import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import type { ForgotPasswordRequest, ForgotPasswordResponse } from "@chapelle/shared/types";
import PageMotDePasseOublie from "./PageMotDePasseOublie";
import { useForgotPassword } from "../hooks/useForgotPassword";

vi.mock("../hooks/useForgotPassword");

type ForgotPasswordMutate = (
  dto: ForgotPasswordRequest,
  options?: { onSuccess?: (response: ForgotPasswordResponse) => void },
) => void;

function mockForgotPassword(mutate: ForgotPasswordMutate, isPending = false) {
  vi.mocked(useForgotPassword).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useForgotPassword>);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PageMotDePasseOublie />
    </MemoryRouter>,
  );
}

describe("pages/PageMotDePasseOublie (admin-app)", () => {
  it("affiche le titre et le formulaire avant soumission", () => {
    mockForgotPassword(vi.fn());

    renderPage();

    expect(screen.getByRole("heading", { name: "Mot de passe oublié" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("affiche le message de confirmation générique après un envoi réussi, quel que soit le contenu de la réponse API", async () => {
    const mutate = vi.fn<ForgotPasswordMutate>((_dto, options) => {
      options?.onSuccess?.({ message: "Contenu technique imprévisible du backend" });
    });
    mockForgotPassword(mutate);

    renderPage();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "adorateur@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le lien de réinitialisation" }));

    expect(
      await screen.findByText(
        "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Contenu technique imprévisible du backend")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(mutate).toHaveBeenCalledTimes(1);
    const [dto, options] = mutate.mock.calls[0];
    expect(dto).toEqual({ email: "adorateur@example.com" });
    expect(options?.onSuccess).toBeInstanceOf(Function);
  });

  it("affiche un lien de retour vers /connexion après confirmation", async () => {
    const mutate = vi.fn<ForgotPasswordMutate>((_dto, options) => {
      options?.onSuccess?.({ message: "ok" });
    });
    mockForgotPassword(mutate);

    renderPage();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "adorateur@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le lien de réinitialisation" }));

    expect(await screen.findByRole("link", { name: "Retour à la connexion" })).toHaveAttribute(
      "href",
      "/connexion",
    );
  });

  it("garde le formulaire affiché quand la mutation n'a pas (encore) réussi (échec géré par le toast du hook, pas par la page)", async () => {
    const mutate = vi.fn();
    mockForgotPassword(mutate);

    renderPage();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "adorateur@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le lien de réinitialisation" }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    });
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.",
      ),
    ).not.toBeInTheDocument();
  });
});
