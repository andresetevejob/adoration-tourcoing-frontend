import { Button } from "@chapelle/shared/ui";
import { cn } from "@chapelle/shared/utils";

export default function App() {
  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-ivory")}>
      <Button variant="primary">Administration — socle prêt</Button>
    </div>
  );
}
