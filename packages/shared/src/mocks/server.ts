import { setupServer } from "msw/node";
import { annoncesHandlers, contactHandlers } from "./handlers";

export const server: ReturnType<typeof setupServer> = setupServer(...annoncesHandlers, ...contactHandlers);
