import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatutReservation, type BookingResponse, type PageResponse } from "@chapelle/shared/types";
import { cancelBooking, createBooking, listBookings } from "./bookings";

const { getMock, postMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("../client", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    put: vi.fn(),
    delete: deleteMock,
  },
}));

const booking: BookingResponse = {
  id: "b1",
  idUtilisateur: "u1",
  creatorId: "admin1",
  dateDebut: "2026-01-01T10:00:00Z",
  dateFin: "2026-01-01T11:00:00Z",
  status: StatutReservation.EFFECTUEE,
  dateCreation: "2025-12-01T00:00:00Z",
  estArchivee: false,
};

const page: PageResponse<BookingResponse> = {
  content: [booking],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
  last: true,
};

describe("api/endpoints/bookings (admin-app)", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    deleteMock.mockReset();
  });

  it("listBookings() effectue un GET /bookings avec les query params fournis", async () => {
    getMock.mockResolvedValueOnce(page);

    const result = await listBookings({ utilisateurId: "u1", from: "2026-01-01T00:00:00Z", to: "2026-01-02T00:00:00Z", page: 0, size: 20 });

    expect(getMock).toHaveBeenCalledWith("/bookings", {
      utilisateurId: "u1",
      from: "2026-01-01T00:00:00Z",
      to: "2026-01-02T00:00:00Z",
      page: 0,
      size: 20,
    });
    expect(result).toBe(page);
  });

  it("transmet les query params undefined tels quels quand ils ne sont pas fournis", async () => {
    getMock.mockResolvedValueOnce(page);

    await listBookings({});

    expect(getMock).toHaveBeenCalledWith("/bookings", {
      utilisateurId: undefined,
      from: undefined,
      to: undefined,
      page: undefined,
      size: undefined,
    });
  });

  it("createBooking() effectue un POST /bookings avec skipForbiddenRedirect", async () => {
    postMock.mockResolvedValueOnce(booking);

    const dto = { idUtilisateur: "u1", dateDebut: "2026-01-01T10:00:00Z", dateFin: "2026-01-01T11:00:00Z" };
    const result = await createBooking(dto);

    expect(postMock).toHaveBeenCalledWith("/bookings", dto, { skipForbiddenRedirect: true });
    expect(result).toBe(booking);
  });

  it("cancelBooking() effectue un DELETE /bookings/{id} avec skipForbiddenRedirect", async () => {
    deleteMock.mockResolvedValueOnce(undefined);

    await cancelBooking("b1");

    expect(deleteMock).toHaveBeenCalledWith("/bookings/b1", { skipForbiddenRedirect: true });
  });
});
