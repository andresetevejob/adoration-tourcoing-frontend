import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  id: string; // id DOM du panneau — fourni par Navbar, référencé par aria-controls
  label: string; // aria-label du dialog, ex. "Menu"
  children: ReactNode; // contenu empilé verticalement (SITE_LINKS + AuthNav)
}

/**
 * Coquille générique overlay + panneau coulissant (slide depuis la droite), sans
 * connaissance de `SITE_LINKS`/`AuthNav` — `Navbar` lui fournit son contenu en `children`.
 * Montage conditionnel (comme `Modal`, cf. `packages/shared/src/ui/Modal.tsx`) : pas
 * d'animation de sortie, cohérence délibérée avec le composant existant.
 */
export function MobileDrawer({ isOpen, onClose, id, label, children }: MobileDrawerProps): ReactNode | null {
  const [isEntered, setIsEntered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animation d'entrée : un composant qui monte déjà dans son état final ne déclenche
  // aucune transition CSS, d'où le pattern "mount puis bascule de classe au frame suivant".
  // Dépendance à `isOpen` (pas `[]`) : `Navbar` rend `MobileDrawer` sans condition dans son
  // JSX — seul le `if (!isOpen) return null` ci-dessous produit l'absence de DOM, le composant
  // React lui-même n'est pas démonté/remonté entre deux ouvertures. Sans cette dépendance,
  // l'effet ne se déclencherait qu'une seule fois pour toute la durée de vie de `Navbar`,
  // et l'animation de glissement ne jouerait plus qu'à la toute première ouverture.
  useEffect(() => {
    if (!isOpen) {
      setIsEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setIsEntered(true);
    });
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ferme sur un clic de navigation (`<a>`, ex. liens `SITE_LINKS`/"Mon compte") ou d'action
  // (`<button>`, ex. "Déconnexion" dans `AuthNav`) — sans cette dernière, cliquer "Déconnexion"
  // déclenche `logout()` mais laisse le drawer et son overlay ouverts par-dessus le contenu qui
  // vient de basculer (AuthNav passe de "Mon compte/Déconnexion" à "Connexion/Inscription").
  function handleContentClick(event: MouseEvent<HTMLDivElement>): void {
    if (event.target instanceof Element && event.target.closest("a, button")) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-night-950/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        id={id}
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 z-10 flex w-72 max-w-[85vw] flex-col gap-6 bg-white p-6 shadow-xl transition-transform duration-300 ${
          isEntered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div onClick={handleContentClick}>{children}</div>
      </div>
    </div>
  );
}
