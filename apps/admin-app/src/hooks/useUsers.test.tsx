import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { StatutValidation, UserRole, type SpringPage, type UserResponse } from "@chapelle/shared/types";
import { listUsers } from "../api/endpoints/users";
import { useUsers } from "./useUsers";

vi.mock("../api/endpoints/users", () => ({
  listUsers: vi.fn(),
}));

function user(overrides: Partial<UserResponse>): UserResponse {
  return {
    id: "u1",
    email: "a@b.com",
    nom: "Dupont",
    prenoms: "Jean",
    role: UserRole.ADORATEUR,
    statutValidation: StatutValidation.VALIDE,
    dateCreation: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const page: SpringPage<UserResponse> = {
  content: [
    user({ id: "a1", role: UserRole.ADORATEUR }),
    user({ id: "admin1", role: UserRole.ADMINISTRATEUR }),
    user({ id: "v1", role: UserRole.VEILLEUR }),
    user({ id: "super1", role: UserRole.SUPERADMINISTRATEUR }),
  ],
  totalElements: 4,
  totalPages: 1,
  size: 20,
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

describe("hooks/useUsers (admin-app)", () => {
  it("interroge listUsers avec les filtres/page/size fournis", async () => {
    vi.mocked(listUsers).mockResolvedValueOnce(page);

    const { result } = renderHook(() => useUsers({ nom: "Dupont", page: 0, size: 20 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(listUsers).toHaveBeenCalledWith({ nom: "Dupont", page: 0, size: 20 });
  });

  it("filtre côté client les comptes Administrateur/SuperAdministrateur du résultat", async () => {
    vi.mocked(listUsers).mockResolvedValueOnce(page);

    const { result } = renderHook(() => useUsers({ page: 0, size: 20 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.content).toEqual([
      expect.objectContaining({ id: "a1" }),
      expect.objectContaining({ id: "v1" }),
    ]);
    expect(result.current.data?.totalElements).toBe(4);
  });
});
