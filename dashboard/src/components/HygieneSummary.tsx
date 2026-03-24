'use client';

import type { HygieneData } from '@/lib/types';

const typeLabels: Record<string, string> = {
  stale: 'Stale Deals',
  overdue_task: 'Overdue Tasks',
  no_activity: 'No Recent Activity',
  missing_fields: 'Missing Fields',
};

const severityColors = {
  critical: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
};

export function HygieneSummary({ data }: { data: HygieneData | null }) {
  if (!data) return <div className="text-gray-500">Loading hygiene data...</div>;

  const grouped = new Map<string, typeof data.issues>();
  for (const issue of data.issues) {
    const existing = grouped.get(issue.type) || [];
    existing.push(issue);
    grouped.set(issue.type, existing);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-white">Pipeline Hygiene</h2>
        <span className="text-sm text-gray-400">{data.summary.total} issues</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Stale Deals" count={data.summary.stale} />
        <SummaryCard label="Overdue Tasks" count={data.summary.overdueTasks} />
        <SummaryCard label="No Activity" count={data.summary.noActivity} />
        <SummaryCard label="Missing Fields" count={data.summary.missingFields} />
      </div>

      {Array.from(grouped.entries()).map(([type, issues]) => (
        <div key={type} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">{typeLabels[type] || type}</h3>
          <div className="space-y-1">
            {issues.map((issue) => (
              <div
                key={`${issue.dealId}-${issue.type}`}
                className={`rounded border px-3 py-2 text-sm ${severityColors[issue.severity]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{issue.dealName}</span>
                  <span className="text-xs opacity-70">{issue.ownerName}</span>
                </div>
                <div className="mt-0.5 text-xs opacity-70">{issue.detail}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {data.summary.total === 0 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-400">
          All clear — no hygiene issues found.
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, count }: { label: string; count: number }) {
  const color = count === 0 ? 'text-emerald-400' : count <= 2 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="rounded border border-gray-800 bg-gray-900 p-3 text-center">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`mt-1 text-xl font-bold ${color}`}>{count}</div>
    </div>
  );
}
