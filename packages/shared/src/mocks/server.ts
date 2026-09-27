import { setupServer } from "msw/node";
import { annoncesHandlers } from "./handlers";

export const server: ReturnType<typeof setupServer> = setupServer(...annoncesHandlers);
