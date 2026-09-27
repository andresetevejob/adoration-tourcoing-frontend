import { createBrowserRouter } from "react-router";
import { UserRole } from "@chapelle/shared/types";
import { setNavigate } from "./lib/navigation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import PageConnexion from "./pages/PageConnexion";
import PageMonCompte from "./pages/PageMonCompte";
import PagePlanning from "./pages/PagePlanning";
import Page403 from "./pages/Page403";
import Page404 from "./pages/Page404";
import PageGestionUtilisateurs from "./pages/PageGestionUtilisateurs";
import PageDetailUtilisateur from "./pages/PageDetailUtilisateur";
import PageAnnonces from "./pages/PageAnnonces";
import PageAnnonceCreation from "./pages/PageAnnonceCreation";
import PageAnnonceEdition from "./pages/PageAnnonceEdition";
import AdminsListPage from "./pages/superadmin/AdminsListPage";
import AdminCreatePage from "./pages/superadmin/AdminCreatePage";

const ADMIN_ROLES = [UserRole.ADMINISTRATEUR, UserRole.SUPERADMINISTRATEUR];

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/connexion", element: <PageConnexion /> },
      { path: "/non-autorise", element: <Page403 /> },
      { path: "*", element: <Page404 /> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <PageGestionUtilisateurs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/utilisateurs/:id",
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <PageDetailUtilisateur />
          </ProtectedRoute>
        ),
      },
      {
        path: "/planning",
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <PagePlanning />
          </ProtectedRoute>
        ),
      },
      {
        path: "/annonces",
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <PageAnnonces />
          </ProtectedRoute>
        ),
      },
      {
        path: "/annonces/nouveau",
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <PageAnnonceCreation />
          </ProtectedRoute>
        ),
      },
      {
        path: "/annonces/:id",
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <PageAnnonceEdition />
          </ProtectedRoute>
        ),
      },
      {
        path: "/administrateurs",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.SUPERADMINISTRATEUR]}>
            <AdminsListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/administrateurs/nouveau",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.SUPERADMINISTRATEUR]}>
            <AdminCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mon-compte",
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
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
