import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { ToastProvider } from "@chapelle/shared/ui";
import { queryClient } from "./lib/queryClient";
import { router } from "./router";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}
