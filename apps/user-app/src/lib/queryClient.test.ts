import { describe, expect, it } from "vitest";
import { queryClient } from "./queryClient";

describe("lib/queryClient", () => {
  it("désactive le retry automatique des requêtes", () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
  });

  it("désactive le refetch au focus de la fenêtre", () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });
});
