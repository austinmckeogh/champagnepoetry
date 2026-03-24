'use client';

import type { PipelineData } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/format';
import { MetricCard } from './MetricCard';

export function WeightedForecast({ data }: { data: PipelineData | null }) {
  if (!data) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white">Weighted Forecast</h3>
      <div className="grid grid-cols-2 gap-3">
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
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-left text-gray-400">
            <th className="pb-2 pr-4">Stage</th>
            <th className="pb-2 pr-4 text-right">Prob.</th>
            <th className="pb-2 pr-4 text-right">Raw</th>
            <th className="pb-2 text-right">Weighted</th>
          </tr>
        </thead>
        <tbody>
          {data.stages.map((s) => (
            <tr key={s.key} className="border-b border-gray-800/50">
              <td className="py-1.5 pr-4 text-white">{s.name}</td>
              <td className="py-1.5 pr-4 text-right text-gray-400">{formatPercent(s.probability * 100)}</td>
              <td className="py-1.5 pr-4 text-right font-mono text-gray-300">{formatCurrency(s.value)}</td>
              <td className="py-1.5 text-right font-mono text-white">{formatCurrency(s.weightedValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
