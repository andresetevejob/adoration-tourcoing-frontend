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

  function handleSubmit(dto: CreateUserRequest, photo?: File): void {
    createUser.mutate(
      { dto, photo },
      {
        onSuccess: () => {
          void navigate("/administrateurs");
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
        />
      </Card>
    </div>
  );
}
