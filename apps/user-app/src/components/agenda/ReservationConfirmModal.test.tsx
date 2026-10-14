import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { UserRole, type PlanningEntryResponse } from "@chapelle/shared/types";
import { getUserPhoto } from "../../api/endpoints/users";
import { ReservationConfirmModal } from "./ReservationConfirmModal";

vi.mock("../../api/endpoints/users", () => ({
  getUserPhoto: vi.fn(),
}));

beforeEach(() => {
  // Jamais résolue par défaut (ni succès, ni erreur) : évite tout avertissement de
  // promesse non gérée dans les tests qui ne s'intéressent pas à la photo (variant
  // `create` ou assertions synchrones sur le variant `cancel`).
  vi.mocked(getUserPhoto).mockReset().mockReturnValue(new Promise(() => {}));
  URL.createObjectURL = vi.fn().mockReturnValue("blob:fake-url");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.mocked(getUserPhoto).mockReset();
});

/** Le variant `cancel` appelle `useUserPhoto` (donc `useQuery`) : nécessite un
 *  `QueryClientProvider` ancêtre, comme tout composant consommant TanStack Query dans ce
 *  projet (cf. `apps/admin-app/src/hooks/useUserPhoto.test.tsx`). Le variant `create` n'a
 *  pas besoin de ce wrapper mais le tolère sans effet de bord. */
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
    ...overrides,
  };
}

describe("components/agenda/ReservationConfirmModal (user-app)", () => {
  it("variant create : affiche le récapitulatif et appelle onConfirm", () => {
    const onConfirm = vi.fn();
    renderWithQueryClient(
      <ReservationConfirmModal
        variant="create"
        isOpen
        onClose={vi.fn()}
        dto={{ dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-01T11:00:00Z" }}
        beneficiaireLabel="Moi-même"
        isSubmitting={false}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Confirmer la réservation" })).toBeInTheDocument();
    expect(screen.getByText("Moi-même")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("variant create : bouton Confirmer actif pour une durée de exactement 24h (borne incluse)", () => {
    renderWithQueryClient(
      <ReservationConfirmModal
        variant="create"
        isOpen
        onClose={vi.fn()}
        dto={{ dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-02T10:00:00Z" }}
        beneficiaireLabel="Moi-même"
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Confirmer" })).not.toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("variant create : bouton Confirmer désactivé et message affiché quand la durée dépasse 24h", () => {
    renderWithQueryClient(
      <ReservationConfirmModal
        variant="create"
        isOpen
        onClose={vi.fn()}
        dto={{ dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-02T10:00:01Z" }}
        beneficiaireLabel="Moi-même"
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Confirmer" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Un créneau ne peut pas dépasser 24h.");
  });

  it("variant cancel : bouton Confirmer actif quand le délai de 24h est respecté", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    renderWithQueryClient(
      <ReservationConfirmModal
        variant="cancel"
        isOpen
        onClose={vi.fn()}
        booking={entry({ dateDebut: "2026-01-03T00:00:00Z" })}
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Confirmer l'annulation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmer" })).not.toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("variant cancel : bouton Confirmer désactivé et message affiché quand le délai de 24h est dépassé", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    renderWithQueryClient(
      <ReservationConfirmModal
        variant="cancel"
        isOpen
        onClose={vi.fn()}
        booking={entry({ dateDebut: "2026-01-01T10:00:00Z" })}
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Confirmer" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Le délai d'annulation (24h) est dépassé.");

    vi.useRealTimers();
  });

  it("variant cancel : affiche la photo du bénéficiaire quand useUserPhoto résout une URL", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const fakeBlob = new Blob(["contenu"], { type: "image/jpeg" });
    vi.mocked(getUserPhoto).mockResolvedValueOnce(fakeBlob);

    renderWithQueryClient(
      <ReservationConfirmModal
        variant="cancel"
        isOpen
        onClose={vi.fn()}
        booking={entry({ dateDebut: "2026-01-03T00:00:00Z" })}
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    expect(getUserPhoto).toHaveBeenCalledWith("u1");
    vi.useRealTimers();
    const photo = await screen.findByRole("img", { name: "Photo de Jean Dupont" });
    await waitFor(() => {
      expect(photo).toHaveAttribute("src", "blob:fake-url");
    });
  });

  it("variant cancel : n'affiche aucune photo (ni erreur) quand useUserPhoto échoue — reste fonctionnel", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    vi.mocked(getUserPhoto).mockRejectedValueOnce(new Error("404"));

    renderWithQueryClient(
      <ReservationConfirmModal
        variant="cancel"
        isOpen
        onClose={vi.fn()}
        booking={entry({ dateDebut: "2026-01-03T00:00:00Z" })}
        isSubmitting={false}
        onConfirm={vi.fn()}
      />,
    );

    vi.useRealTimers();
    await waitFor(() => {
      expect(getUserPhoto).toHaveBeenCalledWith("u1");
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // Le reste de la modale reste pleinement fonctionnel malgré l'échec de la photo.
    expect(screen.getByRole("dialog", { name: "Confirmer l'annulation" })).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmer" })).not.toBeDisabled();
  });
});
