import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./Toast";

function ToastTrigger({
  message = "Opération réussie",
  variant,
}: {
  message?: string;
  variant?: Parameters<ReturnType<typeof useToast>["show"]>[1];
}) {
  const { show } = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        show(message, variant);
      }}
    >
      Déclencher
    </button>
  );
}

function CrashingConsumer() {
  useToast();
  return null;
}

describe("useToast / ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lève une erreur quand useToast est utilisé hors ToastProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<CrashingConsumer />)).toThrow(
      "useToast doit être utilisé à l'intérieur d'un ToastProvider",
    );
    consoleError.mockRestore();
  });

  it("affiche un toast après appel de show()", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Réservation créée" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Déclencher" }));

    expect(screen.getByText("Réservation créée")).toBeInTheDocument();
  });

  it("applique la classe de la variante error", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Erreur serveur" variant="error" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Déclencher" }));

    expect(screen.getByText("Erreur serveur").className).toContain("bg-red-600");
  });

  it("retire automatiquement le toast après 4 secondes", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Disparition programmée" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Déclencher" }));
    expect(screen.getByText("Disparition programmée")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText("Disparition programmée")).not.toBeInTheDocument();
  });

  it("empile plusieurs toasts distincts", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Premier" />
        <ToastTrigger message="Second" />
      </ToastProvider>,
    );

    const buttons = screen.getAllByRole("button", { name: "Déclencher" });
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(screen.getByText("Premier")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
