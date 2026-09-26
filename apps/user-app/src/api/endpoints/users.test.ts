import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, StatutValidation, type UserResponse } from "@chapelle/shared/types";
import { updateUser } from "./users";

const { putMock } = vi.hoisted(() => ({ putMock: vi.fn() }));

vi.mock("../client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: putMock,
    delete: vi.fn(),
  },
}));

const user: UserResponse = {
  id: "1",
  email: "a@b.com",
  nom: "Dupont",
  prenoms: "Jean",
  role: UserRole.ADORATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

describe("api/endpoints/users (user-app)", () => {
  beforeEach(() => {
    putMock.mockReset();
  });

  it("updateUser() effectue un PUT sur /users/{id} avec le dto", async () => {
    putMock.mockResolvedValueOnce(user);

    const dto = { email: "a@b.com", nom: "Dupont", prenoms: "Jean", telephone: "0612345678" };
    const result = await updateUser("1", dto);

    expect(putMock).toHaveBeenCalledWith("/users/1", dto);
    expect(result).toBe(user);
  });
});
