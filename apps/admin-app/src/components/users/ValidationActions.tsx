import { useState } from "react";
import { StatutValidation, type UserResponse } from "@chapelle/shared/types";
import { Button } from "@chapelle/shared/ui";
import { useValiderUser } from "../../hooks/useValiderUser";
import { useRejeterUser } from "../../hooks/useRejeterUser";
import { ConfirmActionModal } from "../common/ConfirmActionModal";

export interface ValidationActionsProps {
  user: UserResponse;
}

type PendingAction = "valider" | "rejeter" | null;

/**
 * Réutilisé tel quel dans deux contextes distincts (`UserTable`, `PageDetailUtilisateur`),
 * sans variante — cf. conception U4 §6.4. Retourne `null` si le compte n'est pas
 * `EN_ATTENTE` (rien à afficher pour un compte déjà `VALIDE`/`REJETE`).
 */
export function ValidationActions({ user }: ValidationActionsProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const validerUser = useValiderUser();
  const rejeterUser = useRejeterUser();

  if (user.statutValidation !== StatutValidation.EN_ATTENTE) {
    return null;
  }

  function closeModal(): void {
    setPendingAction(null);
  }

  function handleConfirm(): void {
    if (pendingAction === "valider") {
      validerUser.mutate(user.id, { onSuccess: closeModal });
    } else if (pendingAction === "rejeter") {
      rejeterUser.mutate(user.id, { onSuccess: closeModal });
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="primary"
        onClick={() => {
          setPendingAction("valider");
        }}
      >
        Valider
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => {
          setPendingAction("rejeter");
        }}
      >
        Rejeter
      </Button>
      <ConfirmActionModal
        isOpen={pendingAction !== null}
        title={pendingAction === "rejeter" ? "Confirmer le rejet du compte" : "Confirmer la validation du compte"}
        message={
          pendingAction === "rejeter"
            ? `Voulez-vous vraiment rejeter le compte de ${user.prenoms} ${user.nom} ?`
            : `Voulez-vous vraiment valider le compte de ${user.prenoms} ${user.nom} ?`
        }
        confirmLabel={pendingAction === "rejeter" ? "Rejeter" : "Valider"}
        confirmVariant={pendingAction === "rejeter" ? "danger" : "primary"}
        isSubmitting={pendingAction === "rejeter" ? rejeterUser.isPending : validerUser.isPending}
        onConfirm={handleConfirm}
        onClose={closeModal}
      />
    </div>
  );
}
