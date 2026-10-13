import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getUserPhoto } from "../api/endpoints/users";

/**
 * `enabled: hasPhoto` : aucun appel réseau si `user.photo` est `null` (cf. conception
 * `affichage-photo-veilleur-fiche-admin`). La donnée mise en cache par la query est le
 * `Blob` lui-même (donnée inerte, sans cycle de vie) — jamais l'URL objet. L'URL objet
 * consommable par un `<img src>` est créée localement dans un effet à chaque fois que la
 * référence du `Blob` change, et révoquée au prochain changement ou au démontage. Ainsi
 * aucune URL déjà révoquée ne peut être resservie depuis le cache de TanStack Query (ex.
 * navigation A → B → A avant expiration du `gcTime`).
 */
export function useUserPhoto(
  userId: string,
  hasPhoto: boolean,
): Omit<UseQueryResult<Blob>, "data"> & { data: string | undefined } {
  const query = useQuery({
    queryKey: ["users", "photo", userId],
    queryFn: () => getUserPhoto(userId),
    enabled: hasPhoto,
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
