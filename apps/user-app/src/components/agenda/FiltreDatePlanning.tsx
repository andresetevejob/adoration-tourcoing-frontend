import { Button, Input } from "@chapelle/shared/ui";
import { toISODateString } from "@chapelle/shared/utils";

export interface FiltreDatePlanningProps {
  value: string; // yyyy-MM-dd
  onChange: (value: string) => void;
}

/**
 * Unique source de vérité de la date affichée (US-AGENDA-04, "sélecteur de période") :
 * la navigation prev/next/today intégrée de FullCalendar est désactivée
 * (`headerToolbar={false}`) pour éviter deux sources de vérité concurrentes pour la
 * même donnée.
 */
export function FiltreDatePlanning({ value, onChange }: FiltreDatePlanningProps) {
  return (
    <div className="flex items-end gap-2">
      <Input
        type="date"
        label="Date"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          onChange(toISODateString(new Date()));
        }}
      >
        Aujourd'hui
      </Button>
    </div>
  );
}
