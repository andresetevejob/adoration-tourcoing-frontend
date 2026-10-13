import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { useUserPhoto } from "../../hooks/useUserPhoto";
import { UserProfile } from "./UserProfile";

vi.mock("../../hooks/useUserPhoto");

const baseUser: UserResponse = {
  id: "u1",
  email: "jean.dupont@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  telephone: "0612345678",
  role: UserRole.VEILLEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function mockUserPhoto(overrides: Partial<ReturnType<typeof useUserPhoto>>) {
  vi.mocked(useUserPhoto).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useUserPhoto>);
}

describe("components/users/UserProfile (admin-app)", () => {
  beforeEach(() => {
    mockUserPhoto({});
  });

  it("affiche nom/prénoms/email/téléphone/rôle/date de création", () => {
    render(<UserProfile user={baseUser} />);

    expect(screen.getByText("Dupont")).toBeInTheDocument();
    expect(screen.getByText("Jean")).toBeInTheDocument();
    expect(screen.getByText("jean.dupont@example.com")).toBeInTheDocument();
    expect(screen.getByText("0612345678")).toBeInTheDocument();
    expect(screen.getByText("Veilleur")).toBeInTheDocument();
    expect(screen.getByText("01/01/2026")).toBeInTheDocument();
  });

  it("affiche '—' quand le téléphone est absent", () => {
    render(<UserProfile user={{ ...baseUser, telephone: undefined }} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it.each([
    [StatutValidation.VALIDE, "Validé"],
    [StatutValidation.EN_ATTENTE, "En attente"],
    [StatutValidation.REJETE, "Rejeté"],
  ])("affiche le badge de statut '%s' -> '%s'", (statutValidation, label) => {
    render(<UserProfile user={{ ...baseUser, statutValidation }} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  describe("photo", () => {
    it("affiche l'image circulaire avec la bonne URL et le bon alt quand la récupération réussit", () => {
      mockUserPhoto({ data: "blob:fake-url", isLoading: false });

      render(<UserProfile user={{ ...baseUser, photo: "present" }} />);

      const img = screen.getByRole("img", { name: "Photo de Jean Dupont" });
      expect(img).toHaveAttribute("src", "blob:fake-url");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("affiche le Spinner pendant le chargement", () => {
      mockUserPhoto({ data: undefined, isLoading: true });

      render(<UserProfile user={{ ...baseUser, photo: "present" }} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("n'affiche ni image ni spinner et ne consulte pas le réseau quand user.photo est null", () => {
      mockUserPhoto({ data: undefined, isLoading: false });

      render(<UserProfile user={{ ...baseUser, photo: null }} />);

      expect(useUserPhoto).toHaveBeenCalledWith("u1", false);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      // Le reste de la fiche reste intact.
      expect(screen.getByText("Dupont")).toBeInTheDocument();
    });

    it("dégrade silencieusement en cas d'échec de récupération : ni image ni spinner, reste de la fiche intact", () => {
      mockUserPhoto({ data: undefined, isLoading: false, isError: true });

      render(<UserProfile user={baseUser} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByText("Dupont")).toBeInTheDocument();
      expect(screen.getByText("Jean")).toBeInTheDocument();
      expect(screen.getByText("jean.dupont@example.com")).toBeInTheDocument();
    });
  });
});
