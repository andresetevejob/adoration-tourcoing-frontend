import { useNavigate, useLocation } from "react-router";
import { UserRole, type AuthResponse } from "@chapelle/shared/types";
import { LoginForm } from "../components/auth/LoginForm";
import { resolvePostLoginRedirect } from "../lib/resolvePostLoginRedirect";

const APP_ALLOWED_ROLES = [UserRole.ADORATEUR, UserRole.VEILLEUR];

interface ConnexionLocationState {
  from?: { pathname: string };
}

export default function PageConnexion() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ConnexionLocationState | null;

  function handleSuccess(response: AuthResponse): void {
    const redirectTo = resolvePostLoginRedirect(
      response.user.role,
      APP_ALLOWED_ROLES,
      state?.from?.pathname,
    );
    void navigate(redirectTo, { replace: true });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center font-serif text-2xl font-semibold text-night-900">
        Connexion
      </h1>
      <LoginForm onSuccess={handleSuccess} />
    </div>
  );
}
