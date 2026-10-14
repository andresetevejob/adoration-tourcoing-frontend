import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import {
  StatutValidation,
  UserRole,
  type PageResponse,
  type PlanningEntryResponse,
  type UserResponse,
} from "@chapelle/shared/types";
import PageAgenda from "./PageAgenda";
import { useAuth } from "../hooks/useAuth";
import { usePlanning } from "../hooks/usePlanning";
import type { PlanningPeriode } from "../hooks/planningPeriode";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { useCancelBooking } from "../hooks/useCancelBooking";

vi.mock("../hooks/useAuth");
vi.mock("../hooks/usePlanning");
vi.mock("../hooks/useCreateBooking");
vi.mock("../hooks/useCancelBooking");

interface CalendrierStubProps {
  periode: PlanningPeriode;
  entries: PlanningEntryResponse[];
  isLoading: boolean;
  onSelectSlot?: (info: DateSelectArg) => void;
  onEventClick?: (info: EventClickArg) => void;
}

vi.mock("../components/agenda/CalendrierReservations", () => ({
  default: ({ periode, entries, isLoading, onSelectSlot, onEventClick }: CalendrierStubProps) => (
    <div data-testid="calendrier-stub">
      <span data-testid="date">{periode.mode === "jour" ? periode.date : ""}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="selectable">{String(Boolean(onSelectSlot))}</span>
      <span data-testid="clickable">{String(Boolean(onEventClick))}</span>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>{entry.id}</li>
        ))}
      </ul>
      {onSelectSlot && (
        <button
          type="button"
          onClick={() => {
            onSelectSlot({
              start: new Date("2026-06-01T10:00:00Z"),
              end: new Date("2026-06-01T11:00:00Z"),
            } as DateSelectArg);
          }}
        >
          simuler-selection
        </button>
      )}
      {onEventClick && (
        <button
          type="button"
          onClick={() => {
            onEventClick({
              event: { id: "e1", extendedProps: { isMine: true } },
            } as unknown as EventClickArg);
          }}
        >
          simuler-clic-mine
        </button>
      )}
      {onEventClick && (
        <button
          type="button"
          onClick={() => {
            onEventClick({
              event: { id: "e2", extendedProps: { isMine: false } },
            } as unknown as EventClickArg);
          }}
        >
          simuler-clic-autre
        </button>
      )}
    </div>
  ),
}));

vi.mock("../components/agenda/ReservationForm", () => ({
  ReservationForm: ({
    onSubmit,
    onClose,
  }: {
    onSubmit: (values: { description?: string }) => void;
    onClose: () => void;
  }) => (
    <div data-testid="reservation-form-stub">
      <button
        type="button"
        onClick={() => {
          onSubmit({ description: "Test" });
        }}
      >
        soumettre-formulaire
      </button>
      <button type="button" onClick={onClose}>
        fermer-formulaire
      </button>
    </div>
  ),
}));

vi.mock("../components/agenda/ReservationConfirmModal", () => ({
  ReservationConfirmModal: (
    props:
      | { variant: "create"; onConfirm: () => void; onClose: () => void }
      | { variant: "cancel"; onConfirm: () => void; onClose: () => void },
  ) => (
    <div data-testid={`confirm-modal-${props.variant}`}>
      <button type="button" onClick={props.onConfirm}>
        confirmer-{props.variant}
      </button>
      <button type="button" onClick={props.onClose}>
        fermer-{props.variant}
      </button>
    </div>
  ),
}));

vi.mock("../components/agenda/ReservationDetailModal", () => ({
  ReservationDetailModal: ({
    booking,
    onClose,
  }: {
    booking: PlanningEntryResponse;
    onClose: () => void;
  }) => (
    <div data-testid="detail-modal">
      <span data-testid="detail-modal-booking-id">{booking.id}</span>
      <button type="button" onClick={onClose}>
        fermer-detail
      </button>
    </div>
  ),
}));

