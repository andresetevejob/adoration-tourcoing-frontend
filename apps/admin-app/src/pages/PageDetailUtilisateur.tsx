import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { UpdateUserRequest } from "@chapelle/shared/types";
import { Button, Card, Spinner } from "@chapelle/shared/ui";
import { useUser } from "../hooks/useUser";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useDeleteUser } from "../hooks/useDeleteUser";
import { isManageableRole, MANAGEABLE_ROLE_OPTIONS } from "../lib/manageableRoles";
import { UserProfile } from "../components/users/UserProfile";
import { ValidationActions } from "../components/users/ValidationActions";
import { UserForm } from "../components/users/UserForm";
import { ConfirmActionModal } from "../components/common/ConfirmActionModal";

/** `ProtectedRoute`/`ADMIN_ROLES` (`router.tsx`) garantissent déjà l'accès : pas de
 * garde de rôle supplémentaire à ajouter ici, ni de `useAuth()` nécessaire. */
export default function PageDetailUtilisateur() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const userQuery = useUser(id ?? "");
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  if (userQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <p role="alert" className="mx-auto max-w-md text-center text-sm text-red-600">
        Utilisateur introuvable.
      </p>
    );
  }

  const user = userQuery.data;

  if (!isManageableRole(user.role)) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 text-center">
        <p className="text-sm text-night-700">Ce compte n'est pas géré par cette page.</p>
        <Link to="/" className="text-gold-700 hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  function handleUpdateSubmit(dto: UpdateUserRequest): void {
    if (!id) return;
    updateUser.mutate({ id, dto });
  }

  function handleConfirmDelete(): void {
    if (!id) return;
    deleteUser.mutate(id, {
      onSuccess: () => {
        void navigate("/");
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-night-900">Détail utilisateur</h1>
        <ValidationActions user={user} />
      </div>
      <UserProfile user={user} />
      <Card title="Modifier les informations">
        <UserForm
          mode="edit"
          roleOptions={MANAGEABLE_ROLE_OPTIONS}
          defaultValues={{
            email: user.email,
            nom: user.nom,
            prenoms: user.prenoms,
            telephone: user.telephone,
            role: user.role,
          }}
          isSubmitting={updateUser.isPending}
          onSubmit={handleUpdateSubmit}
        />
      </Card>
      <div>
        <Button
          variant="danger"
          onClick={() => {
            setIsDeleteModalOpen(true);
          }}
        >
          Supprimer
        </Button>
      </div>
      <ConfirmActionModal
        isOpen={isDeleteModalOpen}
        title="Supprimer l'utilisateur"
        message={`Voulez-vous vraiment supprimer le compte de ${user.prenoms} ${user.nom} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        isSubmitting={deleteUser.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
      />
    </div>
  );
}
