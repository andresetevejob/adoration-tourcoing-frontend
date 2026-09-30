import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import { Spinner } from "@chapelle/shared/ui";
import { setNavigate } from "./lib/navigation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GuestRoute } from "./components/auth/GuestRoute";
import PublicLayout from "./components/layout/PublicLayout";
import PageConnexion from "./pages/PageConnexion";
import PageInscription from "./pages/PageInscription";
import PageConfirmationInscription from "./pages/PageConfirmationInscription";
import PageMonCompte from "./pages/PageMonCompte";
import PageAgenda from "./pages/PageAgenda";
import PageActualites from "./pages/PageActualites";
import PageContact from "./pages/PageContact";
import Page403 from "./pages/Page403";
import Page404 from "./pages/Page404";

/** Pages vitrine (U8) volumineuses (contenu statique dense, galerie, `AdorationLive`) et
 *  peu susceptibles d'être visitées en enchaînement immédiat depuis les autres routes :
 *  en code-splitting pour respecter le budget de bundle initial (< 150 Ko gzip/app, NFR
 *  Performance) que leur ajout dépassait sinon — même mécanisme (`lazy`+`Suspense`) que
 *  `CalendrierReservations` dans `PageAgenda`, appliqué ici à l'échelle de la page entière. */
const PageAccueil = lazy(() => import("./pages/PageAccueil"));
const PageQuiSommesNous = lazy(() => import("./pages/PageQuiSommesNous"));

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<Spinner size="lg" />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: withSuspense(<PageAccueil />) },
      {
        path: "/connexion",
        element: (
          <GuestRoute>
            <PageConnexion />
          </GuestRoute>
        ),
      },
      {
        path: "/inscription",
        element: (
          <GuestRoute>
            <PageInscription />
          </GuestRoute>
        ),
      },
      {
        path: "/inscription/confirmation",
        element: (
          <GuestRoute>
            <PageConfirmationInscription />
          </GuestRoute>
        ),
      },
      { path: "/agenda", element: <PageAgenda /> },
      { path: "/actualites", element: <PageActualites /> },
      { path: "/qui-sommes-nous", element: withSuspense(<PageQuiSommesNous />) },
      { path: "/contact", element: <PageContact /> },
      {
        path: "/mon-compte",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADORATEUR, UserRole.VEILLEUR]}>
            <PageMonCompte />
          </ProtectedRoute>
        ),
      },
      { path: "/non-autorise", element: <Page403 /> },
      { path: "*", element: <Page404 /> },
    ],
  },
]);

setNavigate((to, options) => {
  void router.navigate(to, options);
});
