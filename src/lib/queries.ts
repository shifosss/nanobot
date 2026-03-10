import { supabase } from "@/lib/supabase";

/* ---- Row types returned by Supabase RPCs / tables ---- */

export interface DashboardSummaryRow {
  biomarker_id: number;
  biomarker_code: string;
  biomarker_name: string;
  category_id: number;
  category_name: string;
  category_order: number;
  unit: string;
  latest_value: number;
  latest_at: string;
  context: string;
  daily_avg: number | null;
  trend_7d: number[];
  trend_labels: string[];
  range_low: number | null;
  range_high: number | null;
  personal_range_low: number | null;
  personal_range_high: number | null;
}

export interface BiomarkerDetailRow {
  day_date: string;
  avg_value: number;
  min_value: number;
  max_value: number;
  context: string;
  readings: number;
}

export interface ProfileRow {
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

export interface SuggestedActionRow {
  id: number;
  biomarker_id: number | null;
  condition: string;
  action_text: string;
  priority: number;
}

export interface BiomarkerQuestionRow {
  id: string;
  profile_id: string;
  biomarker_id: number;
  reading_id: number;
  is_normal_activity: boolean | null;
  user_note: string | null;
  answered_at: string | null;
  created_at: string;
}

/* ---- Query functions ---- */

export async function fetchDashboardSummary(
  profileId: string,
): Promise<DashboardSummaryRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_dashboard_summary", {
    p_profile_id: profileId,
  });

  if (error) {
    console.error("fetchDashboardSummary error:", error);
    return [];
  }

  return (data as DashboardSummaryRow[]) ?? [];
}

export async function fetchBiomarkerDetail(
  profileId: string,
  biomarkerId: number,
  days = 28,
): Promise<BiomarkerDetailRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_biomarker_detail", {
    p_profile_id: profileId,
    p_biomarker_id: biomarkerId,
    p_days: days,
  });

  if (error) {
    console.error("fetchBiomarkerDetail error:", error);
    return [];
  }

  return (data as BiomarkerDetailRow[]) ?? [];
}

export async function fetchProfiles(
  accountId: string,
): Promise<ProfileRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchProfiles error:", error);
    return [];
  }

  return (data as ProfileRow[]) ?? [];
}

export async function fetchSuggestedActions(): Promise<SuggestedActionRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("suggested_actions")
    .select("*")
    .order("priority", { ascending: true });

  if (error) {
    console.error("fetchSuggestedActions error:", error);
    return [];
  }

  return (data as SuggestedActionRow[]) ?? [];
}

export async function fetchBiomarkerQuestions(
  profileId: string,
): Promise<BiomarkerQuestionRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("biomarker_questions")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchBiomarkerQuestions error:", error);
    return [];
  }

  return (data as BiomarkerQuestionRow[]) ?? [];
}
