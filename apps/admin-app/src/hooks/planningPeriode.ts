export type PlanningPeriode =
  | { mode: "jour"; date: string } // yyyy-MM-dd
  | { mode: "mois"; annee: number; mois: number } // mois 1-12
  | { mode: "intervalle"; dateDebut: string; dateFin: string }; // yyyy-MM-dd, bornes incluses

export function periodeCacheKey(periode: PlanningPeriode): string {
  switch (periode.mode) {
    case "jour":
      return `jour:${periode.date}`;
    case "mois":
      return `mois:${String(periode.annee)}-${String(periode.mois).padStart(2, "0")}`;
    case "intervalle":
      return `intervalle:${periode.dateDebut}:${periode.dateFin}`;
  }
}
