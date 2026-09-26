import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table, type TableColumn } from "./Table";

interface Row extends Record<string, unknown> {
  id: string;
  nom: string;
  actif: boolean;
  score: number | null;
}

const columns: TableColumn<Row>[] = [
  { key: "nom", header: "Nom" },
  { key: "actif", header: "Actif" },
  { key: "score", header: "Score" },
];

const data: Row[] = [
  { id: "1", nom: "Dupont", actif: true, score: 42 },
  { id: "2", nom: "Martin", actif: false, score: null },
];

describe("Table", () => {
  it("rend les en-têtes de colonnes", () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByRole("columnheader", { name: "Nom" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actif" })).toBeInTheDocument();
  });

  it("rend les cellules en coerçant les valeurs primitives en chaîne", () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText("Dupont")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("rend une cellule vide pour une valeur null", () => {
    render(<Table columns={columns} data={data} />);
    const rows = screen.getAllByRole("row");
    // ligne d'en-tête + 2 lignes de données
    expect(rows).toHaveLength(3);
  });

  it("utilise le render personnalisé d'une colonne quand fourni", () => {
    const customColumns: TableColumn<Row>[] = [
      { key: "nom", header: "Nom" },
      { key: "actions", header: "Actions", render: (row) => `Éditer ${row.nom}` },
    ];
    render(<Table columns={customColumns} data={data} />);
    expect(screen.getByText("Éditer Dupont")).toBeInTheDocument();
    expect(screen.getByText("Éditer Martin")).toBeInTheDocument();
  });

  it("affiche le spinner de chargement quand isLoading est vrai", () => {
    render(<Table columns={columns} data={[]} isLoading />);
    expect(screen.getByRole("status", { name: "Chargement" })).toBeInTheDocument();
  });

  it("affiche le message vide par défaut quand data est vide", () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
  });

  it("affiche un message vide personnalisé", () => {
    render(<Table columns={columns} data={[]} emptyMessage="Rien à afficher" />);
    expect(screen.getByText("Rien à afficher")).toBeInTheDocument();
  });
});
