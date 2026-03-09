import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="surface-card max-w-md p-8 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          This route does not exist.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Add the page to the React Router config in `src/router.tsx` or return
          to the main app shell.
        </p>
        <Link
          className="mt-6 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          to="/"
        >
          Back to app
        </Link>
      </div>
    </main>
  );
}
