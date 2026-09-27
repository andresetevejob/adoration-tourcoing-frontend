const EXCERPT_MAX_LENGTH = 220;

/** Tronque `contenu` pour l'aperçu en carte (`PageActualites`) : ajoute une ellipse si
 *  tronqué, coupe sur un espace quand c'est possible pour ne pas couper un mot en deux. */
export function truncateExcerpt(contenu: string, maxLength: number = EXCERPT_MAX_LENGTH): string {
  if (contenu.length <= maxLength) return contenu;

  const truncated = contenu.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const cut = lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) : truncated;
  return `${cut}…`;
}
