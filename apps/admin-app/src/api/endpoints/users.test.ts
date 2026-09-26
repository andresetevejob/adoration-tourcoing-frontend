import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, StatutValidation, type SpringPage, type UserResponse } from "@chapelle/shared/types";
import { createUser, deleteUser, getUser, listUsers, rejeterUser, updateUser, validerUser } from "./users";

const { putMock, getMock, postMock, deleteMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
  getMock: vi.fn(),
  postMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("../client", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    put: putMock,
    delete: deleteMock,
  },
}));

const user: UserResponse = {
  id: "1",
  email: "admin@example.com",
  nom: "Curé",
  prenoms: "Michel",
  role: UserRole.ADMINISTRATEUR,
  statutValidation: StatutValidation.VALIDE,
  dateCreation: "2026-01-01T00:00:00Z",
};

const springPage: SpringPage<UserResponse> = {
  content: [user],
  totalElements: 1,
  totalPages: 1,
  size: 100,
  number: 0,
  numberOfElements: 1,
  first: true,
  last: true,
  empty: false,
};

describe("api/endpoints/users (admin-app)", () => {
  beforeEach(() => {
    putMock.mockReset();
    getMock.mockReset();
    postMock.mockReset();
    deleteMock.mockReset();
  });

  it("updateUser() effectue un PUT sur /users/{id} avec le dto et skipForbiddenRedirect", async () => {
    putMock.mockResolvedValueOnce(user);

    const dto = { email: "admin@example.com", nom: "Curé", prenoms: "Michel", telephone: "0612345678" };
    const result = await updateUser("1", dto);

    expect(putMock).toHaveBeenCalledWith("/users/1", dto, { skipForbiddenRedirect: true });
    expect(result).toBe(user);
  });

  it("listUsers() effectue un GET /users avec les query params fournis, y compris telephone", async () => {
    getMock.mockResolvedValueOnce(springPage);

    const result = await listUsers({
      statutValidation: StatutValidation.VALIDE,
      telephone: "0612345678",
      page: 0,
      size: 100,
    });

    expect(getMock).toHaveBeenCalledWith("/users", {
      nom: undefined,
      prenoms: undefined,
      email: undefined,
      telephone: "0612345678",
      statutValidation: StatutValidation.VALIDE,
      page: 0,
      size: 100,
    });
    expect(result).toBe(springPage);
  });

  it("getUser() effectue un GET /users/{id} sans skipForbiddenRedirect", async () => {
    getMock.mockResolvedValueOnce(user);

    const result = await getUser("1");

    expect(getMock).toHaveBeenCalledWith("/users/1");
    expect(result).toBe(user);
  });

  it("createUser() effectue un POST /users avec skipForbiddenRedirect", async () => {
    postMock.mockResolvedValueOnce(user);
    const dto = {
      email: "nouveau@example.com",
      password: "Password1!",
      nom: "Curé",
      prenoms: "Michel",
      role: UserRole.ADORATEUR,
    };

    const result = await createUser(dto);

    expect(postMock).toHaveBeenCalledWith("/users", dto, { skipForbiddenRedirect: true });
    expect(result).toBe(user);
  });

  it("deleteUser() effectue un DELETE /users/{id} avec skipForbiddenRedirect", async () => {
    deleteMock.mockResolvedValueOnce(undefined);

    await deleteUser("1");

    expect(deleteMock).toHaveBeenCalledWith("/users/1", { skipForbiddenRedirect: true });
  });

  it("validerUser() effectue un POST /users/{id}/valider avec skipForbiddenRedirect", async () => {
    postMock.mockResolvedValueOnce(user);

    const result = await validerUser("1");

    expect(postMock).toHaveBeenCalledWith("/users/1/valider", undefined, { skipForbiddenRedirect: true });
    expect(result).toBe(user);
  });

  it("rejeterUser() effectue un POST /users/{id}/rejeter avec skipForbiddenRedirect", async () => {
    postMock.mockResolvedValueOnce(user);

    const result = await rejeterUser("1");

    expect(postMock).toHaveBeenCalledWith("/users/1/rejeter", undefined, { skipForbiddenRedirect: true });
    expect(result).toBe(user);
  });
});
