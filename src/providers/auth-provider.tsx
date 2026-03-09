import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  AuthContext,
  type Account,
  type AuthContextValue,
} from "@/providers/auth-context";

const DEMO_KEY = "nano-demo";

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [demoMode, setDemoMode] = useState(
    () => sessionStorage.getItem(DEMO_KEY) === "1",
  );
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);

  useEffect(() => {
    const authClient = supabase;

    if (!authClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function hydrateAccountState(
      userId: string,
      requestId: number,
      client: NonNullable<typeof authClient>,
    ) {
      const accountResult = await client
        .from("accounts")
        .select("id, email, account_type, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle();

      if (!active || requestId !== requestRef.current) {
        return;
      }

      if (accountResult.error) {
        console.error("Failed to load account:", accountResult.error);
      }

      setAccount((accountResult.data as Account | null) ?? null);
      setLoading(false);
    }

    function syncSignedOutState() {
      requestRef.current += 1;
      setSession(null);
      setAccount(null);
      setLoading(false);
    }

    function syncSignedInState(
      nextSession: Session,
      client: NonNullable<typeof authClient>,
    ) {
      requestRef.current += 1;
      const requestId = requestRef.current;

      setSession(nextSession);
      setLoading(true);

      void hydrateAccountState(nextSession.user.id, requestId, client);
    }

    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      if (!nextSession) {
        syncSignedOutState();
        return;
      }

      syncSignedInState(nextSession, authClient);
    });

    return () => {
      active = false;
      requestRef.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  function enterDemoMode() {
    sessionStorage.setItem(DEMO_KEY, "1");
    setDemoMode(true);
  }

  const value: AuthContextValue = {
    loading,
    session,
    account,
    demoMode,
    enterDemoMode,
    async signOut() {
      if (supabase) {
        await supabase.auth.signOut();
      }
      sessionStorage.removeItem(DEMO_KEY);
      setDemoMode(false);
      setAccount(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
