import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { StatutValidation, UserRole, type SpringPage, type UserResponse } from "@chapelle/shared/types";
import { listUsers } from "../api/endpoints/users";
import { useAdmins } from "./useAdmins";

vi.mock("../api/endpoints/users", () => ({
  listUsers: vi.fn(),
}));

function user(overrides: Partial<UserResponse>): UserResponse {
  return {
    id: "u1",
    email: "a@b.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.ADMINISTRATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const page: SpringPage<UserResponse> = {
  content: [
    user({ id: "admin1", role: UserRole.ADMINISTRATEUR }),
    user({ id: "super1", role: UserRole.SUPERADMINISTRATEUR }),
    user({ id: "veilleur1", role: UserRole.VEILLEUR }),
    user({ id: "admin2", role: UserRole.ADMINISTRATEUR }),
  ],
  totalElements: 4,
  totalPages: 1,
  size: 100,
  number: 0,
  numberOfElements: 4,
  first: true,
  last: true,
  empty: false,
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/useAdmins (admin-app)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("interroge une page de taille 100 (sans filtre statut) et filtre role===ADMINISTRATEUR côté client", async () => {
    vi.mocked(listUsers).mockResolvedValueOnce(page);

    const { result } = renderHook(() => useAdmins(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(listUsers).toHaveBeenCalledWith({ page: 0, size: 100 });
    expect(result.current.data).toEqual([
      expect.objectContaining({ id: "admin1" }),
      expect.objectContaining({ id: "admin2" }),
    ]);
  });
});
