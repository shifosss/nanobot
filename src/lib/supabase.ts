import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.Database_Project_URL;
const supabaseAnonKey = import.meta.env.Database_Public_Anon_Key;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
      },
    })
  : null;
