'use client';

import type { PipelineData, TrafficLightColor } from '@/lib/types';
import { COVERAGE_THRESHOLDS } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';

export function CoverageRatio({ data }: { data: PipelineData | null }) {
  if (!data) return null;

  const ratio = data.coverageRatio;
  let color: TrafficLightColor = 'red';
  if (ratio >= COVERAGE_THRESHOLDS.green) color = 'green';
  else if (ratio >= COVERAGE_THRESHOLDS.yellow) color = 'yellow';

  const colorClasses = {
    green: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    yellow: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    red: 'text-red-400 border-red-500/30 bg-red-500/10',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="text-sm opacity-80">Pipeline Coverage</div>
      <div className="mt-1 text-3xl font-bold">{ratio.toFixed(1)}x</div>
      <div className="mt-1 text-xs opacity-60">
        {formatCurrency(data.totalPipeline)} / {formatCurrency(data.quarterlyTarget)} target
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-800">
        <div
          className={`h-full rounded-full ${color === 'green' ? 'bg-emerald-500' : color === 'yellow' ? 'bg-amber-400' : 'bg-red-500'}`}
          style={{ width: `${Math.min(ratio / 5 * 100, 100)}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs opacity-50">
        <span>0x</span>
        <span>2x</span>
        <span>3x</span>
        <span>5x</span>
      </div>
    </div>
  );
}
