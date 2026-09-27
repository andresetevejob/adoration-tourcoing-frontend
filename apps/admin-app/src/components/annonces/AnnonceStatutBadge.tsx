import { Badge } from "@chapelle/shared/ui";
import { StatutAnnonce } from "@chapelle/shared/types";

export interface AnnonceStatutBadgeProps {
  statut: StatutAnnonce;
}

const STATUT_BADGE_VARIANT: Record<StatutAnnonce, "success" | "warning" | "neutral"> = {
  [StatutAnnonce.BROUILLON]: "neutral",
  [StatutAnnonce.PUBLIE]: "success",
  [StatutAnnonce.DEPUBLIE]: "warning",
};

const STATUT_LABEL: Record<StatutAnnonce, string> = {
  [StatutAnnonce.BROUILLON]: "Brouillon",
  [StatutAnnonce.PUBLIE]: "Publié",
  [StatutAnnonce.DEPUBLIE]: "Dépublié",
};

export function AnnonceStatutBadge({ statut }: AnnonceStatutBadgeProps) {
  return <Badge variant={STATUT_BADGE_VARIANT[statut]}>{STATUT_LABEL[statut]}</Badge>;
}
