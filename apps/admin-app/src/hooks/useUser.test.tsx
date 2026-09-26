import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { StatutValidation, UserRole, type UserResponse } from "@chapelle/shared/types";
import { getUser } from "../api/endpoints/users";
import { useUser } from "./useUser";

vi.mock("../api/endpoints/users", () => ({
  getUser: vi.fn(),
}));

const admin: UserResponse = {
  id: "admin1",
  email: "admin@example.com",
  nom: "Curé",
  prenoms: "Michel",
  role: UserRole.ADMINISTRATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("hooks/useUser (admin-app)", () => {
  it("interroge getUser(id) et retourne la donnée non filtrée par rôle", async () => {
    vi.mocked(getUser).mockResolvedValueOnce(admin);

    const { result } = renderHook(() => useUser("admin1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(getUser).toHaveBeenCalledWith("admin1");
    expect(result.current.data).toEqual(admin);
  });
});
