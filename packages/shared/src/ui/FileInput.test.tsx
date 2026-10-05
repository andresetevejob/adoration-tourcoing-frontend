import { createRef } from "react";
import { useForm } from "react-hook-form";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileInput } from "./FileInput";

/** `@testing-library/user-event` n'est pas une dépendance du repo : on simule la
 * sélection de fichier via `fireEvent.change` en fixant `files` directement sur
 * l'input, comme le fait déjà `input type="file"` en environnement jsdom. */
function uploadFile(input: HTMLInputElement, file: File): void {
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

describe("FileInput", () => {
  it("associe le label au champ et fixe type=file", () => {
    render(<FileInput label="Photo" />);
    const input = screen.getByLabelText<HTMLInputElement>("Photo");
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("file");
  });

  it("affiche l'erreur et aria-invalid quand error est fourni", () => {
    render(<FileInput label="Photo" error="La photo est obligatoire pour un compte Veilleur" />);
    expect(screen.getByLabelText("Photo")).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("La photo est obligatoire pour un compte Veilleur"),
    ).toBeInTheDocument();
  });

  it("n'affiche ni aria-invalid ni message d'erreur quand error est absent", () => {
    render(<FileInput label="Photo" />);
    expect(screen.getByLabelText("Photo")).toHaveAttribute("aria-invalid", "false");
  });

  it("transmet le ref vers l'élément input DOM", () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileInput label="Photo" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("file");
  });

  it("transmet les props natives héritées (accept)", () => {
    render(<FileInput label="Photo" accept="image/jpeg,image/png" />);
    expect(screen.getByLabelText("Photo")).toHaveAttribute("accept", "image/jpeg,image/png");
  });

  it("s'intègre avec react-hook-form via register() : le fichier sélectionné est transmis dans values", async () => {
    const onSubmit = vi.fn();

    function TestForm() {
      const { register, handleSubmit } = useForm<{ photo: FileList }>();
      return (
        <form
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
        >
          <FileInput label="Photo" {...register("photo")} />
          <button type="submit">Envoyer</button>
        </form>
      );
    }

    render(<TestForm />);
    const file = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    uploadFile(screen.getByLabelText<HTMLInputElement>("Photo"), file);
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const values = onSubmit.mock.calls[0][0] as { photo: FileList };
    expect(values.photo).toHaveLength(1);
    expect(values.photo[0]).toBe(file);
  });
});
