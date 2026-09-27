import { useState } from "react";
import { useNavigate } from "react-router";
import { StatutAnnonce, type AnnonceResponse } from "@chapelle/shared/types";
import { Button } from "@chapelle/shared/ui";
import { useAnnonces } from "../hooks/useAnnonces";
import { useDeleteAnnonce } from "../hooks/useDeleteAnnonce";
import { usePublishAnnonce } from "../hooks/usePublishAnnonce";
import { AnnonceList } from "../components/annonces/AnnonceList";
import { ConfirmActionModal } from "../components/common/ConfirmActionModal";

/** `ProtectedRoute allowedRoles={ADMIN_ROLES}` (`router.tsx`) garantit déjà l'accès :
 * pas de garde de rôle supplémentaire à ajouter ici. Contrairement à `AdminsListPage`
 * (U5), l'édition navigue vers `/annonces/:id` plutôt que d'ouvrir une modale inline. */
export default function PageAnnonces() {
  const navigate = useNavigate();
  const [deletingAnnonce, setDeletingAnnonce] = useState<AnnonceResponse | null>(null);
  const annoncesQuery = useAnnonces();
  const deleteAnnonce = useDeleteAnnonce();
  const publishAnnonce = usePublishAnnonce();

  function handleConfirmDelete(): void {
    if (!deletingAnnonce) return;
    deleteAnnonce.mutate(deletingAnnonce.id, {
      onSuccess: () => {
        setDeletingAnnonce(null);
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-night-900">Gestion des annonces</h1>
        <Button
          onClick={() => {
            void navigate("/annonces/nouveau");
          }}
        >
          Ajouter une annonce
        </Button>
      </div>
      {annoncesQuery.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Impossible de charger les annonces. Veuillez réessayer plus tard.
        </p>
      ) : (
        <AnnonceList
          annonces={annoncesQuery.data ?? []}
          isLoading={annoncesQuery.isLoading}
          onEdit={(annonce) => {
            void navigate(`/annonces/${annonce.id}`);
          }}
          onDelete={setDeletingAnnonce}
          onTogglePublication={(annonce) => {
            publishAnnonce.mutate({
              id: annonce.id,
              statut: annonce.statut === StatutAnnonce.PUBLIE ? StatutAnnonce.DEPUBLIE : StatutAnnonce.PUBLIE,
            });
          }}
          isTogglingId={publishAnnonce.isPending ? publishAnnonce.variables.id : undefined}
        />
      )}
      <ConfirmActionModal
        isOpen={deletingAnnonce !== null}
        title="Supprimer l'annonce"
        message="Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmVariant="danger"
        isSubmitting={deleteAnnonce.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeletingAnnonce(null);
        }}
      />
    </div>
  );
}