const veilleur: UserResponse = {
  id: "u1",
  email: "v@b.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.VEILLEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

const adorateur: UserResponse = { ...veilleur, id: "u2", role: UserRole.ADORATEUR };

function entry(id: string, idUtilisateur: string): PlanningEntryResponse {
  return {
    id,
    idUtilisateur,
    nomUtilisateur: "Dupont",
    prenomsUtilisateur: "Jean",
    roleUtilisateur: UserRole.VEILLEUR,
    dateDebut: "2026-01-01T10:00:00Z",
    dateFin: "2026-01-01T11:00:00Z",
    estArchivee: false,
    estAnonymise: false,
  };
}

function mockAuth(user: UserResponse | null, role: UserRole | null) {
  vi.mocked(useAuth).mockReturnValue({
    user,
    role,
    isAuthenticated: user !== null,
    isHydrated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  });
}

function mockPlanning(page: PageResponse<PlanningEntryResponse>, isLoading = false) {
  vi.mocked(usePlanning).mockReturnValue({
    data: page,
    isLoading,
    isError: false,
  } as unknown as ReturnType<typeof usePlanning>);
}

function mockCreateBooking(mutate = vi.fn()) {
  vi.mocked(useCreateBooking).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateBooking>);
  return mutate;
}

function mockCancelBooking(mutate = vi.fn()) {
  vi.mocked(useCancelBooking).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCancelBooking>);
  return mutate;
}

