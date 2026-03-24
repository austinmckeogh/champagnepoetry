'use client';

import type { ScorecardData } from '@/lib/types';
import { TrafficLight } from './TrafficLight';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';

function formatMetricValue(actual: number, unit: string): string {
  if (unit === '$') return formatCurrency(actual);
  if (unit === '%') return formatPercent(actual);
  if (unit === 'days') return `${actual}d`;
  return formatNumber(actual);
}

function formatGoalValue(goal: number, unit: string): string {
  if (unit === '$') return formatCurrency(goal);
  if (unit === '%') return `${goal}%`;
  if (unit === 'days') return `< ${goal}d`;
  return formatNumber(goal);
}

export function ScorecardTable({ data }: { data: ScorecardData | null }) {
  if (!data) return <div className="text-gray-500">Loading scorecard...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-white">EOS Scorecard</h2>
        <span className="text-sm text-gray-400">{data.weekLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="pb-2 pr-4">#</th>
              <th className="pb-2 pr-4">Metric</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4 text-right">Goal</th>
              <th className="pb-2 pr-4 text-right">Actual</th>
              <th className="pb-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.metrics.map((m) => (
              <tr key={m.id} className="border-b border-gray-800/50">
                <td className="py-2 pr-4 text-gray-500">{m.id}</td>
                <td className="py-2 pr-4 text-white">{m.name}</td>
                <td className="py-2 pr-4 text-gray-400 capitalize">{m.type.replace('_', ' ')}</td>
                <td className="py-2 pr-4 text-right text-gray-400">
                  {formatGoalValue(typeof m.goal === 'number' ? m.goal : 0, m.unit)}
                </td>
                <td className="py-2 pr-4 text-right font-mono text-white">
                  {formatMetricValue(m.actual, m.unit)}
                </td>
                <td className="py-2 text-center">
                  <TrafficLight color={m.color} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
