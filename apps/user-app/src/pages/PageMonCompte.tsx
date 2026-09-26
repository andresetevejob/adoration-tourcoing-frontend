import { UserRole, type UpdateUserRequest } from "@chapelle/shared/types";
import { Card } from "@chapelle/shared/ui";
import { useAuth } from "../hooks/useAuth";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useMyBookings } from "../hooks/useMyBookings";
import { ProfileCard } from "../components/profile/ProfileCard";
import { ProfileEditForm } from "../components/profile/ProfileEditForm";
import { MyBookingsList } from "../components/profile/MyBookingsList";

export default function PageMonCompte() {
  const { user, role } = useAuth();
  const updateProfile = useUpdateProfile();
  const bookingsQuery = useMyBookings();

  if (!user) {
    return null;
  }

  function handleSubmit(dto: UpdateUserRequest): void {
    updateProfile.mutate(dto);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-night-900">Mon compte</h1>
      <ProfileCard user={user} />
      <Card title="Modifier mes informations">
        <ProfileEditForm
          defaultValues={{
            email: user.email,
            nom: user.nom,
            prenoms: user.prenoms,
            telephone: user.telephone ?? "",
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateProfile.isPending}
        />
      </Card>
      {role === UserRole.VEILLEUR && (
        <Card title="Mes réservations">
          <MyBookingsList bookings={bookingsQuery.data ?? []} isLoading={bookingsQuery.isLoading} />
        </Card>
      )}
    </div>
  );
}
