import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

export function SignInPage() {
  const location = useLocation();
  const initialMode =
    (location.state as { mode?: AuthMode } | null)?.mode ?? "sign-in";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setErrorMessage(
        "Set Database_Project_URL and Database_Public_Anon_Key in .env before using auth.",
      );
      return;
    }

    setPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setSuccessMessage(
          data.session
            ? "Account created. You are now signed in."
            : "Account created. Check your email to confirm the sign-up.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentication failed.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-10">
      <section className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-flex w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200">
            Browser-first setup
          </span>
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Figma-ready web structure, no Expo translation layer.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            This repo now uses standard React DOM, Tailwind, and global CSS so
            generated Figma screens can land directly in the codebase.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">UI stack</p>
              <p className="mt-2 text-sm text-slate-300">
                Tailwind utilities and regular CSS live under
                <span className="ml-1 font-mono text-slate-200">
                  src/styles
                </span>
                .
              </p>
            </div>
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Routing</p>
              <p className="mt-2 text-sm text-slate-300">
                Browser routes replace Expo file routing, which keeps Figma
                imports predictable.
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-8 sm:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Nanobot
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {mode === "sign-in" ? "Sign in" : "Create account"}
              </h2>
            </div>
            <button
              className="text-sm font-medium text-cyan-200 transition hover:text-cyan-100"
              onClick={() =>
                setMode((currentMode) =>
                  currentMode === "sign-in" ? "sign-up" : "sign-in",
                )
              }
              type="button"
            >
              {mode === "sign-in" ? "Need an account?" : "Have an account?"}
            </button>
          </div>

          {!isSupabaseConfigured ? (
            <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              Supabase is not configured. Add the public URL and anon key to
              <span className="mx-1 font-mono">.env</span>
              before using authentication.
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {successMessage}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </span>
              <input
                autoComplete="email"
                className="field-input"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                type="email"
                value={email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </span>
              <input
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                className="field-input"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                type="password"
                value={password}
              />
            </label>

            <button
              className="primary-button"
              disabled={pending}
              type="submit"
            >
              {pending
                ? "Working..."
                : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Want to swap this screen with a Figma export? Replace this page
            file, keep the route, and keep your shared styles in
            <span className="mx-1 font-mono text-slate-300">src/styles</span>.
          </p>

          <Link
            className="mt-4 inline-flex text-sm text-slate-400 transition hover:text-slate-200"
            to="/"
          >
            Go to app shell
          </Link>
        </div>
      </section>
    </main>
  );
}
