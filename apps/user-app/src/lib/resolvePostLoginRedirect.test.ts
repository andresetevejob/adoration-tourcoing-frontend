import { describe, expect, it } from "vitest";
import { UserRole } from "@chapelle/shared/types";
import { resolvePostLoginRedirect } from "./resolvePostLoginRedirect";

const APP_ALLOWED_ROLES = [UserRole.ADORATEUR, UserRole.VEILLEUR];

describe("resolvePostLoginRedirect", () => {
  it("redirige vers /non-autorise quand le rôle n'est pas autorisé pour cette app", () => {
    expect(
      resolvePostLoginRedirect(UserRole.ADMINISTRATEUR, APP_ALLOWED_ROLES, "/mon-compte"),
    ).toBe("/non-autorise");
  });

  it("redirige vers /non-autorise même sans 'from' fourni", () => {
    expect(resolvePostLoginRedirect(UserRole.SUPERADMINISTRATEUR, APP_ALLOWED_ROLES)).toBe(
      "/non-autorise",
    );
  });

  it("redirige vers 'from' quand le rôle est autorisé et 'from' est fourni", () => {
    expect(resolvePostLoginRedirect(UserRole.VEILLEUR, APP_ALLOWED_ROLES, "/mon-compte")).toBe(
      "/mon-compte",
    );
  });

  it("redirige vers '/' quand le rôle est autorisé et qu'aucun 'from' n'est fourni", () => {
    expect(resolvePostLoginRedirect(UserRole.ADORATEUR, APP_ALLOWED_ROLES)).toBe("/");
  });
});
