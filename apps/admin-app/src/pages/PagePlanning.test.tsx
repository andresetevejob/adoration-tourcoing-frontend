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
import PagePlanning from "./PagePlanning";
import { usePlanning } from "../hooks/usePlanning";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { useCancelBooking } from "../hooks/useCancelBooking";
import { useVeilleurs } from "../hooks/useVeilleurs";

vi.mock("../hooks/usePlanning");
vi.mock("../hooks/useCreateBooking");
vi.mock("../hooks/useCancelBooking");
vi.mock("../hooks/useVeilleurs");

interface CalendrierStubProps {
  date: string;
  entries: PlanningEntryResponse[];
  isLoading: boolean;
  onSelectSlot?: (info: DateSelectArg) => void;
  onEventClick?: (info: EventClickArg) => void;
}

vi.mock("../components/planning/CalendrierPlanningAdmin", () => ({
  default: ({ date, entries, isLoading, onSelectSlot, onEventClick }: CalendrierStubProps) => (
    <div data-testid="calendrier-stub">
      <span data-testid="date">{date}</span>
      <span data-testid="loading">{String(isLoading)}</span>
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
            onEventClick({ event: { id: "e1" } } as unknown as EventClickArg);
          }}
        >
          simuler-clic
        </button>
      )}
    </div>
  ),
}));

vi.mock("../components/planning/ReservationForm", () => ({
  ReservationForm: ({
    onSubmit,
    onClose,
  }: {
    onSubmit: (values: { beneficiaire: "moi" | "veilleur"; veilleurId?: string; description?: string }) => void;
    onClose: () => void;
  }) => (
    <div data-testid="reservation-form-stub">
      <button
        type="button"
        onClick={() => {
          onSubmit({ beneficiaire: "moi", description: "Test" });
        }}
      >
        soumettre-moi
      </button>
      <button
        type="button"
        onClick={() => {
          onSubmit({ beneficiaire: "veilleur", veilleurId: "v1", description: "Test" });
        }}
      >
        soumettre-veilleur
      </button>
      <button type="button" onClick={onClose}>
        fermer-formulaire
      </button>
    </div>
  ),
}));

vi.mock("../components/planning/ReservationConfirmModal", () => ({
  ReservationConfirmModal: (
    props:
      | { variant: "create"; beneficiaireLabel: string; onConfirm: () => void; onClose: () => void }
      | { variant: "cancel"; onConfirm: () => void; onClose: () => void },
  ) => (
    <div data-testid={`confirm-modal-${props.variant}`}>
      {props.variant === "create" && <span data-testid="beneficiaire-label">{props.beneficiaireLabel}</span>}
      <button type="button" onClick={props.onConfirm}>
        confirmer-{props.variant}
      </button>
      <button type="button" onClick={props.onClose}>
        fermer-{props.variant}
      </button>
    </div>
  ),
}));

