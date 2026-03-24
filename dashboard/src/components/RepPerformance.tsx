'use client';

import type { RepData } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

export function RepPerformance({ data }: { data: RepData | null }) {
  if (!data) return <div className="text-gray-500">Loading rep data...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Rep Performance</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.reps.map((rep) => (
          <div key={rep.ownerId} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <div className="text-base font-semibold text-white">{rep.name}</div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <Stat label="Open Deals" value={String(rep.openDeals)} />
              <Stat label="Pipeline" value={formatCurrency(rep.pipelineValue)} />
              <Stat label="Closed Won" value={String(rep.closedWon)} />
              <Stat label="Won Value" value={formatCurrency(rep.closedWonValue)} />
              <Stat label="Avg Deal Age" value={`${rep.avgDealAge}d`} />
              <Stat
                label="Stale Deals"
                value={String(rep.staleDeals)}
                alert={rep.staleDeals > 0}
              />
              <Stat
                label="Hygiene Issues"
                value={String(rep.hygieneIssues)}
                alert={rep.hygieneIssues > 0}
              />
            </div>
          </div>
        ))}
      </div>
      {data.reps.length === 0 && (
        <div className="text-center text-gray-500">No rep data available.</div>
      )}
    </div>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`font-mono text-sm ${alert ? 'text-red-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}
