import { useState } from "react";
import type { CreateUserRequest, UserListFilters } from "@chapelle/shared/types";
import { StatutValidation } from "@chapelle/shared/types";
import { Button, Modal, Pagination } from "@chapelle/shared/ui";
import { DEFAULT_PAGE_SIZE } from "@chapelle/shared/utils";
import { useUsers } from "../hooks/useUsers";
import { useCreateUser } from "../hooks/useCreateUser";
import { MANAGEABLE_ROLE_OPTIONS } from "../lib/manageableRoles";
import { UserFilters } from "../components/users/UserFilters";
import { UserTable } from "../components/users/UserTable";
import { UserForm } from "../components/users/UserForm";

/** `ProtectedRoute`/`ADMIN_ROLES` (`router.tsx`) garantissent déjà l'accès : pas de
 * garde de rôle supplémentaire à ajouter ici, ni de `useAuth()` nécessaire. */
export default function PageGestionUtilisateurs() {
  const [filters, setFilters] = useState<UserListFilters>({});
  const [page, setPage] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const usersQuery = useUsers({ ...filters, page, size: DEFAULT_PAGE_SIZE });
  const createUser = useCreateUser();

  function handleFiltersSubmit(values: UserListFilters): void {
    setFilters(values);
    setPage(0);
  }

  function handlePendingShortcut(): void {
    setFilters({ statutValidation: StatutValidation.EN_ATTENTE });
    setPage(0);
  }

  function handleCreateSubmit(dto: CreateUserRequest, photo?: File): void {
    createUser.mutate(
      { dto, photo },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      },
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-night-900">Gestion des utilisateurs</h1>
        <Button
          onClick={() => {
            setIsCreateModalOpen(true);
          }}
        >
          Ajouter un utilisateur
        </Button>
      </div>
      <UserFilters
        key={JSON.stringify(filters)}
        defaultValues={filters}
        onSubmit={handleFiltersSubmit}
        onPendingShortcut={handlePendingShortcut}
      />
      {usersQuery.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Impossible de charger les utilisateurs. Veuillez réessayer plus tard.
        </p>
      ) : (
        <>
          <UserTable users={usersQuery.data?.content ?? []} isLoading={usersQuery.isLoading} />
          <Pagination
            page={usersQuery.data?.number ?? 0}
            totalPages={usersQuery.data?.totalPages ?? 0}
            onPageChange={setPage}
          />
        </>
      )}
      {isCreateModalOpen && (
        <Modal
          isOpen
          title="Ajouter un utilisateur"
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
        >
          <UserForm
            mode="create"
            roleOptions={MANAGEABLE_ROLE_OPTIONS}
            isSubmitting={createUser.isPending}
            onSubmit={handleCreateSubmit}
            onCancel={() => {
              setIsCreateModalOpen(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
