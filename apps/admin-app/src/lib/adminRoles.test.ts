import { describe, expect, it } from "vitest";
import { UserRole } from "@chapelle/shared/types";
import { ADMIN_ROLE_OPTIONS, isAdminAccount } from "./adminRoles";

describe("lib/adminRoles", () => {
  it("ADMIN_ROLE_OPTIONS ne contient que le rôle Administrateur", () => {
    expect(ADMIN_ROLE_OPTIONS).toEqual([{ value: UserRole.ADMINISTRATEUR, label: "Administrateur" }]);
  });

  it.each([
    [UserRole.ADMINISTRATEUR, true],
    [UserRole.SUPERADMINISTRATEUR, false],
    [UserRole.ADORATEUR, false],
    [UserRole.VEILLEUR, false],
  ])("isAdminAccount(%s) -> %s", (role, expected) => {
    expect(isAdminAccount(role)).toBe(expected);
  });
});
