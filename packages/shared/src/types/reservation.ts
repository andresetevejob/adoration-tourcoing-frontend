export enum StatutReservation {
  EFFECTUEE = "EFFECTUEE",
  ANNULEE = "ANNULEE",
}

export interface BookingResponse {
  id: string;
  idUtilisateur: string;
  creatorId: string;
  dateDebut: string;
  dateFin: string;
  status: StatutReservation;
  description?: string;
  dateCreation: string;
  dateModification?: string;
  estArchivee: boolean;
}

export interface CreateBookingRequest {
  idUtilisateur?: string;
  dateDebut: string;
  dateFin: string;
  description?: string;
}
