import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getUserPhoto } from "../api/endpoints/users";

/**
 * Miroir de `apps/admin-app/src/hooks/useUserPhoto.ts` pour la gestion de l'URL objet
 * (cache du `Blob`, jamais de l'URL ; création/révocation en `useEffect` à chaque
 * changement de référence du `Blob` — voir le commentaire original pour le détail du
 * raisonnement, notamment le piège "revisite A→B→A").
 *
 * `hasPhoto` (optionnel, défaut `true`) : garde réseau optionnelle, cf. équivalent
 * admin-app (`enabled: hasPhoto`, paramètre obligatoire là-bas car `UserResponse.photo`
 * porte toujours un indicateur de présence pour ses appelants). Côté user-app, deux
 * familles d'appelants coexistent :
 * 1. Agenda (`ReservationConfirmModal`, `ReservationDetailModal`) : `PlanningEntryResponse`
 *    ne porte AUCUN indicateur de présence de photo — ces appelants n'ont rien à passer et
 *    comptent sur le défaut `true` (comportement inchangé : appel toujours tenté).
 * 2. `AuthNav` (navbar) : `UserResponse.photo` porte bien un indicateur de présence —
 *    `hasPhoto` y est passé explicitement (`Boolean(user?.photo)`) pour éviter tout appel
 *    réseau pour un Adorateur ou un Veilleur sans photo.
 *
 * `retry: false` : un 404 (pas de photo) est une issue COURANTE pour l'appelant agenda
 * (non gardé), pas une anomalie réseau transitoire. Conservé inconditionnellement même
 * quand `hasPhoto` est explicite (navbar) : un échec (403/réseau) n'y est pas plus une
 * anomalie transitoire à retenter.
 *
 * Dégradation silencieuse : ce hook ne lit/n'expose jamais `query.error` à ses appelants de
 * façon particulière — en cas d'erreur ou de `hasPhoto` à `false`, `data` reste `undefined`.
 */
export function useUserPhoto(
  userId: string,
  hasPhoto = true,
): Omit<UseQueryResult<Blob>, "data"> & { data: string | undefined } {
  const query = useQuery({
    queryKey: ["users", "photo", userId],
    queryFn: () => getUserPhoto(userId),
    enabled: hasPhoto,
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
