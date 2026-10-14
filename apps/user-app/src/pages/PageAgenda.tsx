import { lazy, Suspense, useState } from "react";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { CreateBookingRequest, PlanningEntryResponse } from "@chapelle/shared/types";
import { UserRole } from "@chapelle/shared/types";
import { Spinner } from "@chapelle/shared/ui";
import { toISODateString, toParisISOString } from "@chapelle/shared/utils";
import { useAuth } from "../hooks/useAuth";
import { usePlanning } from "../hooks/usePlanning";
import { periodeCacheKey, type PlanningPeriode } from "../hooks/planningPeriode";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { useCancelBooking } from "../hooks/useCancelBooking";
import { filterOwnEntries } from "../components/agenda/planningEntries";
import { FiltreDatePlanning } from "../components/agenda/FiltreDatePlanning";
import { FiltreMesReservations } from "../components/agenda/FiltreMesReservations";
import { ReservationForm, type ReservationFormValues } from "../components/agenda/ReservationForm";
import { ReservationConfirmModal } from "../components/agenda/ReservationConfirmModal";
import { ReservationDetailModal } from "../components/agenda/ReservationDetailModal";

// FullCalendar n'est chargé (chunk séparé) que lorsque ce composant est effectivement
// monté — jamais importé statiquement par cette page ni par `router.tsx` (§4.3.1).
const CalendrierReservations = lazy(() => import("../components/agenda/CalendrierReservations"));

/** Route publique (`PublicLayout`, non protégée) : `useAuth()` fonctionne indifféremment
 * connecté/non connecté, `usePlanning` n'a pas de garde `enabled` (`GET /planning` est public). */
export default function PageAgenda() {
  const [periode, setPeriode] = useState<PlanningPeriode>(() => ({
    mode: "jour",
    date: toISODateString(new Date()),
  }));
  const [mesReservationsUniquement, setMesReservationsUniquement] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [pendingCreateDto, setPendingCreateDto] = useState<CreateBookingRequest | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<PlanningEntryResponse | null>(null);
  const [bookingToView, setBookingToView] = useState<PlanningEntryResponse | null>(null);
  const { role, user } = useAuth();
  const planningQuery = usePlanning(periode);
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  const entries = planningQuery.data?.content ?? [];
  const visibleEntries =
    mesReservationsUniquement && user ? filterOwnEntries(entries, user.id) : entries;

  // Le filtre "mes réservations" masque des entrées : `selectOverlap` du calendrier ne
  // pourrait alors détecter un chevauchement qu'avec les entrées visibles, pas
  // l'ensemble réel du planning (cf. conception U3 §8.1, point ouvert n°5).
  const onSelectSlot =
    role === UserRole.VEILLEUR && !mesReservationsUniquement
      ? (info: DateSelectArg) => {
          setSelectedSlot({ start: toParisISOString(info.start), end: toParisISOString(info.end) });
        }
      : undefined;

  // `isMine` déjà calculé par `mapPlanningEntryToEvent` (`!estAnonymise`) : réutilisé tel
  // quel, pas de second calcul client. `entries` (pas `visibleEntries`) pour disposer de
  // tous les champs de `PlanningEntryResponse` (id, description, etc., cf. conception
  // U3 §8.1, point ouvert n°6 sur l'hypothèse `PlanningEntryResponse.id === BookingResponse.id`).
  // Déclenché désormais pour toute réservation (plus seulement les siennes) : route vers
  // la modale d'annulation si `isMine`, vers la modale de détail (lecture seule) sinon.
  const onEventClick =
    role === UserRole.VEILLEUR
      ? (info: EventClickArg) => {
          const fullEntry = entries.find((candidate) => candidate.id === info.event.id);
          if (!fullEntry) {
            return;
          }
          const isMine = Boolean(info.event.extendedProps.isMine);
          if (isMine) {
            setBookingToCancel(fullEntry);
          } else {
            setBookingToView(fullEntry);
          }
        }
      : undefined;

  function closeAll(): void {
    setSelectedSlot(null);
    setPendingCreateDto(null);
    setBookingToCancel(null);
    setBookingToView(null);
  }

  function handleReservationFormSubmit(values: ReservationFormValues): void {
    if (!selectedSlot) return;
    setPendingCreateDto({
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
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-night-900">Agenda</h1>
      <div className="flex flex-wrap items-end gap-4">
        <FiltreDatePlanning value={periode} onChange={setPeriode} />
        {role === UserRole.VEILLEUR && (
          <FiltreMesReservations
            checked={mesReservationsUniquement}
            onChange={setMesReservationsUniquement}
          />
        )}
      </div>
      {planningQuery.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Impossible de charger le planning. Veuillez réessayer plus tard.
        </p>
      ) : (
        <Suspense fallback={<Spinner size="lg" />}>
          <CalendrierReservations
            key={periodeCacheKey(periode)}
            periode={periode}
            entries={visibleEntries}
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
          beneficiaireLabel="Moi-même"
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
      {bookingToView && (
        <ReservationDetailModal isOpen onClose={closeAll} booking={bookingToView} />
      )}
    </div>
  );
}
