import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/auth-context";

export function AppShell() {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-4rem] top-1/4 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>
      <div className="relative">
        <Outlet />
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="surface-card px-6 py-5 text-sm text-slate-300">
          Checking session...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate replace to="/welcome" />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="surface-card px-6 py-5 text-sm text-slate-300">
          Loading...
        </div>
      </div>
    );
  }

  if (session) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}
