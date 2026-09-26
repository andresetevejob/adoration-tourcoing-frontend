import { Input } from "@chapelle/shared/ui";

export interface FiltreMesReservationsProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Rendue uniquement pour le rôle Veilleur — condition portée par `PageAgenda`, pas par ce composant. */
export function FiltreMesReservations({ checked, onChange }: FiltreMesReservationsProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-night-800">
      <Input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
        className="h-4 w-4"
      />
      Mes réservations uniquement
    </label>
  );
}
