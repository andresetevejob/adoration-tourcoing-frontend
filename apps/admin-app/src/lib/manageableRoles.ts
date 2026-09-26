import { UserRole } from "@chapelle/shared/types";

/**
 * Comptes gérés par `UserManagementModule` (U4) : `ADMINISTRATEUR`/`SUPERADMINISTRATEUR`
 * sont structurellement hors périmètre de ce module (`unit-of-work.md`, U5 —
 * `AdminManagementModule`, réutilisera `UserTable`/`UserForm` avec ses propres
 * `roleOptions`) — cf. conception U4 §4.
 */
export const MANAGEABLE_ROLES: UserRole[] = [UserRole.ADORATEUR, UserRole.VEILLEUR];

/**
 * Reprend exactement la forme/les libellés déjà utilisés par `RegisterForm.tsx`
 * (user-app, U1) — dupliqué plutôt que remonté dans `packages/shared`, cohérent avec
 * la politique déjà actée de ne pas factoriser au premier besoin identique entre les
 * deux apps indépendantes.
 */
export const MANAGEABLE_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: UserRole.ADORATEUR, label: "Adorateur" },
  { value: UserRole.VEILLEUR, label: "Veilleur" },
];

export function isManageableRole(role: UserRole): boolean {
  return MANAGEABLE_ROLES.includes(role);
}
