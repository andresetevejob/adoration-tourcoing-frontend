import { lazy, Suspense } from "react";
import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { ScrollToTop } from "./ScrollToTop";

/** En code-splitting (au même titre que les pages vitrine, cf. `router.tsx`) : le pied de
 *  page est sous la ligne de flottaison sur toutes les routes, non nécessaire au premier
 *  rendu, et contribuait significativement au dépassement du budget de bundle initial
 *  (NFR Performance, < 150 Ko gzip/app) puisqu'il est monté par le layout global. */
const Footer = lazy(() => import("./Footer").then((mod) => ({ default: mod.Footer })));

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="border-b border-pearl bg-white">
        <Navbar />
      </header>
      <ScrollToTop />
      <main className="flex-1">
        <Outlet />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
