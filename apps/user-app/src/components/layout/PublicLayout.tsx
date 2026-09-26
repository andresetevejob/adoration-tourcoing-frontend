import { Outlet } from "react-router";
import { AuthNav } from "./AuthNav";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="border-b border-pearl bg-white px-4 py-4">
        <AuthNav />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
