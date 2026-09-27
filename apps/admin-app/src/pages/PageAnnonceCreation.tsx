import { Link, useNavigate } from "react-router";
import type { AnnonceCreateRequest } from "@chapelle/shared/types";
import { Card } from "@chapelle/shared/ui";
import { useCreateAnnonce } from "../hooks/useCreateAnnonce";
import { AnnonceForm } from "../components/annonces/AnnonceForm";

/** `ProtectedRoute allowedRoles={ADMIN_ROLES}` (`router.tsx`) garantit déjà l'accès :
 * pas de garde de rôle supplémentaire à ajouter ici. */
export default function PageAnnonceCreation() {
  const navigate = useNavigate();
  const createAnnonce = useCreateAnnonce();

  function handleSubmit(dto: AnnonceCreateRequest): void {
    createAnnonce.mutate(dto, {
      onSuccess: () => {
        void navigate("/annonces");
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link to="/annonces" className="text-sm text-gold-700 hover:underline">
        Retour à la liste
      </Link>
      <Card title="Nouvelle annonce">
        <AnnonceForm
          mode="create"
          isSubmitting={createAnnonce.isPending}
          onSubmit={handleSubmit}
          onCancel={() => {
            void navigate("/annonces");
          }}
        />
      </Card>
    </div>
  );
}
