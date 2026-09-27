import { setupWorker } from "msw/browser";
import { annoncesHandlers } from "./handlers";

export const worker: ReturnType<typeof setupWorker> = setupWorker(...annoncesHandlers);
