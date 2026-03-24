'use client';

import type { PipelineData } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/format';
import { MetricCard } from './MetricCard';
import { Card } from './Card';

export function WeightedForecast({ data }: { data: PipelineData | null }) {
  if (!data) return null;

  return (
    <Card>
      <h3 className="text-base font-semibold text-white">Weighted Forecast</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricCard
          label="Weighted Pipeline"
          value={formatCurrency(data.weightedForecast)}
          subtitle="Probability-adjusted"
        />
        <MetricCard
          label="Quarterly Target"
          value={formatCurrency(data.quarterlyTarget)}
          subtitle={`Coverage: ${data.coverageRatio.toFixed(1)}x`}
        />
      </div>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="pb-2 pr-4">Stage</th>
            <th className="pb-2 pr-4 text-right">Prob.</th>
            <th className="pb-2 pr-4 text-right">Raw</th>
            <th className="pb-2 text-right">Weighted</th>
          </tr>
        </thead>
        <tbody>
          {data.stages.map((s, i) => (
            <tr key={s.key} className={i % 2 === 0 ? 'bg-gray-800/20' : ''}>
              <td className="py-1.5 pr-4 text-white">{s.name}</td>
              <td className="py-1.5 pr-4 text-right text-gray-400">{formatPercent(s.probability * 100)}</td>
              <td className="py-1.5 pr-4 text-right font-mono text-gray-300">{formatCurrency(s.value)}</td>
              <td className="py-1.5 text-right font-mono text-white">{formatCurrency(s.weightedValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
