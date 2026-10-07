import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useToast } from "@chapelle/shared/ui";
import { ResetPasswordForm, type ResetPasswordFormValues } from "../components/auth/ResetPasswordForm";
import { useResetPassword } from "../hooks/useResetPassword";

const ERROR_MESSAGE = "Ce lien de réinitialisation est invalide ou a expiré.";

export default function PageReinitialisationMotDePasse() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [hasFailed, setHasFailed] = useState(false);
  const navigate = useNavigate();
  const { show } = useToast();
  const resetPassword = useResetPassword();

  const showError = !token || hasFailed;

  function handleSubmit(values: ResetPasswordFormValues): void {
    resetPassword.mutate(
      { token: token!, newPassword: values.newPassword },
      {
        onSuccess: () => {
          show("Mot de passe réinitialisé. Vous pouvez vous connecter.", "success");
          void navigate("/connexion", { replace: true });
        },
        onError: () => {
          setHasFailed(true);
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center font-serif text-2xl font-semibold text-night-900">
        Réinitialisation du mot de passe
      </h1>
      {showError ? (
        <div className="text-center">
          <p className="text-night-500">{ERROR_MESSAGE}</p>
          <Link
            to="/mot-de-passe-oublie"
            className="mt-6 inline-block text-sm font-medium text-gold-600 hover:underline"
          >
            Redemander un email de réinitialisation
          </Link>
        </div>
      ) : (
        <ResetPasswordForm isSubmitting={resetPassword.isPending} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
