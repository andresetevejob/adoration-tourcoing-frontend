import { Link, useNavigate, useParams } from "react-router";
import type { AnnonceCreateRequest } from "@chapelle/shared/types";
import { Card, Spinner } from "@chapelle/shared/ui";
import { useAnnonce } from "../hooks/useAnnonce";
import { useUpdateAnnonce } from "../hooks/useUpdateAnnonce";
import { AnnonceForm } from "../components/annonces/AnnonceForm";

/** `ProtectedRoute allowedRoles={ADMIN_ROLES}` (`router.tsx`) garantit déjà l'accès :
 * pas de garde de rôle supplémentaire à ajouter ici. Pas d'action Publier/Dépublier/
 * Supprimer sur cette page : ces actions restent exclusivement sur `PageAnnonces`
 * (cf. conception U6 §10.3). */
export default function PageAnnonceEdition() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const annonceQuery = useAnnonce(id ?? "");
  const updateAnnonce = useUpdateAnnonce();

  if (annonceQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (annonceQuery.isError || !annonceQuery.data) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 text-center">
        <p role="alert" className="text-sm text-red-600">
          Annonce introuvable.
        </p>
        <Link to="/annonces" className="text-gold-700 hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const annonce = annonceQuery.data;

  function handleUpdateSubmit(dto: Partial<AnnonceCreateRequest>): void {
    if (!id) return;
    updateAnnonce.mutate({ id, dto });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link to="/annonces" className="text-sm text-gold-700 hover:underline">
        Retour à la liste
      </Link>
      <Card title="Modifier l'annonce">
        <AnnonceForm
          key={id}
          mode="edit"
          defaultValues={{
            titre: annonce.titre,
            contenu: annonce.contenu,
            datePublication: annonce.datePublication,
          }}
          isSubmitting={updateAnnonce.isPending}
          onSubmit={handleUpdateSubmit}
          onCancel={() => {
            void navigate("/annonces");
          }}
        />
      </Card>
    </div>
  );
}
