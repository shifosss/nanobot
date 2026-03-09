import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-context";

export function LinkAccountPage() {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setErrorMessage(
        "Supabase is not configured. Add credentials to .env first.",
      );
      return;
    }

    setPending(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      navigate("/all-set", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentication failed.",
      );
    } finally {
      setPending(false);
    }
  }

  function handleOAuth(provider: "google" | "apple" | "facebook") {
    if (!supabase) return;
    void supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + "/all-set" },
    });
  }

  function handleSkip() {
    enterDemoMode();
    navigate("/all-set", { replace: true });
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-nano-new-white"
      style={{ colorScheme: "light" }}
    >
      {/* Progress bar — step 3 of 4 */}
      <div className="h-[4px] w-full bg-nano-muted">
        <div className="h-full w-3/4 bg-nano-black" />
      </div>

      <div className="mx-auto flex min-h-[calc(100%-4px)] max-w-[393px] items-center justify-center">
        <div className="flex w-[345px] flex-col gap-[48px]">
          {/* Header */}
          <div className="flex w-full flex-col gap-[8px]">
            <h2 className="text-center font-sf text-[30px] font-semibold leading-[36px] text-nano-black">
              Multi Login
            </h2>
            <p className="text-center font-sf text-[16px] leading-[24px] text-nano-shadow">
              Link to more accounts for safety
            </p>
          </div>

          {/* Form */}
          <form
            className="flex w-full flex-col gap-[24px]"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div className="flex flex-col">
              <label className="mb-[6px] font-sf text-[12px] font-medium uppercase leading-[16px] tracking-[0.3px] text-nano-black">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[49px] rounded-[14px] border border-nano-muted bg-nano-new-white px-[16px] font-sf text-[16px] leading-[24px] text-nano-black outline-none placeholder:text-nano-shadow"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="mb-[6px] font-sf text-[12px] font-medium uppercase leading-[16px] tracking-[0.3px] text-nano-black">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[49px] w-full rounded-[14px] border border-nano-muted bg-nano-new-white px-[16px] pr-[48px] font-sf text-[16px] leading-[24px] text-nano-black outline-none placeholder:text-nano-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2"
                >
                  {/* Eye icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4D4745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <p className="font-sf text-[12px] leading-[16px] text-nano-error">
                {errorMessage}
              </p>
            )}

            {/* Submit + Skip inside form for proper semantics */}
            <div className="flex w-full flex-col gap-[16px] pt-[24px]">
              <button
                type="submit"
                disabled={pending}
                className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-nano-teal font-sf text-[16px] font-medium leading-[24px] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] disabled:opacity-50"
              >
                {pending ? "Linking..." : "Link Account"}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-center font-sf text-[14px] font-medium leading-[20px] text-nano-teal"
              >
                Not for now
              </button>
            </div>
          </form>

          {/* Divider + Social */}
          <div className="flex w-full flex-col gap-[24px] border-t border-nano-muted pt-[25px]">
            <p className="text-center font-sf text-[12px] uppercase leading-[16px] tracking-[0.3px] text-nano-black">
              Or link with
            </p>

            {/* Social buttons */}
            <div className="flex items-center justify-center gap-[16px]">
              <button
                type="button"
                onClick={() => handleOAuth("facebook")}
                className="flex size-[56px] items-center justify-center rounded-full border border-nano-muted bg-white"
                aria-label="Sign in with Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("google")}
                className="flex size-[56px] items-center justify-center rounded-full border border-nano-muted bg-white"
                aria-label="Sign in with Google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("apple")}
                className="flex size-[56px] items-center justify-center rounded-full border border-nano-muted bg-white"
                aria-label="Sign in with Apple"
              >
                <svg width="16" height="20" viewBox="0 0 20 24" fill="black">
                  <path d="M15.77 12.7c-.02-2.17 1.77-3.22 1.85-3.27-1.01-1.47-2.58-1.67-3.13-1.7-1.33-.14-2.6.79-3.28.79-.68 0-1.72-.77-2.83-.75-1.46.02-2.8.85-3.55 2.15-1.52 2.63-.39 6.52 1.09 8.65.72 1.04 1.58 2.22 2.71 2.18 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.68.7 2.82.68 1.17-.02 1.91-1.06 2.63-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.87-2.3-3.48zM13.6 5.88c.6-.73 1.01-1.73.9-2.74-.86.04-1.91.58-2.53 1.3-.55.64-1.04 1.66-.91 2.64.96.07 1.95-.49 2.54-1.2z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-center gap-[4px]">
              <span className="font-sf text-[12px] leading-[16px] text-nano-shadow">
                By linking, you agree to our
              </span>
              <a href="#" className="font-sf text-[12px] font-medium leading-[16px] text-nano-teal">
                privacy policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
