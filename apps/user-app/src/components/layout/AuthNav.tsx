import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export function AuthNav() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <nav className="flex items-center justify-end gap-4 text-sm">
        <Link to="/connexion" className="text-night-700 hover:text-gold-600">
          Connexion
        </Link>
        <Link to="/inscription" className="text-night-700 hover:text-gold-600">
          Inscription
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-end gap-4 text-sm">
      <Link to="/mon-compte" className="text-night-700 hover:text-gold-600">
        Mon compte
      </Link>
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
        className="text-night-700 hover:text-gold-600"
      >
        Déconnexion
      </button>
    </nav>
  );
}
