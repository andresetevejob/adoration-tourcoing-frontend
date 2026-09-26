import { UserRole } from "@chapelle/shared/types";

/**
 * Contrepartie de `manageableRoles.ts` (U4) pour `AdminManagementModule` (U5) :
 * `MANAGEABLE_ROLES` (U4) exclut volontairement `ADMINISTRATEUR`/`SUPERADMINISTRATEUR`
 * (cf. conception U4 §4) — les réutiliser ici produirait une liste vide. `AdminsListPage`/
 * `AdminCreatePage` gèrent donc leur propre périmètre de rôle, strictement limité à
 * `ADMINISTRATEUR` (cf. conception U5 §2 : le Gherkin US-ADMINS-01 parle explicitement de
 * comptes de rôle `ADMINISTRATEUR`, pas `SUPERADMINISTRATEUR`).
 */
export const ADMIN_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: UserRole.ADMINISTRATEUR, label: "Administrateur" },
];

export function isAdminAccount(role: UserRole): boolean {
  return role === UserRole.ADMINISTRATEUR;
}
