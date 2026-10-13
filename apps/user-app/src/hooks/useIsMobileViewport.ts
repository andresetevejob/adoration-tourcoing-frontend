import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

/** Réactif à `window.matchMedia("(max-width: 767px)")` — recalculé à l'abonnement (rotation
 *  d'écran, redimensionnement). Seuil 768px, identique à celui du drawer de navigation
 *  (`Navbar`), seule notion de "mobile" du projet. Pas de garde `typeof window === "undefined"` :
 *  `user-app` est un SPA Vite, jamais exécuté en SSR. */
export function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches);
    };
    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}
