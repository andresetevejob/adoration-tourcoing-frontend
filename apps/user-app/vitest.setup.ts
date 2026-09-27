import { afterAll, afterEach, beforeAll, expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { server } from "@chapelle/shared/mocks/server";
import { resetAnnoncesStore } from "@chapelle/shared/mocks/handlers";

// Note d'infrastructure de test : `@testing-library/jest-dom` est hoisté à la racine
// du monorepo alors que `vitest` reste installé localement dans chaque workspace
// (contrainte de peer dependency avec `@vitest/coverage-v8`, cf. rapport de tests U0).
// Le sous-chemin `@testing-library/jest-dom/vitest` fait `import "vitest"` depuis son
// propre emplacement (racine), où `vitest` n'existe pas, ce qui casse la résolution.
// On étend nous-mêmes `expect` avec `/matchers` (qui n'importe pas `vitest`) en utilisant
// le `vitest` local du workspace, pour que ce soit bien le même singleton `expect` que
// celui utilisé dans les fichiers de test.
expect.extend(matchers);

declare module "vitest" {
  // Fusion de déclaration TypeScript (TS2428) : le corps vide et le paramètre par défaut
  // `any` doivent reproduire exactement l'interface `Assertion` de vitest.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends matchers.TestingLibraryMatchers<unknown, T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining
    extends matchers.TestingLibraryMatchers<unknown, unknown> {}
}

/** Serveur MSW global (annonces, U6) : `onUnhandledRequest: "error"` sans risque de
 *  régression sur les tests U0-U5 (ceux-ci mockent `apiClient` via `vi.mock("../client")`,
 *  le `fetch` réel n'est jamais invoqué). Seuls les nouveaux tests de cette unité
 *  (hooks/pages consommant `apiClient` sans le mocker) transitent réellement par MSW. */
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
  resetAnnoncesStore();
});
afterAll(() => {
  server.close();
});
