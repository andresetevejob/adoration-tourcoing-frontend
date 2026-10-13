import type { ReactNode } from "react";
import type { EventContentArg } from "@fullcalendar/core";
import { UserRole } from "@chapelle/shared/types";
import { Badge } from "@chapelle/shared/ui";
import { formatTime } from "@chapelle/shared/utils";

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADORATEUR]: "Adorateur",
  [UserRole.VEILLEUR]: "Veilleur",
  [UserRole.ADMINISTRATEUR]: "Administrateur",
  [UserRole.SUPERADMINISTRATEUR]: "Super administrateur",
};

/**
 * Présentation uniquement (aucune logique métier) : affiche l'heure + le titre déjà
 * calculé par `mapPlanningEntryToEvent`, avec un badge "Ma réservation" si
 * `extendedProps.isMine` (toujours faux côté admin-app), et un badge `roleUtilisateur`
 * pour distinguer un Veilleur d'un Administrateur bénéficiaire d'un coup d'œil. N'affiche
 * jamais de bouton d'action (aucune annulation en U2, cf. conception U2 §6).
 *
 * En vue "Mois"/"Intervalle", affiche la plage `HH:mm – HH:mm` (début ET fin), construite
 * depuis `arg.event.start`/`arg.event.end` plutôt que le seul `arg.timeText` (début) fourni
 * par FullCalendar — un créneau reste toujours sur un seul jour calendaire (garanti côté
 * backend), donc pas de variante `dd/MM` à gérer. En vues "Jour" (`timeGridDay`) et "Semaine"
 * (`timeGridWeek`), grilles horaires où la hauteur du bloc rend déjà visuellement la durée :
 * on garde `arg.timeText` (début seul) pour éviter la redondance.
 */
export function renderPlanningEvent(arg: EventContentArg): ReactNode {
  const isMine = Boolean(arg.event.extendedProps.isMine);
  const roleUtilisateur = arg.event.extendedProps.roleUtilisateur as UserRole | undefined;
  const estGrilleHoraire = arg.view.type === "timeGridDay" || arg.view.type === "timeGridWeek";
  const timeText =
    !estGrilleHoraire && arg.event.start && arg.event.end
      ? `${formatTime(arg.event.start)} – ${formatTime(arg.event.end)}`
      : arg.timeText;

  return (
    <div className="flex flex-col gap-1 overflow-hidden px-1 py-0.5 text-xs">
      <div className="flex items-center gap-1">
        <span className="font-medium">{timeText}</span>
        <span className="truncate">{arg.event.title}</span>
      </div>
      <div className="flex items-center gap-1">
        {isMine && <Badge variant="info">Ma réservation</Badge>}
        {roleUtilisateur && <Badge variant="neutral">{ROLE_LABELS[roleUtilisateur]}</Badge>}
      </div>
    </div>
  );
}
