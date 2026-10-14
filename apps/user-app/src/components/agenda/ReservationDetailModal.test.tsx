import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import { getUserPhoto } from "../../api/endpoints/users";
import { ReservationDetailModal } from "./ReservationDetailModal";

vi.mock("../../api/endpoints/users", () => ({
  getUserPhoto: vi.fn(),
}));

/** `ReservationDetailModal` appelle `useUserPhoto` (donc `useQuery`) : nécessite un
 *  `QueryClientProvider` ancêtre, même pattern que `ReservationConfirmModal.test.tsx`. */
function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function entry(overrides: Partial<PlanningEntryResponse> = {}): PlanningEntryResponse {
  return {
    id: "e1",
    idUtilisateur: "u1",
    nomUtilisateur: "Dupont",
    prenomsUtilisateur: "Jean",
    roleUtilisateur: UserRole.VEILLEUR,
    dateDebut: "2026-01-01T10:00:00Z",
    dateFin: "2026-01-01T11:00:00Z",
    estArchivee: false,
    estAnonymise: false,
    description: "Adoration silencieuse",
    ...overrides,
  };
}

beforeEach(() => {
  // Jamais résolue par défaut : évite tout avertissement de promesse non gérée pour les
  // tests qui ne s'intéressent pas spécifiquement à l'issue de la requête photo.
  vi.mocked(getUserPhoto).mockReset().mockReturnValue(new Promise(() => {}));
  URL.createObjectURL = vi.fn().mockReturnValue("blob:fake-url");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.mocked(getUserPhoto).mockReset();
});

describe("components/agenda/ReservationDetailModal (user-app)", () => {
  it("affiche les dates, le bénéficiaire et la description de la réservation", () => {
    renderWithQueryClient(
      <ReservationDetailModal isOpen onClose={vi.fn()} booking={entry()} />,
    );

    expect(screen.getByRole("dialog", { name: "Détail de la réservation" })).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("Adoration silencieuse")).toBeInTheDocument();
  });

  it("n'affiche aucune action/mutation : seul un bouton Fermer est présent dans le footer", () => {
    const onClose = vi.fn();
    renderWithQueryClient(<ReservationDetailModal isOpen onClose={onClose} booking={entry()} />);

    // Lecture seule : ni bouton "Confirmer", ni bouton "Annuler" (actions métier), le
    // seul bouton présent est "Fermer" (simple contrôle de fermeture, pas une action
    // au sens métier — cf. design.md §1.3).
    expect(screen.queryByRole("button", { name: "Confirmer" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Annuler" })).not.toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Fermer" });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("affiche la photo du bénéficiaire quand useUserPhoto résout une URL", async () => {
    const fakeBlob = new Blob(["contenu"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockResolvedValueOnce(fakeBlob);

    renderWithQueryClient(
      <ReservationDetailModal isOpen onClose={vi.fn()} booking={entry()} />,
    );

    expect(getUserPhoto).toHaveBeenCalledWith("u1");
    const photo = await screen.findByRole("img", { name: "Photo de Jean Dupont" });
    expect(photo).toHaveAttribute("src", "blob:fake-url");
  });

  it("dégradation silencieuse : aucun message d'erreur affiché et le reste de la modale reste fonctionnel quand la photo échoue (403/404)", async () => {
    vi.mocked(getUserPhoto).mockRejectedValueOnce(new Error("403 Forbidden"));

    renderWithQueryClient(
      <ReservationDetailModal isOpen onClose={vi.fn()} booking={entry()} />,
    );

    await waitFor(() => {
      expect(getUserPhoto).toHaveBeenCalledWith("u1");
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // Le nom et les dates restent affichés normalement malgré l'échec de la photo.
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
  });
});
