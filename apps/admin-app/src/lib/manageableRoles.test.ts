import { describe, expect, it } from "vitest";
import { UserRole } from "@chapelle/shared/types";
import { MANAGEABLE_ROLES, MANAGEABLE_ROLE_OPTIONS, isManageableRole } from "./manageableRoles";

describe("lib/manageableRoles", () => {
  it("MANAGEABLE_ROLES ne contient que Adorateur et Veilleur", () => {
    expect(MANAGEABLE_ROLES).toEqual([UserRole.ADORATEUR, UserRole.VEILLEUR]);
  });

  it("MANAGEABLE_ROLE_OPTIONS reprend les mêmes rôles avec leurs libellés français", () => {
    expect(MANAGEABLE_ROLE_OPTIONS).toEqual([
      { value: UserRole.ADORATEUR, label: "Adorateur" },
      { value: UserRole.VEILLEUR, label: "Veilleur" },
    ]);
  });

  it.each([
    [UserRole.ADORATEUR, true],
    [UserRole.VEILLEUR, true],
    [UserRole.ADMINISTRATEUR, false],
    [UserRole.SUPERADMINISTRATEUR, false],
  ])("isManageableRole(%s) -> %s", (role, expected) => {
    expect(isManageableRole(role)).toBe(expected);
  });
});
