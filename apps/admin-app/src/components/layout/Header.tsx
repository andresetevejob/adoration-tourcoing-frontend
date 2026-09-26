import { UserRole } from "@chapelle/shared/types";
import { useAuth } from "../../hooks/useAuth";

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADORATEUR]: "Adorateur",
  [UserRole.VEILLEUR]: "Veilleur",
  [UserRole.ADMINISTRATEUR]: "Administrateur",
  [UserRole.SUPERADMINISTRATEUR]: "Super administrateur",
};

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-pearl bg-white px-6 py-4">
      <span className="font-serif text-lg font-semibold text-night-900">
        Administration — Chapelle du Vœux
      </span>
      {user && (
        <div className="flex items-center gap-4 text-sm text-night-700">
          <span>
            {user.prenoms} {user.nom} — {ROLE_LABELS[user.role]}
          </span>
          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="text-gold-700 hover:underline"
          >
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
}
