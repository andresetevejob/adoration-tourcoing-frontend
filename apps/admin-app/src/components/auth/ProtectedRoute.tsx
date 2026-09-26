import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Spinner } from "@chapelle/shared/ui";
import type { UserRole } from "@chapelle/shared/types";
import { useAuth } from "../../hooks/useAuth";

export interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isHydrated, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/non-autorise" replace />;
  }

  return <>{children}</>;
}
