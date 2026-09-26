import { useState } from "react";
import type { UserResponse } from "@chapelle/shared/types";
import { Input } from "@chapelle/shared/ui";
import { cn } from "@chapelle/shared/utils";

export interface VeilleurSelectProps {
  veilleurs: UserResponse[];
  value?: string;
  onChange: (id: string | undefined) => void;
  error?: string;
}

/**
 * `veilleurs` déjà filtrée par rôle (par `useVeilleurs`, §7.2) : ce composant effectue
 * en interne une recherche texte locale (nom/prénoms/email), sans nouvel appel réseau —
 * pas de `Select` HTML natif seul (peu utilisable pour une liste potentiellement longue).
 */
export function VeilleurSelect({ veilleurs, value, onChange, error }: VeilleurSelectProps) {
  const [query, setQuery] = useState("");
  const selected = veilleurs.find((veilleur) => veilleur.id === value);
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? veilleurs.filter((veilleur) =>
        `${veilleur.prenoms} ${veilleur.nom} ${veilleur.email}`.toLowerCase().includes(normalizedQuery),
      )
    : veilleurs;

  return (
    <div className="flex flex-col gap-2">
      <Input
        label="Rechercher un Veilleur"
        placeholder="Nom, prénoms ou email"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        error={error}
      />
      {selected && (
        <p className="text-sm text-night-700">
          Sélectionné : <span className="font-medium">{`${selected.prenoms} ${selected.nom}`}</span>
        </p>
      )}
      <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border border-pearl-dark p-2">
        {filtered.length === 0 && (
          <li className="px-2 py-1 text-sm text-night-500">Aucun Veilleur trouvé.</li>
        )}
        {filtered.map((veilleur) => (
          <li key={veilleur.id}>
            <button
              type="button"
              onClick={() => {
                onChange(veilleur.id);
              }}
              className={cn(
                "w-full rounded-md px-2 py-1 text-left text-sm hover:bg-night-50",
                veilleur.id === value && "bg-gold-50 font-medium",
              )}
            >
              {`${veilleur.prenoms} ${veilleur.nom}`}{" "}
              <span className="text-night-400">({veilleur.email})</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
