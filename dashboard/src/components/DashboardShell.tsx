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

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-white">Sensor Bio — Sales Dashboard</h1>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            {loading && (
              <span className="flex items-center gap-1">
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
              className="rounded border border-gray-700 px-2 py-1 text-xs hover:border-gray-500 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-gray-900 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t}
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
