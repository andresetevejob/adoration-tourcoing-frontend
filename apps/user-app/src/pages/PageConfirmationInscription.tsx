import { Navigate, useLocation } from "react-router";
import { StatutValidation, type UserRole } from "@chapelle/shared/types";

interface ConfirmationInscriptionState {
  role: UserRole;
  statutValidation: StatutValidation;
}

function resolveMessage(statutValidation: StatutValidation): string {
  if (statutValidation === StatutValidation.VALIDE) {
    return "Votre compte est créé, vous pouvez vous connecter.";
  }
  return "Votre compte est en attente de validation par un administrateur.";
}

export default function PageConfirmationInscription() {
  const location = useLocation();
  const state = location.state as ConfirmationInscriptionState | undefined;

  if (!state) {
    return <Navigate to="/inscription" replace />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="mb-4 font-serif text-2xl font-semibold text-night-900">
        Inscription enregistrée
      </h1>
      <p className="text-night-700">{resolveMessage(state.statutValidation)}</p>
    </div>
  );
}
