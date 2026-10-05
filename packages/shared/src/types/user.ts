export enum UserRole {
  ADORATEUR = "ADORATEUR",
  VEILLEUR = "VEILLEUR",
  ADMINISTRATEUR = "ADMINISTRATEUR",
  SUPERADMINISTRATEUR = "SUPERADMINISTRATEUR",
}

export enum StatutValidation {
  EN_ATTENTE = "EN_ATTENTE",
  VALIDE = "VALIDE",
  REJETE = "REJETE",
}

export interface UserResponse {
  id: string;
  email: string;
  telephone?: string;
  nom: string;
  prenoms: string;
  role: UserRole;
  statutValidation: StatutValidation;
  dateCreation: string;
  photo?: string | null;
}

export interface UserListFilters {
  email?: string;
  telephone?: string;
  nom?: string;
  prenoms?: string;
  statutValidation?: StatutValidation;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  nom: string;
  prenoms: string;
  telephone?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  email: string;
  nom: string;
  prenoms: string;
  telephone?: string;
  role?: UserRole;
}