describe("pages/PageAgenda (user-app)", () => {
  it("n'affiche pas le filtre « Mes réservations » pour un visiteur anonyme", async () => {
    mockAuth(null, null);
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true });
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    expect(screen.getByRole("heading", { name: "Agenda" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Mes réservations uniquement")).not.toBeInTheDocument();
    expect(await screen.findByTestId("calendrier-stub")).toBeInTheDocument();
    expect(screen.getByTestId("selectable")).toHaveTextContent("false");
  });

  it("n'affiche pas le filtre « Mes réservations » pour un ADORATEUR", async () => {
    mockAuth(adorateur, UserRole.ADORATEUR);
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true });
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    expect(screen.queryByLabelText("Mes réservations uniquement")).not.toBeInTheDocument();
    expect(screen.getByTestId("selectable")).toHaveTextContent("false");
  });

  it("affiche le filtre « Mes réservations » pour un VEILLEUR et filtre les entrées à la coche", async () => {
    mockAuth(veilleur, UserRole.VEILLEUR);
    mockPlanning({
      content: [entry("e1", veilleur.id), entry("e2", "autre-utilisateur")],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1,
      last: true,
    });
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    expect(screen.getByTestId("calendrier-stub")).toHaveTextContent("e1");
    expect(screen.getByTestId("calendrier-stub")).toHaveTextContent("e2");

    fireEvent.click(screen.getByLabelText("Mes réservations uniquement"));

    await waitFor(() => {
      expect(screen.getByTestId("calendrier-stub")).toHaveTextContent("e1");
    });
    expect(screen.getByTestId("calendrier-stub")).not.toHaveTextContent("e2");
  });

  it("transmet la date sélectionnée et isLoading au calendrier", async () => {
    mockAuth(null, null);
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true }, true);
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("date")).toHaveTextContent(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("affiche un message d'erreur et masque le calendrier quand la requête planning échoue", () => {
    mockAuth(null, null);
    vi.mocked(usePlanning).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof usePlanning>);
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Impossible de charger le planning. Veuillez réessayer plus tard.",
    );
    expect(screen.queryByTestId("calendrier-stub")).not.toBeInTheDocument();
  });

  it("active onSelectSlot pour un VEILLEUR quand le filtre « mes réservations » est inactif", async () => {
    mockAuth(veilleur, UserRole.VEILLEUR);
    mockPlanning({ content: [entry("e1", veilleur.id)], page: 0, size: 20, totalElements: 1, totalPages: 1, last: true });
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    expect(screen.getByTestId("selectable")).toHaveTextContent("true");
  });

  it("désactive onSelectSlot pour un VEILLEUR quand le filtre « mes réservations » est actif", async () => {
    mockAuth(veilleur, UserRole.VEILLEUR);
    mockPlanning({ content: [entry("e1", veilleur.id)], page: 0, size: 20, totalElements: 1, totalPages: 1, last: true });
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    fireEvent.click(screen.getByLabelText("Mes réservations uniquement"));

    await waitFor(() => {
      expect(screen.getByTestId("selectable")).toHaveTextContent("false");
    });
  });

  it("ouvre ReservationForm puis ReservationConfirmModal (create) et appelle createBooking.mutate à la confirmation", async () => {
    mockAuth(veilleur, UserRole.VEILLEUR);
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true });
    const mutate = mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    fireEvent.click(screen.getByText("simuler-selection"));

    expect(await screen.findByTestId("reservation-form-stub")).toBeInTheDocument();
    fireEvent.click(screen.getByText("soumettre-formulaire"));

    const confirmModal = await screen.findByTestId("confirm-modal-create");
    expect(confirmModal).toBeInTheDocument();
    fireEvent.click(screen.getByText("confirmer-create"));

    expect(mutate).toHaveBeenCalledWith(
      {
        dateDebut: "2026-06-01T12:00:00+02:00",
        dateFin: "2026-06-01T13:00:00+02:00",
        description: "Test",
      },
      expect.anything(),
    );
  });

  it("ouvre ReservationConfirmModal (cancel) au clic sur une entrée « à soi » et ReservationDetailModal au clic sur une entrée d'un tiers", async () => {
    mockAuth(veilleur, UserRole.VEILLEUR);
    mockPlanning({
      content: [entry("e1", veilleur.id), entry("e2", "autre-utilisateur")],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1,
      last: true,
    });
    mockCreateBooking();
    const mutate = mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");

    // Clic sur l'entrée d'un tiers (e2, isMine=false) : ouvre désormais la modale de
    // détail (lecture seule), plus de "clic sans effet" (changement de comportement de
    // cette proposition) — et surtout PAS la modale de confirmation d'annulation.
    fireEvent.click(screen.getByText("simuler-clic-autre"));
    const detailModal = await screen.findByTestId("detail-modal");
    expect(detailModal).toBeInTheDocument();
    expect(screen.getByTestId("detail-modal-booking-id")).toHaveTextContent("e2");
    expect(screen.queryByTestId("confirm-modal-cancel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("fermer-detail"));
    expect(screen.queryByTestId("detail-modal")).not.toBeInTheDocument();

    // Clic sur sa propre entrée (e1, isMine=true) : ouvre toujours la modale de
    // confirmation d'annulation (non régressé).
    fireEvent.click(screen.getByText("simuler-clic-mine"));
    const confirmModal = await screen.findByTestId("confirm-modal-cancel");
    expect(confirmModal).toBeInTheDocument();
    expect(screen.queryByTestId("detail-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("confirmer-cancel"));
    expect(mutate).toHaveBeenCalledWith("e1", expect.anything());
  });

  it("onEventClick reste undefined (clic sans effet) pour un visiteur anonyme", async () => {
    mockAuth(null, null);
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true });
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    expect(screen.getByTestId("clickable")).toHaveTextContent("false");
  });

  it("onEventClick reste undefined (clic sans effet) pour un ADORATEUR", async () => {
    mockAuth(adorateur, UserRole.ADORATEUR);
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true });
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    expect(screen.getByTestId("clickable")).toHaveTextContent("false");
  });

  it("onEventClick est défini pour un VEILLEUR", async () => {
    mockAuth(veilleur, UserRole.VEILLEUR);
    mockPlanning({ content: [entry("e1", veilleur.id)], page: 0, size: 20, totalElements: 1, totalPages: 1, last: true });
    mockCreateBooking();
    mockCancelBooking();

    render(<PageAgenda />);

    await screen.findByTestId("calendrier-stub");
    expect(screen.getByTestId("clickable")).toHaveTextContent("true");
  });
});
