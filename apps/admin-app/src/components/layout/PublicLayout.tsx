import { Link, Outlet } from "react-router";

/**
 * Cette page n'est visible que non connecté ou en 403/404 : rien de plus qu'un lien
 * Connexion, pas de navigation authentifiée à afficher ici (cf. `AdminLayout`).
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="border-b border-pearl bg-white px-4 py-4 text-right">
        <Link to="/connexion" className="text-sm text-night-700 hover:text-gold-600">
          Connexion
        </Link>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
