import { lazy, Suspense, useState } from "react";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { CreateBookingRequest, PlanningEntryResponse } from "@chapelle/shared/types";
import { Spinner } from "@chapelle/shared/ui";
import { toISODateString } from "@chapelle/shared/utils";
import { usePlanning } from "../hooks/usePlanning";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { useCancelBooking } from "../hooks/useCancelBooking";
import { useVeilleurs } from "../hooks/useVeilleurs";
import { FiltreDatePlanning } from "../components/planning/FiltreDatePlanning";
import { ReservationForm, type ReservationFormValues } from "../components/planning/ReservationForm";
import { ReservationConfirmModal } from "../components/planning/ReservationConfirmModal";

// FullCalendar n'est chargé (chunk séparé) que lorsque ce composant est effectivement
// monté — jamais importé statiquement par cette page ni par `router.tsx` (§4.3.1).
const CalendrierPlanningAdmin = lazy(() => import("../components/planning/CalendrierPlanningAdmin"));

/** `ProtectedRoute`/`ADMIN_ROLES` (`router.tsx`) garantissent déjà l'accès : pas de
 * garde de rôle supplémentaire à ajouter ici, ni de `useAuth()` nécessaire. */
export default function PagePlanning() {
  const [date, setDate] = useState(() => toISODateString(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [pendingCreateDto, setPendingCreateDto] = useState<CreateBookingRequest | null>(null);
  const [pendingBeneficiaireLabel, setPendingBeneficiaireLabel] = useState("Moi-même");
  const [bookingToCancel, setBookingToCancel] = useState<PlanningEntryResponse | null>(null);
  const planningQuery = usePlanning({ date });
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();
  const veilleursQuery = useVeilleurs();

  const entries = planningQuery.data?.content ?? [];

  function onSelectSlot(info: DateSelectArg): void {
    setSelectedSlot({ start: info.start.toISOString(), end: info.end.toISOString() });
  }

  // Aucune vérification `isMine` (contrairement à `PageAgenda`) : l'Administrateur peut
  // annuler n'importe quelle réservation (EF-4/US-ANNUL-03).
  function onEventClick(info: EventClickArg): void {
    const fullEntry = entries.find((candidate) => candidate.id === info.event.id);
    if (!fullEntry) return;
    setBookingToCancel(fullEntry);
  }

  function closeAll(): void {
    setSelectedSlot(null);
    setPendingCreateDto(null);
    setBookingToCancel(null);
  }

  function handleReservationFormSubmit(values: ReservationFormValues): void {
    if (!selectedSlot) return;
    const veilleur =
      values.beneficiaire === "veilleur"
        ? (veilleursQuery.data ?? []).find((candidate) => candidate.id === values.veilleurId)
        : undefined;
    setPendingBeneficiaireLabel(
      values.beneficiaire === "veilleur" && veilleur
        ? `${veilleur.prenoms} ${veilleur.nom}`
        : "Moi-même",
    );
    setPendingCreateDto({
      idUtilisateur: values.beneficiaire === "veilleur" ? values.veilleurId : undefined,
      dateDebut: selectedSlot.start,
      dateFin: selectedSlot.end,
      description: values.description || undefined,
    });
  }

  function handleConfirmCreate(): void {
    if (!pendingCreateDto) return;
    createBooking.mutate(pendingCreateDto, {
      onSuccess: closeAll,
    });
  }

  function handleConfirmCancel(): void {
    if (!bookingToCancel) return;
    cancelBooking.mutate(bookingToCancel.id, {
      onSuccess: closeAll,
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="font-serif text-2xl font-semibold text-night-900">Planning</h1>
      <FiltreDatePlanning value={date} onChange={setDate} />
      {planningQuery.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Impossible de charger le planning. Veuillez réessayer plus tard.
        </p>
      ) : (
        <Suspense fallback={<Spinner size="lg" />}>
          <CalendrierPlanningAdmin
            key={date}
            date={date}
            entries={entries}
            isLoading={planningQuery.isLoading}
            onSelectSlot={onSelectSlot}
            onEventClick={onEventClick}
          />
        </Suspense>
      )}
      {selectedSlot && !pendingCreateDto && (
        <ReservationForm
          isOpen
          onClose={closeAll}
          slot={selectedSlot}
          onSubmit={handleReservationFormSubmit}
        />
      )}
      {pendingCreateDto && (
        <ReservationConfirmModal
          variant="create"
          isOpen
          onClose={closeAll}
          dto={pendingCreateDto}
          beneficiaireLabel={pendingBeneficiaireLabel}
          isSubmitting={createBooking.isPending}
          onConfirm={handleConfirmCreate}
        />
      )}
      {bookingToCancel && (
        <ReservationConfirmModal
          variant="cancel"
          isOpen
          onClose={closeAll}
          booking={bookingToCancel}
          isSubmitting={cancelBooking.isPending}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}
