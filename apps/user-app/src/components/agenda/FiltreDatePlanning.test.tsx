import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PlanningPeriode } from "../../hooks/planningPeriode";
import { FiltreDatePlanning, validateIntervalle } from "./FiltreDatePlanning";

describe("validateIntervalle", () => {
  it("retourne une erreur si l'une des deux dates est manquante", () => {
    expect(validateIntervalle("", "2026-01-05")).toBe("Les deux dates sont requises.");
    expect(validateIntervalle("2026-01-01", "")).toBe("Les deux dates sont requises.");
  });

  it("retourne une erreur si la date de fin précède la date de début", () => {
    expect(validateIntervalle("2026-01-10", "2026-01-01")).toBe(
      "La date de fin doit être postérieure ou égale à la date de début.",
    );
  });

  it("retourne une erreur si l'écart dépasse MAX_INTERVALLE_JOURS (31 jours)", () => {
    expect(validateIntervalle("2026-01-01", "2026-02-15")).toBe(
      "L'intervalle ne peut pas dépasser 31 jours.",
    );
  });

  it("n'retourne aucune erreur pour un intervalle valide (bornes égales incluses)", () => {
    expect(validateIntervalle("2026-01-01", "2026-01-01")).toBeUndefined();
    expect(validateIntervalle("2026-01-01", "2026-01-31")).toBeUndefined();
  });
});

