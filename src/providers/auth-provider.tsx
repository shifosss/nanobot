import {
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContext, type AuthContextValue } from "@/providers/auth-context";

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authClient = supabase;

    if (!authClient) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadSession(client: NonNullable<typeof authClient>) {
      const {
        data: { session: nextSession },
      } = await client.auth.getSession();

      if (active) {
        setSession(nextSession);
        setLoading(false);
      }
    }

    void loadSession(authClient);

    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    loading,
    session,
    async signOut() {
      if (!supabase) {
        return;
      }

      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
