import { Link } from "react-router";
import { AuthNav } from "./AuthNav";

const SITE_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/agenda", label: "Agenda" },
  { to: "/actualites", label: "Actualités" },
  { to: "/qui-sommes-nous", label: "Qui sommes-nous ?" },
  { to: "/contact", label: "Contact" },
];

/** Toujours les 5 liens, quel que soit l'état d'authentification (`/agenda` est public,
 *  cf. U2/U3) — `AuthNav` (U1, inchangé) gère seule la partie dépendante de l'auth. */
export function Navbar() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
      <div className="flex flex-wrap items-center gap-6">
        <Link to="/" className="font-serif text-lg font-semibold text-night-900">
          Chapelle du Vœux
        </Link>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {SITE_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-night-700 hover:text-gold-600">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <AuthNav />
    </nav>
  );
}
