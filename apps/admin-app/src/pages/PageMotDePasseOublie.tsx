import { useState } from "react";
import { Link } from "react-router";
import type { ForgotPasswordRequest } from "@chapelle/shared/types";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";
import { useForgotPassword } from "../hooks/useForgotPassword";

const CONFIRMATION_MESSAGE = "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.";

export default function PageMotDePasseOublie() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPassword = useForgotPassword();

  function handleSubmit(dto: ForgotPasswordRequest): void {
    forgotPassword.mutate(dto, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center font-serif text-2xl font-semibold text-night-900">
        Mot de passe oublié
      </h1>
      {isSubmitted ? (
        <div className="text-center">
          <p className="text-night-500">{CONFIRMATION_MESSAGE}</p>
          <Link to="/connexion" className="mt-6 inline-block text-sm font-medium text-gold-600 hover:underline">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <ForgotPasswordForm isSubmitting={forgotPassword.isPending} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