const veilleur: UserResponse = {
  id: "v1",
  email: "jean.dupont@example.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.VEILLEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function entry(id: string): PlanningEntryResponse {
  return {
    id,
    idUtilisateur: "u1",
    nomUtilisateur: "Dupont",
    prenomsUtilisateur: "Jean",
    roleUtilisateur: UserRole.VEILLEUR,
    dateDebut: "2026-01-01T10:00:00Z",
    dateFin: "2026-01-01T11:00:00Z",
    estArchivee: false,
    estAnonymise: false,
  };
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

function mockVeilleurs(data: UserResponse[] = [veilleur]) {
  vi.mocked(useVeilleurs).mockReturnValue({
    data,
    isLoading: false,
  } as unknown as ReturnType<typeof useVeilleurs>);
}

describe("pages/PagePlanning (admin-app)", () => {
  it("affiche le titre, le filtre de date et transmet les entrées non filtrées au calendrier", async () => {
    mockPlanning({
      content: [entry("e1"), entry("e2")],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1,
      last: true,
    });
    mockCreateBooking();
    mockCancelBooking();
    mockVeilleurs();

    render(<PagePlanning />);

    expect(screen.getByRole("heading", { name: "Planning" })).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    const stub = await screen.findByTestId("calendrier-stub");
    expect(stub).toHaveTextContent("e1");
    expect(stub).toHaveTextContent("e2");
  });

  it("transmet isLoading au calendrier", async () => {
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true }, true);
    mockCreateBooking();
    mockCancelBooking();
    mockVeilleurs();

    render(<PagePlanning />);

    await screen.findByTestId("calendrier-stub");
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("date")).toHaveTextContent(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("affiche un message d'erreur et masque le calendrier quand la requête planning échoue", () => {
    vi.mocked(usePlanning).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof usePlanning>);
    mockCreateBooking();
    mockCancelBooking();
    mockVeilleurs();

    render(<PagePlanning />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Impossible de charger le planning. Veuillez réessayer plus tard.",
    );
    expect(screen.queryByTestId("calendrier-stub")).not.toBeInTheDocument();
  });

  it("ouvre ReservationForm puis ReservationConfirmModal (create, Moi-même) et appelle createBooking.mutate à la confirmation", async () => {
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true });
    const mutate = mockCreateBooking();
    mockCancelBooking();
    mockVeilleurs();

    render(<PagePlanning />);

    await screen.findByTestId("calendrier-stub");
    fireEvent.click(screen.getByText("simuler-selection"));

    expect(await screen.findByTestId("reservation-form-stub")).toBeInTheDocument();
    fireEvent.click(screen.getByText("soumettre-moi"));

    const confirmModal = await screen.findByTestId("confirm-modal-create");
    expect(confirmModal).toBeInTheDocument();
    expect(screen.getByTestId("beneficiaire-label")).toHaveTextContent("Moi-même");
    fireEvent.click(screen.getByText("confirmer-create"));

    expect(mutate).toHaveBeenCalledWith(
      {
        idUtilisateur: undefined,
        dateDebut: "2026-06-01T10:00:00.000Z",
        dateFin: "2026-06-01T11:00:00.000Z",
        description: "Test",
      },
      expect.anything(),
    );
  });

  it("résout le nom complet du Veilleur sélectionné pour beneficiaireLabel et transmet idUtilisateur", async () => {
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true });
    const mutate = mockCreateBooking();
    mockCancelBooking();
    mockVeilleurs();

    render(<PagePlanning />);

    await screen.findByTestId("calendrier-stub");
    fireEvent.click(screen.getByText("simuler-selection"));
    fireEvent.click(await screen.findByText("soumettre-veilleur"));

    await screen.findByTestId("confirm-modal-create");
    expect(screen.getByTestId("beneficiaire-label")).toHaveTextContent("Jean Dupont");
    fireEvent.click(screen.getByText("confirmer-create"));

    expect(mutate).toHaveBeenCalledWith(
      {
        idUtilisateur: "v1",
        dateDebut: "2026-06-01T10:00:00.000Z",
        dateFin: "2026-06-01T11:00:00.000Z",
        description: "Test",
      },
      expect.anything(),
    );
  });

  it("ouvre ReservationConfirmModal (cancel) pour n'importe quelle entrée cliquée et appelle cancelBooking.mutate", async () => {
    mockPlanning({ content: [entry("e1")], page: 0, size: 20, totalElements: 1, totalPages: 1, last: true });
    mockCreateBooking();
    const mutate = mockCancelBooking();
    mockVeilleurs();

    render(<PagePlanning />);

    await screen.findByTestId("calendrier-stub");
    fireEvent.click(screen.getByText("simuler-clic"));

    const confirmModal = await screen.findByTestId("confirm-modal-cancel");
    expect(confirmModal).toBeInTheDocument();

    fireEvent.click(screen.getByText("confirmer-cancel"));
    expect(mutate).toHaveBeenCalledWith("e1", expect.anything());
  });

  it("n'ouvre pas de modale au clic sur une entrée inconnue", async () => {
    mockPlanning({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true });
    mockCreateBooking();
    mockCancelBooking();
    mockVeilleurs();

    render(<PagePlanning />);

    await screen.findByTestId("calendrier-stub");
    fireEvent.click(screen.getByText("simuler-clic"));

    await waitFor(() => {
      expect(screen.queryByTestId("confirm-modal-cancel")).not.toBeInTheDocument();
    });
  });
});
