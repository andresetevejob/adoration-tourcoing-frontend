import { useId, useRef, useState } from "react";
import { Link } from "react-router";
import { AuthNav } from "./AuthNav";
import { MobileDrawer } from "./MobileDrawer";

const SITE_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/agenda", label: "Agenda" },
  { to: "/actualites", label: "Actualités" },
  { to: "/qui-sommes-nous", label: "Qui sommes-nous ?" },
  { to: "/contact", label: "Contact" },
];

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/** Toujours les 5 liens, quel que soit l'état d'authentification (`/agenda` est public,
 *  cf. U2/U3) — `AuthNav` (U1, inchangé) gère seule la partie dépendante de l'auth.
 *
 *  Sous 768px (`md`) : barre desktop masquée (`hidden md:flex`), bouton hamburger
 *  (`md:hidden`) ouvrant un `MobileDrawer` contenant les mêmes liens + `AuthNav`. La
 *  bascule desktop/mobile est purement CSS (pas de `useIsMobileViewport()` ici, cf.
 *  conception §1.4) : le bouton hamburger étant lui-même `md:hidden`, `isDrawerOpen` ne
 *  peut structurellement devenir vrai qu'en contexte mobile. */
export function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  function closeDrawer(): void {
    setIsDrawerOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <nav className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex flex-wrap items-center gap-6">
        <Link to="/" className="font-serif text-lg font-semibold text-night-900">
          Chapelle du Vœux
        </Link>
        <div className="hidden items-center gap-4 text-sm md:flex">
          {SITE_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-night-700 hover:text-gold-600">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="hidden md:flex">
        <AuthNav />
      </div>

      <button
        ref={triggerRef}
        type="button"
        className="flex h-11 w-11 items-center justify-center text-night-700 md:hidden"
        aria-expanded={isDrawerOpen}
        aria-controls={drawerId}
        aria-label={isDrawerOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => {
          setIsDrawerOpen((open) => !open);
        }}
      >
        <HamburgerIcon isOpen={isDrawerOpen} />
      </button>

      <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer} id={drawerId} label="Menu">
        <div className="flex flex-col gap-4 text-sm">
          {SITE_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-night-700 hover:text-gold-600">
              {link.label}
            </Link>
          ))}
        </div>
        <AuthNav />
      </MobileDrawer>
    </nav>
  );
}
