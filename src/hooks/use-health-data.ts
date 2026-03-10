import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchDashboardSummary,
  fetchSuggestedActions,
  fetchBiomarkerQuestions,
} from "@/lib/queries";
import type {
  DashboardSummaryRow,
  SuggestedActionRow,
  BiomarkerQuestionRow,
} from "@/lib/queries";
import {
  buildDashboardData,
  buildCategoryData,
  sliceTrendForPeriod,
  type TimePeriod,
} from "@/lib/health-engine";
import {
  getDemoProfileUi,
  type DashboardData,
  type CategoryData,
} from "@/data/demo-health-ui";

export type { TimePeriod } from "@/lib/health-engine";

export interface HealthData {
  loading: boolean;
  error: string | null;
  dashboard: DashboardData | null;
  categories: CategoryData[];
  summaryRows: DashboardSummaryRow[];
  period: TimePeriod;
  setPeriod: (p: TimePeriod) => void;
}

/** Apply period-based slicing to the raw summary rows before building UI data. */
function applyPeriodToRows(
  rows: DashboardSummaryRow[],
  period: TimePeriod,
): DashboardSummaryRow[] {
  return rows.map((r) => {
    const { trend, labels } = sliceTrendForPeriod(
      r.trend_7d.map(Number),
      r.trend_labels,
      period,
    );
    return { ...r, trend_7d: trend, trend_labels: labels };
  });
}

export function useHealthData(): HealthData {
  const { activeProfile, demoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>("D");

  // Raw data from Supabase (full 28-day trends)
  const [rawRows, setRawRows] = useState<DashboardSummaryRow[]>([]);
  const [actions, setActions] = useState<SuggestedActionRow[]>([]);
  const [questions, setQuestions] = useState<BiomarkerQuestionRow[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (demoMode || !isSupabaseConfigured) {
      setIsDemo(true);
      setRawRows([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!activeProfile) {
      setLoading(true);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [rows, acts, qs] = await Promise.all([
          fetchDashboardSummary(activeProfile!.id),
          fetchSuggestedActions(),
          fetchBiomarkerQuestions(activeProfile!.id),
        ]);

        if (cancelled) return;

        if (rows.length === 0) {
          setIsDemo(true);
          setRawRows([]);
        } else {
          setIsDemo(false);
          setRawRows(rows);
          setActions(acts);
          setQuestions(qs);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("useHealthData fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setIsDemo(true);
        setRawRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [activeProfile, demoMode]);

  // Recompute dashboard + categories when period or raw data changes
  const { dashboard, categories, summaryRows } = useMemo(() => {
    if (isDemo || rawRows.length === 0) {
      const demo = getDemoProfileUi();
      return {
        dashboard: demo.dashboard,
        categories: demo.categories,
        summaryRows: [] as DashboardSummaryRow[],
      };
    }

    const sliced = applyPeriodToRows(rawRows, period);
    return {
      dashboard: buildDashboardData(sliced, actions),
      categories: buildCategoryData(sliced, actions, questions),
      summaryRows: sliced,
    };
  }, [isDemo, rawRows, actions, questions, period]);

  const handleSetPeriod = useCallback((p: TimePeriod) => setPeriod(p), []);

  return {
    loading,
    error,
    dashboard,
    categories,
    summaryRows,
    period,
    setPeriod: handleSetPeriod,
  };
}
