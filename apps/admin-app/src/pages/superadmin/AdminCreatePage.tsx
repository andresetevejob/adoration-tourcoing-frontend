import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { CreateUserRequest } from "@chapelle/shared/types";
import { Card } from "@chapelle/shared/ui";
import { useCreateUser } from "../../hooks/useCreateUser";
import { ADMIN_ROLE_OPTIONS } from "../../lib/adminRoles";
import { UserForm } from "../../components/users/UserForm";

/** `ProtectedRoute allowedRoles={[SUPERADMINISTRATEUR]}` (`router.tsx`, U1) garantit déjà
 * l'accès : pas de garde de rôle supplémentaire à ajouter ici, ni de `useAuth()` nécessaire. */
export default function AdminCreatePage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  function handleSubmit(dto: CreateUserRequest, photo?: File): void {
    setApiErrorMessage(null);
    createUser.mutate(
      { dto, photo },
      {
        onSuccess: () => {
          void navigate("/administrateurs");
        },
        onError: (error) => {
          setApiErrorMessage(error.message || "Une erreur est survenue, veuillez réessayer.");
        },
      },
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link to="/administrateurs" className="text-sm text-gold-700 hover:underline">
        Retour à la liste
      </Link>
      <Card title="Nouvel administrateur">
        <UserForm
          mode="create"
          roleOptions={ADMIN_ROLE_OPTIONS}
          isSubmitting={createUser.isPending}
          onSubmit={handleSubmit}
          onCancel={() => {
            void navigate("/administrateurs");
          }}
          apiErrorMessage={apiErrorMessage}
          onDismissError={() => setApiErrorMessage(null)}
        />
      </Card>
    </div>
  );
}
