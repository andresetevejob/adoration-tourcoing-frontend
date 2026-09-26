import { Badge } from "@chapelle/shared/ui";
import { StatutValidation } from "@chapelle/shared/types";

export interface StatutValidationBadgeProps {
  statut: StatutValidation;
}

const STATUT_BADGE_VARIANT: Record<StatutValidation, "success" | "warning" | "danger"> = {
  [StatutValidation.VALIDE]: "success",
  [StatutValidation.EN_ATTENTE]: "warning",
  [StatutValidation.REJETE]: "danger",
};

const STATUT_LABEL: Record<StatutValidation, string> = {
  [StatutValidation.VALIDE]: "Validé",
  [StatutValidation.EN_ATTENTE]: "En attente",
  [StatutValidation.REJETE]: "Rejeté",
};

export function StatutValidationBadge({ statut }: StatutValidationBadgeProps) {
  return <Badge variant={STATUT_BADGE_VARIANT[statut]}>{STATUT_LABEL[statut]}</Badge>;
}
