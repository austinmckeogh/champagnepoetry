'use client';

import type { RepData } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Card } from './Card';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const avatarColors = [
  'bg-indigo-500/20 text-indigo-400',
  'bg-violet-500/20 text-violet-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400',
];

export function RepPerformance({ data }: { data: RepData | null }) {
  if (!data) return <div className="text-gray-500">Loading rep data...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Rep Performance</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.reps.map((rep, idx) => (
          <Card key={rep.ownerId} className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  avatarColors[idx % avatarColors.length]
                }`}
              >
                {getInitials(rep.name)}
              </div>
              <div className="text-base font-semibold text-white">{rep.name}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
              <Stat label="Open Deals" value={String(rep.openDeals)} />
              <Stat label="Pipeline" value={formatCurrency(rep.pipelineValue)} />
              <div className="col-span-2 border-t border-gray-800/40" />
              <Stat label="Closed Won" value={String(rep.closedWon)} />
              <Stat label="Won Value" value={formatCurrency(rep.closedWonValue)} />
              <div className="col-span-2 border-t border-gray-800/40" />
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
          </Card>
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
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-mono text-sm ${alert ? 'text-red-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}
