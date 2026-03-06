import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { ChatWidget } from "../ChatWidget";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function AppShell() {
  const role = useAppSelector((state) => state.auth.role);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <SiteFooter />
      {role ? <ChatWidget /> : null}
    </div>
  );
}
