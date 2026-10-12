import { useEffect, useState } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale/fr";
import { Button, Input, Select } from "@chapelle/shared/ui";
import { diffJoursInclusif, MAX_INTERVALLE_JOURS, toISODateString } from "@chapelle/shared/utils";
import type { PlanningPeriode } from "../../hooks/planningPeriode";

registerLocale("fr", fr);

export interface FiltreDatePlanningProps {
  value: PlanningPeriode;
  onChange: (value: PlanningPeriode) => void;
}

/** Mode "Intervalle" temporairement retiré du sélecteur (réactivation prévue plus tard) — le
 *  reste de la logique (validation, état `draftIntervalle`, rendu conditionnel) est conservé
 *  intact, seule l'option disparaît du `Select` "Vue". */
const MODE_OPTIONS = [
  { value: "jour", label: "Jour" },
  { value: "mois", label: "Mois" },
];

/** Validation client du plafond `MAX_INTERVALLE_JOURS` sur le mode "Intervalle", en
 *  complément du 422 backend — évite un aller-retour réseau inutile. Exportée pour être
 *  testable indépendamment du composant. */
export function validateIntervalle(dateDebut: string, dateFin: string): string | undefined {
  if (!dateDebut || !dateFin) return "Les deux dates sont requises.";
  if (dateFin < dateDebut) return "La date de fin doit être postérieure ou égale à la date de début.";
  if (diffJoursInclusif(dateDebut, dateFin) > MAX_INTERVALLE_JOURS) {
    return `L'intervalle ne peut pas dépasser ${String(MAX_INTERVALLE_JOURS)} jours.`;
  }
  return undefined;
}

function moisActuel(): { annee: number; mois: number } {
  const now = new Date();
  return { annee: now.getFullYear(), mois: now.getMonth() + 1 };
}

interface DraftIntervalle {
  dateDebut: string;
  dateFin: string;
}

/**
 * Unique source de vérité de la période affichée (US-AGENDA-04, "sélecteur de période") :
 * la navigation prev/next/today intégrée de FullCalendar est désactivée
 * (`headerToolbar={false}`) pour éviter deux sources de vérité concurrentes pour la
 * même donnée. Un `Select` pilote le mode ; changer de mode calcule immédiatement une
 * valeur par défaut sensée et notifie le parent — jamais de `PlanningPeriode` à moitié
 * initialisée. Le mode "Intervalle" est le seul à porter un état local (brouillon) : il
 * ne propage au parent que lorsque la combinaison de dates est valide (pas de requête
 * réseau invalide).
 */
export function FiltreDatePlanning({ value, onChange }: FiltreDatePlanningProps) {
  const [draftIntervalle, setDraftIntervalle] = useState<DraftIntervalle>(() =>
    value.mode === "intervalle"
      ? { dateDebut: value.dateDebut, dateFin: value.dateFin }
      : { dateDebut: toISODateString(new Date()), dateFin: toISODateString(new Date()) },
  );

  useEffect(() => {
    if (value.mode === "intervalle") {
      setDraftIntervalle({ dateDebut: value.dateDebut, dateFin: value.dateFin });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.mode]);

  function handleModeChange(mode: string): void {
    if (mode === "jour") {
      onChange({ mode: "jour", date: toISODateString(new Date()) });
    } else if (mode === "mois") {
      onChange({ mode: "mois", ...moisActuel() });
    } else {
      const today = toISODateString(new Date());
      onChange({ mode: "intervalle", dateDebut: today, dateFin: today });
    }
  }

  function updateDraftIntervalle(partial: Partial<DraftIntervalle>): void {
    const next = { ...draftIntervalle, ...partial };
    setDraftIntervalle(next);
    if (!validateIntervalle(next.dateDebut, next.dateFin)) {
      onChange({ mode: "intervalle", dateDebut: next.dateDebut, dateFin: next.dateFin });
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Select label="Vue" value={value.mode} options={MODE_OPTIONS} onChange={(event) => { handleModeChange(event.target.value); }} />
      {value.mode === "jour" && (
        <>
          <Input
            type="date"
            label="Date"
            value={value.date}
            onChange={(event) => {
              onChange({ mode: "jour", date: event.target.value });
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onChange({ mode: "jour", date: toISODateString(new Date()) });
            }}
          >
            Aujourd'hui
          </Button>
        </>
      )}
      {value.mode === "mois" && (
        <>
          <ReactDatePicker
            id="filtre-date-planning-mois"
            selected={new Date(value.annee, value.mois - 1, 1)}
            onChange={(date: Date | null) => {
              if (date) {
                onChange({ mode: "mois", annee: date.getFullYear(), mois: date.getMonth() + 1 });
              }
            }}
            showMonthYearPicker
            dateFormat="MM/yyyy"
            locale="fr"
            customInput={<Input label="Mois" />}
            portalId="datepicker-portal"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onChange({ mode: "mois", ...moisActuel() });
            }}
          >
            Ce mois-ci
          </Button>
        </>
      )}
      {value.mode === "intervalle" && (
        <>
          <Input
            type="date"
            label="Date de début"
            value={draftIntervalle.dateDebut}
            onChange={(event) => {
              updateDraftIntervalle({ dateDebut: event.target.value });
            }}
          />
          <Input
            type="date"
            label="Date de fin"
            value={draftIntervalle.dateFin}
            error={validateIntervalle(draftIntervalle.dateDebut, draftIntervalle.dateFin)}
            onChange={(event) => {
              updateDraftIntervalle({ dateFin: event.target.value });
            }}
          />
        </>
      )}
    </div>
  );
}
