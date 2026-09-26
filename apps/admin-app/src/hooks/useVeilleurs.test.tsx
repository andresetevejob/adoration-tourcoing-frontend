import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { StatutValidation, UserRole, type SpringPage, type UserResponse } from "@chapelle/shared/types";
import { listUsers } from "../api/endpoints/users";
import { useVeilleurs } from "./useVeilleurs";

vi.mock("../api/endpoints/users", () => ({
  listUsers: vi.fn(),
}));

function user(overrides: Partial<UserResponse>): UserResponse {
  return {
    id: "u1",
    email: "a@b.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.VEILLEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const page: SpringPage<UserResponse> = {
  content: [
    user({ id: "v1", role: UserRole.VEILLEUR }),
    user({ id: "a1", role: UserRole.ADORATEUR }),
    user({ id: "v2", role: UserRole.VEILLEUR }),
  ],
  totalElements: 3,
  totalPages: 1,
  size: 100,
  number: 0,
  numberOfElements: 3,
  first: true,
  last: true,
  empty: false,
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/useVeilleurs (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("interroge une page de comptes VALIDE de taille 100 et filtre role===VEILLEUR côté client", async () => {
    vi.mocked(listUsers).mockResolvedValueOnce(page);

    const { result } = renderHook(() => useVeilleurs(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(listUsers).toHaveBeenCalledWith({
      statutValidation: StatutValidation.VALIDE,
      page: 0,
      size: 100,
    });
    expect(result.current.data).toEqual([
      expect.objectContaining({ id: "v1" }),
      expect.objectContaining({ id: "v2" }),
    ]);
  });
});
