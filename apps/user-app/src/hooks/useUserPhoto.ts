import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getUserPhoto } from "../api/endpoints/users";

/**
 * Miroir de `apps/admin-app/src/hooks/useUserPhoto.ts` pour la gestion de l'URL objet
 * (cache du `Blob`, jamais de l'URL ; création/révocation en `useEffect` à chaque
 * changement de référence du `Blob` — voir le commentaire original pour le détail du
 * raisonnement, notamment le piège "revisite A→B→A").
 *
 * Deux différences volontaires avec la version admin-app :
 * 1. Pas de paramètre `hasPhoto`/`enabled` : `PlanningEntryResponse` ne porte aucun
 *    indicateur de présence de photo (contrairement à `UserResponse.photo`), donc rien ne
 *    permet de décider à l'avance s'il faut appeler l'API — l'appel est toujours tenté.
 * 2. `retry: false` : un 404 (pas de photo) est ici une issue COURANTE, pas une anomalie
 *    réseau transitoire (à la différence de l'appel admin-app, gardé par `hasPhoto` donc
 *    sensé réussir) — retenter 3 fois une absence de photo attendue serait un gaspillage
 *    réseau systématique. Un 403 (cf. `getUserPhoto`, "Point de vigilance backend") n'est pas
 *    plus retenté non plus : un nouvel essai échouerait identiquement.
 *
 * Dégradation silencieuse : ce hook ne lit/n'expose jamais `query.error` à ses appelants de
 * façon particulière — `query.isError` est bien calculé par `useQuery` (toujours accessible
 * via les champs spreadés de `UseQueryResult` si un futur appelant en avait besoin), mais
 * aucun composant de cette proposition (`ReservationCard`, `ReservationConfirmModal`,
 * `ReservationDetailModal`) ne le lit : en cas d'erreur, `query.data` reste `undefined`,
 * donc `photoUrl` aussi — le bloc photo est simplement absent, sans message d'erreur, par
 * construction plutôt que par un `catch` explicite.
 */
export function useUserPhoto(
  userId: string,
): Omit<UseQueryResult<Blob>, "data"> & { data: string | undefined } {
  const query = useQuery({
    queryKey: ["users", "photo", userId],
    queryFn: () => getUserPhoto(userId),
    retry: false,
  });

  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!query.data) {
      setPhotoUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(query.data);
    setPhotoUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [query.data]);

  return { ...query, data: photoUrl };
}
