import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
