import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Élément racine #root introuvable");
}

/** Démarre le worker MSW (annonces, U6) uniquement en dev — import dynamique pour que
 *  Rollup élimine cette branche (et `msw/browser`) du bundle de production. */
async function prepareMocks(): Promise<void> {
  if (import.meta.env.MODE !== "development") return;
  const { worker } = await import("@chapelle/shared/mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

void prepareMocks()
  .catch((error: unknown) => {
    console.error("Échec du démarrage du worker MSW (mode développement) :", error);
  })
  .then(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
