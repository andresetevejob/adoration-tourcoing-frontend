import { setupWorker } from "msw/browser";
import { annoncesHandlers, contactHandlers } from "./handlers";

export const worker: ReturnType<typeof setupWorker> = setupWorker(...annoncesHandlers, ...contactHandlers);
