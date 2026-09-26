import { Link } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import { useAuth } from "../../hooks/useAuth";

/**
 * Liens visibles et cliquables dès U1 (point ouvert n°3 de la conception U1) : ils
 * pointent vers des `PagePlaceholder` en attendant U2-U6, ce qui valide le routing
 * de bout en bout plutôt que de les masquer jusqu'à l'unité correspondante.
 */
export function Sidebar() {
  const { role } = useAuth();

  return (
    <nav className="flex w-56 flex-col gap-2 border-r border-pearl bg-white px-4 py-6 text-sm">
      <Link to="/" className="text-night-700 hover:text-gold-600">
        Utilisateurs
      </Link>
      <Link to="/planning" className="text-night-700 hover:text-gold-600">
        Planning
      </Link>
      <Link to="/annonces" className="text-night-700 hover:text-gold-600">
        Annonces
      </Link>
      {role === UserRole.SUPERADMINISTRATEUR && (
        <Link to="/administrateurs" className="text-night-700 hover:text-gold-600">
          Administrateurs
        </Link>
      )}
      <Link to="/mon-compte" className="text-night-700 hover:text-gold-600">
        Mon compte
      </Link>
    </nav>
  );
}
