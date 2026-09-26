import { createBrowserRouter } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import { setNavigate } from "./lib/navigation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";
import AppLayout from "./components/layout/AppLayout";
import PageAccueil from "./pages/PageAccueil";
import PageConnexion from "./pages/PageConnexion";
import PageInscription from "./pages/PageInscription";
import PageConfirmationInscription from "./pages/PageConfirmationInscription";
import PageMonCompte from "./pages/PageMonCompte";
import PageAgenda from "./pages/PageAgenda";
import Page403 from "./pages/Page403";
import Page404 from "./pages/Page404";
import PagePlaceholder from "./pages/PagePlaceholder";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <PageAccueil /> },
      { path: "/connexion", element: <PageConnexion /> },
      { path: "/inscription", element: <PageInscription /> },
      { path: "/inscription/confirmation", element: <PageConfirmationInscription /> },
      { path: "/agenda", element: <PageAgenda /> },
      { path: "/actualites", element: <PagePlaceholder title="Actualités" /> }, // U6
      { path: "/qui-sommes-nous", element: <PagePlaceholder title="Qui sommes-nous ?" /> }, // U8
      { path: "/contact", element: <PagePlaceholder title="Contact" /> }, // U7
      { path: "/non-autorise", element: <Page403 /> },
      { path: "*", element: <Page404 /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/mon-compte",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADORATEUR, UserRole.VEILLEUR]}>
            <PageMonCompte />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

setNavigate((to, options) => {
  void router.navigate(to, options);
});
