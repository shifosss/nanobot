import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

export interface Account {
  id: string;
  email: string;
  account_type: "individual" | "parent";
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  account_id: string;
  display_name: string;
  date_of_birth: string;
  biological_sex: "male" | "female";
  height_cm: number | null;
  weight_kg: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  account: Account | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  demoMode: boolean;
  enterDemoMode: () => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
