import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "@chapelle/shared/ui";
import type { ResetPasswordRequest } from "@chapelle/shared/types";
import PageReinitialisationMotDePasse from "./PageReinitialisationMotDePasse";
import { useResetPassword } from "../hooks/useResetPassword";

vi.mock("../hooks/useResetPassword");

type ResetPasswordMutate = (
  dto: ResetPasswordRequest,
  options?: { onSuccess?: () => void; onError?: () => void },
) => void;

function mockResetPassword(mutate: ResetPasswordMutate, isPending = false) {
  vi.mocked(useResetPassword).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useResetPassword>);
}

function renderPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ToastProvider>
        <Routes>
          <Route path="/reinitialiser-mot-de-passe" element={<PageReinitialisationMotDePasse />} />
          <Route path="/connexion" element={<div>Page connexion</div>} />
          <Route path="/mot-de-passe-oublie" element={<div>Page mot de passe oublié</div>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), { target: { value: "Azerty1!" } });
  fireEvent.change(screen.getByLabelText("Confirmation"), { target: { value: "Azerty1!" } });
}

describe("pages/PageReinitialisationMotDePasse (user-app)", () => {
  it("affiche un message d'erreur et un lien vers /mot-de-passe-oublie quand le token est absent de l'URL, sans afficher le formulaire", () => {
    mockResetPassword(vi.fn());

    renderPage("/reinitialiser-mot-de-passe");

    expect(
      screen.getByText("Ce lien de réinitialisation est invalide ou a expiré."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Redemander un email de réinitialisation" })).toHaveAttribute(
      "href",
      "/mot-de-passe-oublie",
    );
    expect(screen.queryByLabelText("Nouveau mot de passe")).not.toBeInTheDocument();
  });

  it("affiche le formulaire quand le token est présent dans l'URL", () => {
    mockResetPassword(vi.fn());

    renderPage("/reinitialiser-mot-de-passe?token=tok-123");

    expect(screen.getByLabelText("Nouveau mot de passe")).toBeInTheDocument();
    expect(
      screen.queryByText("Ce lien de réinitialisation est invalide ou a expiré."),
    ).not.toBeInTheDocument();
  });

  it("au succès : affiche un toast puis navigue vers /connexion", async () => {
    const mutate = vi.fn<ResetPasswordMutate>((_dto, options) => {
      options?.onSuccess?.();
    });
    mockResetPassword(mutate);

    renderPage("/reinitialiser-mot-de-passe?token=tok-123");

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser le mot de passe" }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1);
    });
    const [dto, options] = mutate.mock.calls[0];
    expect(dto).toEqual({ token: "tok-123", newPassword: "Azerty1!" });
    expect(options?.onSuccess).toBeInstanceOf(Function);
    expect(options?.onError).toBeInstanceOf(Function);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Mot de passe réinitialisé. Vous pouvez vous connecter.",
    );
    expect(await screen.findByText("Page connexion")).toBeInTheDocument();
  });

  it("à l'échec (401) : remplace le formulaire par un message d'erreur, sans toast", async () => {
    const mutate = vi.fn<ResetPasswordMutate>((_dto, options) => {
      options?.onError?.();
    });
    mockResetPassword(mutate);

    renderPage("/reinitialiser-mot-de-passe?token=tok-invalide");

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Réinitialiser le mot de passe" }));

    expect(
      await screen.findByText("Ce lien de réinitialisation est invalide ou a expiré."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Nouveau mot de passe")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("propage isPending du hook au formulaire", async () => {
    mockResetPassword(vi.fn(), true);

    renderPage("/reinitialiser-mot-de-passe?token=tok-123");

    await waitFor(() => {
      const submitButton = screen
        .getAllByRole("button")
        .find((button) => button.getAttribute("type") === "submit");
      expect(submitButton).toBeDisabled();
    });
  });
});
