import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnnonceForm } from "./AnnonceForm";

describe("components/annonces/AnnonceForm (admin-app)", () => {
  describe("mode create", () => {
    it("affiche titre, contenu et date de publication", () => {
      render(<AnnonceForm mode="create" isSubmitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />);

      expect(screen.getByLabelText("Titre")).toBeInTheDocument();
      expect(screen.getByLabelText("Contenu")).toBeInTheDocument();
      expect(screen.getByLabelText("Date de publication")).toBeInTheDocument();
    });

    it("appelle onSubmit avec un AnnonceCreateRequest valide", async () => {
      const onSubmit = vi.fn();
      render(<AnnonceForm mode="create" isSubmitting={false} onSubmit={onSubmit} onCancel={vi.fn()} />);

      fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Nouvelle annonce" } });
      fireEvent.change(screen.getByLabelText("Contenu"), { target: { value: "Contenu de l'annonce" } });
      fireEvent.change(screen.getByLabelText("Date de publication"), { target: { value: "2026-08-01" } });
      fireEvent.click(screen.getByRole("button", { name: "Créer" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          titre: "Nouvelle annonce",
          contenu: "Contenu de l'annonce",
          datePublication: "2026-08-01",
        });
      });
    });

    it("appelle onCancel au clic sur Annuler", () => {
      const onCancel = vi.fn();
      render(<AnnonceForm mode="create" isSubmitting={false} onSubmit={vi.fn()} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("n'appelle pas onSubmit si titre/contenu sont vides", async () => {
      const onSubmit = vi.fn();
      render(<AnnonceForm mode="create" isSubmitting={false} onSubmit={onSubmit} onCancel={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: "Créer" }));

      await waitFor(() => {
        expect(screen.getByLabelText("Titre")).toHaveAttribute("aria-invalid", "true");
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("mode edit", () => {
    const defaultValues = { titre: "Titre existant", contenu: "Contenu existant", datePublication: "2026-01-01" };

    it("pré-remplit les champs avec defaultValues", () => {
      render(<AnnonceForm mode="edit" defaultValues={defaultValues} isSubmitting={false} onSubmit={vi.fn()} />);

      expect(screen.getByLabelText<HTMLInputElement>("Titre").value).toBe("Titre existant");
      expect(screen.getByLabelText<HTMLInputElement>("Contenu").value).toBe("Contenu existant");
      expect(screen.getByLabelText<HTMLInputElement>("Date de publication").value).toBe("2026-01-01");
    });

    it("appelle onSubmit avec un Partial<AnnonceCreateRequest> modifié", async () => {
      const onSubmit = vi.fn();
      render(
        <AnnonceForm mode="edit" defaultValues={defaultValues} isSubmitting={false} onSubmit={onSubmit} />,
      );

      fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Titre modifié" } });
      fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          titre: "Titre modifié",
          contenu: "Contenu existant",
          datePublication: "2026-01-01",
        });
      });
    });

    it("n'affiche pas de bouton Annuler quand onCancel n'est pas fourni", () => {
      render(<AnnonceForm mode="edit" defaultValues={defaultValues} isSubmitting={false} onSubmit={vi.fn()} />);

      expect(screen.queryByRole("button", { name: "Annuler" })).not.toBeInTheDocument();
    });
  });
});
