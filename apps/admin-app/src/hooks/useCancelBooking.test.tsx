import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiError } from "@chapelle/shared/api";
import { ToastProvider } from "@chapelle/shared/ui";
import { cancelBooking } from "../api/endpoints/bookings";
import { useCancelBooking } from "./useCancelBooking";

vi.mock("../api/endpoints/bookings", () => ({
  cancelBooking: vi.fn(),
}));

function buildWrapper(queryClient: QueryClient) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

describe("hooks/useCancelBooking (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appelle cancelBooking, invalide planning/bookings et affiche un toast de succès", async () => {
    vi.mocked(cancelBooking).mockResolvedValueOnce(undefined);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCancelBooking(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate("b1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(cancelBooking).toHaveBeenCalledWith("b1", expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["planning"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["bookings"] });
    expect(await screen.findByRole("status")).toHaveTextContent("Réservation annulée.");
  });

  it("affiche un toast d'erreur avec le message de l'ApiError quand cancelBooking échoue", async () => {
    vi.mocked(cancelBooking).mockRejectedValueOnce(new ApiError("FORBIDDEN", 403, "Action non autorisée"));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

    const { result } = renderHook(() => useCancelBooking(), { wrapper: buildWrapper(queryClient) });

    act(() => {
      result.current.mutate("b1");
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Action non autorisée");
  });
});
