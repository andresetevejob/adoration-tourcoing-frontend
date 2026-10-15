import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useUserPhoto } from "../../hooks/useUserPhoto";

export function AuthNav() {
  const { isAuthenticated, user, logout } = useAuth();
  const hasPhoto = Boolean(user?.photo);
  const { data: photoUrl } = useUserPhoto(user?.id ?? "", hasPhoto);

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
      <Link
        to="/mon-compte"
        className="flex items-center gap-2 text-night-700 hover:text-gold-600"
      >
        {photoUrl && (
          <img src={photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        )}
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
