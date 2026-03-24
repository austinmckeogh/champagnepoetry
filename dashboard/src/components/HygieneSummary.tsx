'use client';

import type { HygieneData } from '@/lib/types';
import { Card } from './Card';

const typeLabels: Record<string, string> = {
  stale: 'Stale Deals',
  overdue_task: 'Overdue Tasks',
  no_activity: 'No Recent Activity',
  missing_fields: 'Missing Fields',
};

const typeIcons: Record<string, string> = {
  stale: '\u23F3',
  overdue_task: '\u26A0\uFE0F',
  no_activity: '\uD83D\uDCA4',
  missing_fields: '\uD83D\uDCCB',
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
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-white">Pipeline Hygiene</h2>
        <span className="text-sm text-gray-500">{data.summary.total} issues</span>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Stale Deals" count={data.summary.stale} icon={typeIcons.stale} />
          <SummaryCard label="Overdue Tasks" count={data.summary.overdueTasks} icon={typeIcons.overdue_task} />
          <SummaryCard label="No Activity" count={data.summary.noActivity} icon={typeIcons.no_activity} />
          <SummaryCard label="Missing Fields" count={data.summary.missingFields} icon={typeIcons.missing_fields} />
        </div>
      </Card>

      {Array.from(grouped.entries()).map(([type, issues]) => (
        <Card key={type}>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
            <span>{typeIcons[type] || ''}</span>
            {typeLabels[type] || type}
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-300">
              {issues.length}
            </span>
          </h3>
          <div className="mt-3 space-y-1.5">
            {issues.map((issue) => (
              <div
                key={`${issue.dealId}-${issue.type}`}
                className={`rounded-lg border px-3 py-2 text-sm ${severityColors[issue.severity]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{issue.dealName}</span>
                  <span className="text-xs opacity-70">{issue.ownerName}</span>
                </div>
                <div className="mt-0.5 text-xs opacity-70">{issue.detail}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {data.summary.total === 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/10 text-center">
          <div className="text-emerald-400">All clear — no hygiene issues found.</div>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ label, count, icon }: { label: string; count: number; icon: string }) {
  const color = count === 0 ? 'text-emerald-400' : count <= 2 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="rounded-lg border border-gray-800/60 bg-gray-800/30 p-3 text-center">
      <div className="text-xs text-gray-400">
        <span className="mr-1">{icon}</span>
        {label}
      </div>
      <div className={`mt-1 text-xl font-bold ${color}`}>{count}</div>
    </div>
  );
}
