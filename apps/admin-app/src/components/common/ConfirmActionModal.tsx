import { Button, Modal } from "@chapelle/shared/ui";

export interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "danger";
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Composant générique, déplacé de `components/users/` vers `components/common/` (U6
 * §9.4) : réutilisé par `ValidationActions`/`PageDetailUtilisateur`/`AdminsListPage`
 * (module utilisateurs) et par `AnnonceList` (module annonces), hors de tout module
 * fonctionnel unique.
 */
export function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = "primary",
  isSubmitting,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={isSubmitting}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
