import { useState } from "react";
import { useNavigate } from "react-router";
import type { UpdateUserRequest, UserResponse } from "@chapelle/shared/types";
import { Button, Modal } from "@chapelle/shared/ui";
import { useAdmins } from "../../hooks/useAdmins";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { useDeleteUser } from "../../hooks/useDeleteUser";
import { ADMIN_ROLE_OPTIONS } from "../../lib/adminRoles";
import { UserTable } from "../../components/users/UserTable";
import { UserForm } from "../../components/users/UserForm";
import { ConfirmActionModal } from "../../components/common/ConfirmActionModal";

/** `ProtectedRoute allowedRoles={[SUPERADMINISTRATEUR]}` (`router.tsx`, U1) garantit déjà
 * l'accès : pas de garde de rôle supplémentaire à ajouter ici, ni de `useAuth()` nécessaire. */
export default function AdminsListPage() {
  const navigate = useNavigate();
  const [editingAdmin, setEditingAdmin] = useState<UserResponse | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<UserResponse | null>(null);
  const adminsQuery = useAdmins();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  function handleUpdateSubmit(dto: UpdateUserRequest): void {
    if (!editingAdmin) return;
    updateUser.mutate(
      { id: editingAdmin.id, dto },
      {
        onSuccess: () => {
          setEditingAdmin(null);
        },
      },
    );
  }

  function handleConfirmDelete(): void {
    if (!deletingAdmin) return;
    deleteUser.mutate(deletingAdmin.id, {
      onSuccess: () => {
        setDeletingAdmin(null);
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-night-900">Gestion des administrateurs</h1>
        <Button
          onClick={() => {
            void navigate("/administrateurs/nouveau");
          }}
        >
          Ajouter un administrateur
        </Button>
      </div>
      {adminsQuery.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Impossible de charger les administrateurs. Veuillez réessayer plus tard.
        </p>
      ) : (
        <UserTable
          users={adminsQuery.data ?? []}
          isLoading={adminsQuery.isLoading}
          renderRowActions={(admin) => (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingAdmin(admin);
                }}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setDeletingAdmin(admin);
                }}
              >
                Supprimer
              </Button>
            </div>
          )}
        />
      )}
      {editingAdmin && (
        <Modal
          isOpen
          title="Modifier l'administrateur"
          onClose={() => {
            setEditingAdmin(null);
          }}
        >
          <UserForm
            mode="edit"
            roleOptions={ADMIN_ROLE_OPTIONS}
            defaultValues={{
              email: editingAdmin.email,
              nom: editingAdmin.nom,
              prenoms: editingAdmin.prenoms,
              telephone: editingAdmin.telephone,
              role: editingAdmin.role,
            }}
            isSubmitting={updateUser.isPending}
            onSubmit={handleUpdateSubmit}
            onCancel={() => {
              setEditingAdmin(null);
            }}
          />
        </Modal>
      )}
      <ConfirmActionModal
        isOpen={deletingAdmin !== null}
        title="Supprimer l'administrateur"
        message={
          deletingAdmin
            ? `Voulez-vous vraiment supprimer le compte de ${deletingAdmin.prenoms} ${deletingAdmin.nom} ? Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        confirmVariant="danger"
        isSubmitting={deleteUser.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeletingAdmin(null);
        }}
      />
    </div>
  );
}
