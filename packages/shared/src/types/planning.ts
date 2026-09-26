import type { UserRole } from "./user";

export interface PlanningEntryResponse {
  id: string;
  idUtilisateur: string;
  nomUtilisateur: string;
  prenomsUtilisateur: string;
  roleUtilisateur: UserRole;
  dateDebut: string;
  dateFin: string;
  description?: string;
  estArchivee: boolean;
  estAnonymise: boolean;
}
