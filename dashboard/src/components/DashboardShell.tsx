'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ScorecardData, PipelineData, HygieneData, RepData } from '@/lib/types';
import { ScorecardTable } from './ScorecardTable';
import { PipelineByStage } from './PipelineByStage';
import { CoverageRatio } from './CoverageRatio';
import { WeightedForecast } from './WeightedForecast';
import { VelocityTable } from './VelocityTable';
import { AgingAnalysis } from './AgingAnalysis';
import { HygieneSummary } from './HygieneSummary';
import { RepPerformance } from './RepPerformance';
import { Card } from './Card';
import { formatCurrency } from '@/lib/format';

const TABS = ['Scorecard', 'Pipeline', 'Hygiene', 'Reps'] as const;
type Tab = (typeof TABS)[number];

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function DashboardShell() {
  const [tab, setTab] = useState<Tab>('Scorecard');
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [hygiene, setHygiene] = useState<HygieneData | null>(null);
  const [reps, setReps] = useState<RepData | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sc, pl, hy, rp] = await Promise.all([
        fetch('/api/hubspot/scorecard').then((r) => r.json()),
        fetch('/api/hubspot/pipeline').then((r) => r.json()),
        fetch('/api/hubspot/hygiene').then((r) => r.json()),
        fetch('/api/hubspot/reps').then((r) => r.json()),
      ]);
      if (sc.error) throw new Error(sc.error);
      setScorecard(sc);
      setPipeline(pl);
      setHygiene(hy);
      setReps(rp);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const hygieneCount = hygiene?.summary.total ?? 0;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Sensor Bio — Sales Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">Real-time CRM analytics & pipeline health</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            {loading && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                Refreshing...
              </span>
            )}
            {lastRefresh && (
              <span>
                Updated{' '}
                {lastRefresh.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium transition hover:border-gray-500 hover:text-gray-200 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Hero KPI Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Total Pipeline"
            value={pipeline ? formatCurrency(pipeline.totalPipeline) : '—'}
            loading={!pipeline}
          />
          <KpiCard
            label="Weighted Forecast"
            value={pipeline ? formatCurrency(pipeline.weightedForecast) : '—'}
            loading={!pipeline}
          />
          <KpiCard
            label="Coverage Ratio"
            value={pipeline ? `${pipeline.coverageRatio.toFixed(1)}x` : '—'}
            accent={
              pipeline
                ? pipeline.coverageRatio >= 3
                  ? 'green'
                  : pipeline.coverageRatio >= 2
                    ? 'yellow'
                    : 'red'
                : undefined
            }
            loading={!pipeline}
          />
          <KpiCard
            label="Hygiene Issues"
            value={hygiene ? String(hygieneCount) : '—'}
            accent={
              hygiene
                ? hygieneCount === 0
                  ? 'green'
                  : hygieneCount <= 3
                    ? 'yellow'
                    : 'red'
                : undefined
            }
            loading={!hygiene}
          />
        </div>

        <div className="border-t border-gray-800/40" />

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-900/70 p-1 backdrop-blur">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t}
              {t === 'Hygiene' && hygieneCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 text-xs font-semibold text-red-400">
                  {hygieneCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {tab === 'Scorecard' && <ScorecardTable data={scorecard} />}
          {tab === 'Pipeline' && (
            <>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <PipelineByStage data={pipeline} />
                </div>
                <CoverageRatio data={pipeline} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <WeightedForecast data={pipeline} />
                <VelocityTable data={pipeline} />
              </div>
              <AgingAnalysis data={pipeline} />
            </>
          )}
          {tab === 'Hygiene' && <HygieneSummary data={hygiene} />}
          {tab === 'Reps' && <RepPerformance data={reps} />}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
  loading,
}: {
  label: string;
  value: string;
  accent?: 'green' | 'yellow' | 'red';
  loading?: boolean;
}) {
  const accentColors = {
    green: 'text-emerald-400',
    yellow: 'text-amber-400',
    red: 'text-red-400',
  };

  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</div>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-800" />
      ) : (
        <div className={`mt-1 text-2xl font-bold ${accent ? accentColors[accent] : 'text-white'}`}>
          {value}
        </div>
      )}
    </Card>
  );
}
