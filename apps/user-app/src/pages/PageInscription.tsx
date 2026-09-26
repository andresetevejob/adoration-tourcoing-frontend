import { useNavigate } from "react-router";
import type { AuthResponse } from "@chapelle/shared/types";
import { RegisterForm } from "../components/auth/RegisterForm";

export default function PageInscription() {
  const navigate = useNavigate();

  function handleSuccess(response: AuthResponse): void {
    void navigate("/inscription/confirmation", {
      state: { role: response.user.role, statutValidation: response.user.statutValidation },
    });
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="mb-8 text-center font-serif text-2xl font-semibold text-night-900">
        Inscription
      </h1>
      <RegisterForm onSuccess={handleSuccess} />
    </div>
  );
}
