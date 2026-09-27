import { StatutAnnonce, type AnnonceCreateRequest, type AnnonceResponse } from "../types/annonce";

function createInitialAnnonces(): AnnonceResponse[] {
  return [
    {
      id: "annonce-1",
      titre: "Nouveaux horaires d'adoration",
      contenu:
        "À partir de juillet, l'adoration eucharistique sera étendue à de nouveaux créneaux pour mieux vous accueillir. Elle sera également proposée tous les mardis et jeudis de 6h à 8h du matin, en plus des créneaux existants.",
      datePublication: "2026-06-02",
      statut: StatutAnnonce.PUBLIE,
    },
    {
      id: "annonce-2",
      titre: "Célébration de la Pentecôte 2026",
      contenu:
        "Rejoignez-nous pour la grande célébration de la Pentecôte, un temps fort de prière et de communion fraternelle. La veillée de prière débutera le samedi soir à 20h et se poursuivra toute la nuit.",
      datePublication: "2026-05-15",
      statut: StatutAnnonce.PUBLIE,
    },
    {
      id: "annonce-3",
      titre: "Retraite spirituelle d'été",
      contenu:
        "Inscrivez-vous dès maintenant pour la retraite spirituelle d'été qui se tiendra du 10 au 15 août sur le thème « L'oraison du cœur ».",
      datePublication: "2026-05-05",
      statut: StatutAnnonce.BROUILLON,
    },
    {
      id: "annonce-4",
      titre: "Concert de musique sacrée",
      contenu:
        "Le Chœur Grégorien de Paris donnera un concert exceptionnel dans la basilique. Réservation conseillée auprès de l'accueil.",
      datePublication: "2026-04-18",
      statut: StatutAnnonce.DEPUBLIE,
    },
  ];
}

let annonces: AnnonceResponse[] = createInitialAnnonces();

export function listAnnonces(statut?: StatutAnnonce): AnnonceResponse[] {
  const filtered = statut ? annonces.filter((annonce) => annonce.statut === statut) : annonces;
  return [...filtered].sort((a, b) => b.datePublication.localeCompare(a.datePublication));
}

export function getAnnonceById(id: string): AnnonceResponse | undefined {
  return annonces.find((annonce) => annonce.id === id);
}

export function createAnnonce(dto: AnnonceCreateRequest): AnnonceResponse {
  const annonce: AnnonceResponse = {
    id: crypto.randomUUID(),
    titre: dto.titre,
    contenu: dto.contenu,
    datePublication: dto.datePublication,
    statut: StatutAnnonce.BROUILLON,
  };
  annonces = [...annonces, annonce];
  return annonce;
}

export function updateAnnonce(id: string, dto: Partial<AnnonceCreateRequest>): AnnonceResponse | undefined {
  const existing = getAnnonceById(id);
  if (!existing) return undefined;
  const updated: AnnonceResponse = { ...existing, ...dto };
  annonces = annonces.map((annonce) => (annonce.id === id ? updated : annonce));
  return updated;
}

export function deleteAnnonce(id: string): boolean {
  const existed = annonces.some((annonce) => annonce.id === id);
  annonces = annonces.filter((annonce) => annonce.id !== id);
  return existed;
}

export function setAnnonceStatut(id: string, statut: StatutAnnonce): AnnonceResponse | undefined {
  const existing = getAnnonceById(id);
  if (!existing) return undefined;
  const updated: AnnonceResponse = { ...existing, statut };
  annonces = annonces.map((annonce) => (annonce.id === id ? updated : annonce));
  return updated;
}

export function resetAnnoncesStore(): void {
  annonces = createInitialAnnonces();
}
