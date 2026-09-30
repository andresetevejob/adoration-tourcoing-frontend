import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { Spinner } from "@chapelle/shared/ui";
import { UserRole } from "@chapelle/shared/types";
import { useAuth } from "../../hooks/useAuth";
import { resolvePostLoginRedirect } from "../../lib/resolvePostLoginRedirect";

const ADMIN_ROLES = [UserRole.ADMINISTRATEUR, UserRole.SUPERADMINISTRATEUR];

export interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isHydrated, isAuthenticated, role } = useAuth();

  if (!isHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={role ? resolvePostLoginRedirect(role, ADMIN_ROLES) : "/non-autorise"}
        replace
      />
    );
  }

  return <>{children}</>;
}
