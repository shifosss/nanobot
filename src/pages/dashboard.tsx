import { useState } from "react";
import { useAuth } from "@/providers/auth-context";

export function DashboardPage() {
  const { session, signOut } = useAuth();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await signOut();
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm text-slate-400">
          Signed in as {session?.user.email ?? "unknown"}
        </p>
        <button
          className="mt-4 rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
          disabled={pending}
          onClick={handleSignOut}
          type="button"
        >
          {pending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </main>
  );
}
