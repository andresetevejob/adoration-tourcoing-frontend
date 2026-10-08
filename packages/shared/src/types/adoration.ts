export interface CreneauActuelResponse {
  dateDebut: string;
  dateFin: string;
}

export interface StatutAdorationDirectResponse {
  enCours: boolean;
  creneauActuel: CreneauActuelResponse | null;
}
