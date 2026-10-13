export type PlanningPeriode =
  | { mode: "jour"; date: string } // yyyy-MM-dd
  | { mode: "semaine"; dateDebut: string } // yyyy-MM-dd, toujours un lundi — dateFin (dimanche) dérivée au point d'usage
  | { mode: "mois"; annee: number; mois: number } // mois 1-12
  | { mode: "intervalle"; dateDebut: string; dateFin: string }; // yyyy-MM-dd, bornes incluses

export function periodeCacheKey(periode: PlanningPeriode): string {
  switch (periode.mode) {
    case "jour":
      return `jour:${periode.date}`;
    case "semaine":
      return `semaine:${periode.dateDebut}`;
    case "mois":
      return `mois:${String(periode.annee)}-${String(periode.mois).padStart(2, "0")}`;
    case "intervalle":
      return `intervalle:${periode.dateDebut}:${periode.dateFin}`;
  }
}