describe("FiltreDatePlanning (user-app)", () => {
  describe("mode jour", () => {
    it("affiche la date fournie", () => {
      render(<FiltreDatePlanning value={{ mode: "jour", date: "2026-01-01" }} onChange={vi.fn()} />);

      expect(screen.getByLabelText("Vue")).toHaveValue("jour");
      expect(screen.getByLabelText("Date")).toHaveValue("2026-01-01");
    });

    it("appelle onChange avec la nouvelle date saisie", () => {
      const onChange = vi.fn();
      render(<FiltreDatePlanning value={{ mode: "jour", date: "2026-01-01" }} onChange={onChange} />);

      fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-02-15" } });

      expect(onChange).toHaveBeenCalledWith({ mode: "jour", date: "2026-02-15" });
    });

    it("appelle onChange avec la date du jour au clic sur « Aujourd'hui »", () => {
      const onChange = vi.fn();
      render(<FiltreDatePlanning value={{ mode: "jour", date: "2026-01-01" }} onChange={onChange} />);

      fireEvent.click(screen.getByRole("button", { name: "Aujourd'hui" }));

      expect(onChange).toHaveBeenCalledWith({
        mode: "jour",
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) as string,
      });
    });
  });

  describe("mode mois", () => {
    it("affiche le mois fourni", () => {
      render(<FiltreDatePlanning value={{ mode: "mois", annee: 2026, mois: 3 }} onChange={vi.fn()} />);

      expect(screen.getByLabelText("Vue")).toHaveValue("mois");
      expect(screen.getByLabelText("Mois")).toHaveValue("03/2026");
    });

    it("appelle onChange avec l'année et le mois saisis", () => {
      const onChange = vi.fn();
      render(<FiltreDatePlanning value={{ mode: "mois", annee: 2026, mois: 3 }} onChange={onChange} />);

      fireEvent.click(screen.getByLabelText("Mois"));
      fireEvent.click(screen.getByRole("option", { name: "Choose juillet 2026" }));

      expect(onChange).toHaveBeenCalledWith({ mode: "mois", annee: 2026, mois: 7 });
    });

    it("appelle onChange avec le mois courant au clic sur « Ce mois-ci »", () => {
      const onChange = vi.fn<(value: PlanningPeriode) => void>();
      render(<FiltreDatePlanning value={{ mode: "mois", annee: 2020, mois: 1 }} onChange={onChange} />);

      fireEvent.click(screen.getByRole("button", { name: "Ce mois-ci" }));

      expect(onChange).toHaveBeenCalledWith({
        mode: "mois",
        annee: expect.any(Number) as number,
        mois: expect.any(Number) as number,
      });
      const [[value]] = onChange.mock.calls;
      if (value.mode !== "mois") {
        throw new Error("onChange n'a pas été appelé avec le mode mois");
      }
      expect(value.mois).toBeGreaterThanOrEqual(1);
      expect(value.mois).toBeLessThanOrEqual(12);
    });
  });

  describe("mode intervalle", () => {
    it("affiche les dates de début et de fin fournies", () => {
      render(
        <FiltreDatePlanning
          value={{ mode: "intervalle", dateDebut: "2026-01-01", dateFin: "2026-01-05" }}
          onChange={vi.fn()}
        />,
      );

      // Pas d'assertion sur la valeur du Select "Vue" : l'option "intervalle" est
      // temporairement retirée de `MODE_OPTIONS`, un `<select>` natif sans `<option>`
      // correspondante à sa `value` ne reflète pas cette valeur dans le DOM.
      expect(screen.getByLabelText("Date de début")).toHaveValue("2026-01-01");
      expect(screen.getByLabelText("Date de fin")).toHaveValue("2026-01-05");
    });

    it("appelle onChange quand la nouvelle combinaison de dates est valide", () => {
      const onChange = vi.fn();
      render(
        <FiltreDatePlanning
          value={{ mode: "intervalle", dateDebut: "2026-01-01", dateFin: "2026-01-05" }}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByLabelText("Date de fin"), { target: { value: "2026-01-10" } });

      expect(onChange).toHaveBeenCalledWith({
        mode: "intervalle",
        dateDebut: "2026-01-01",
        dateFin: "2026-01-10",
      });
    });

    it("n'appelle pas onChange et affiche l'erreur quand la date de fin précède la date de début", () => {
      const onChange = vi.fn();
      render(
        <FiltreDatePlanning
          value={{ mode: "intervalle", dateDebut: "2026-01-10", dateFin: "2026-01-10" }}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByLabelText("Date de fin"), { target: { value: "2026-01-01" } });

      expect(onChange).not.toHaveBeenCalled();
      expect(
        screen.getByText("La date de fin doit être postérieure ou égale à la date de début."),
      ).toBeInTheDocument();
    });

    it("n'appelle pas onChange et affiche l'erreur quand l'écart dépasse 31 jours", () => {
      const onChange = vi.fn();
      render(
        <FiltreDatePlanning
          value={{ mode: "intervalle", dateDebut: "2026-01-01", dateFin: "2026-01-01" }}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByLabelText("Date de fin"), { target: { value: "2026-03-01" } });

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText("L'intervalle ne peut pas dépasser 31 jours.")).toBeInTheDocument();
    });
  });

  describe("changement de mode via le sélecteur « Vue »", () => {
    it("passer de jour à mois calcule une valeur par défaut sensée (mois courant)", () => {
      const onChange = vi.fn();
      render(<FiltreDatePlanning value={{ mode: "jour", date: "2026-01-01" }} onChange={onChange} />);

      fireEvent.change(screen.getByLabelText("Vue"), { target: { value: "mois" } });

      expect(onChange).toHaveBeenCalledWith({
        mode: "mois",
        annee: expect.any(Number) as number,
        mois: expect.any(Number) as number,
      });
    });

    // Option "Intervalle" temporairement retirée du Select "Vue" (réactivation prévue plus
    // tard) : ce test simule une sélection via le dropdown, impossible tant que l'option n'y
    // figure pas (`fireEvent.change` sur une valeur sans `<option>` correspondante).
    it.skip("passer de jour à intervalle calcule une valeur par défaut sensée (aujourd'hui-aujourd'hui)", () => {
      const onChange = vi.fn<(value: PlanningPeriode) => void>();
      render(<FiltreDatePlanning value={{ mode: "jour", date: "2026-01-01" }} onChange={onChange} />);

      fireEvent.change(screen.getByLabelText("Vue"), { target: { value: "intervalle" } });

      expect(onChange).toHaveBeenCalledTimes(1);
      const [[value]] = onChange.mock.calls;
      if (value.mode !== "intervalle") {
        throw new Error("onChange n'a pas été appelé avec le mode intervalle");
      }
      expect(value.dateDebut).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(value.dateDebut).toBe(value.dateFin);
    });

    it("passer d'intervalle à jour calcule la date du jour", () => {
      const onChange = vi.fn();
      render(
        <FiltreDatePlanning
          value={{ mode: "intervalle", dateDebut: "2026-01-01", dateFin: "2026-01-05" }}
          onChange={onChange}
        />,
      );

      fireEvent.change(screen.getByLabelText("Vue"), { target: { value: "jour" } });

      expect(onChange).toHaveBeenCalledWith({
        mode: "jour",
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) as string,
      });
    });
  });
});
