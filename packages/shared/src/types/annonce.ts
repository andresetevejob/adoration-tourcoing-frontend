export enum StatutAnnonce {
  BROUILLON = "BROUILLON",
  PUBLIE = "PUBLIE",
  DEPUBLIE = "DEPUBLIE",
}

export interface AnnonceResponse {
  id: string;
  titre: string;
  contenu: string;
  datePublication: string;
  statut: StatutAnnonce;
}

export interface AnnonceCreateRequest {
  titre: string;
  contenu: string;
  datePublication: string;
}
