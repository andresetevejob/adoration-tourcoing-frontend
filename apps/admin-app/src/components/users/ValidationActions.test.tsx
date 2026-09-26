import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { ValidationActions } from "./ValidationActions";
import { useValiderUser } from "../../hooks/useValiderUser";
import { useRejeterUser } from "../../hooks/useRejeterUser";

vi.mock("../../hooks/useValiderUser");
vi.mock("../../hooks/useRejeterUser");

const pendingUser: UserResponse = {
  id: "u1",
  email: "jean.dupont@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.EN_ATTENTE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function mockValiderUser(mutate = vi.fn(), isPending = false) {
  vi.mocked(useValiderUser).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useValiderUser>);
  return mutate;
}

function mockRejeterUser(mutate = vi.fn(), isPending = false) {
  vi.mocked(useRejeterUser).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useRejeterUser>);
  return mutate;
}

describe("components/users/ValidationActions (admin-app)", () => {
  it("ne rend rien si le compte n'est pas EN_ATTENTE", () => {
    mockValiderUser();
    mockRejeterUser();
    const { container } = render(
      <ValidationActions user={{ ...pendingUser, statutValidation: StatutValidation.VALIDE }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("ouvre une ConfirmActionModal de validation et appelle validerUser.mutate à la confirmation", () => {
    const mutate = mockValiderUser();
    mockRejeterUser();
    render(<ValidationActions user={pendingUser} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Valider" })[0]);
    expect(screen.getByRole("heading", { name: "Confirmer la validation du compte" })).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Valider" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    expect(mutate).toHaveBeenCalledWith("u1", expect.anything());
  });

  it("ouvre une ConfirmActionModal de rejet et appelle rejeterUser.mutate à la confirmation", () => {
    mockValiderUser();
    const mutate = mockRejeterUser();
    render(<ValidationActions user={pendingUser} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Rejeter" })[0]);
    expect(screen.getByRole("heading", { name: "Confirmer le rejet du compte" })).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Rejeter" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    expect(mutate).toHaveBeenCalledWith("u1", expect.anything());
  });

  it("ferme la modale au clic sur Annuler", () => {
    mockValiderUser();
    mockRejeterUser();
    render(<ValidationActions user={pendingUser} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Valider" })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
