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
 * Seul composant réellement générique du module `UserManagementModule` (cf. conception
 * U4 §6.5) : réutilisé par `ValidationActions` (valider/rejeter) et par
 * `PageDetailUtilisateur` (suppression) — trois usages, un seul composant.
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
