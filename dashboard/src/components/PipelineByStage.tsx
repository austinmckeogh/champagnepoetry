'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PipelineData } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9'];

export function PipelineByStage({ data }: { data: PipelineData | null }) {
  if (!data) return null;

  const chartData = data.stages.map((s) => ({
    name: s.name.replace('/', '/\n'),
    value: s.value,
    count: s.count,
  }));

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white">Pipeline by Stage</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [formatCurrency(value), 'Value']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-left text-gray-400">
            <th className="pb-2 pr-4">Stage</th>
            <th className="pb-2 pr-4 text-right">Deals</th>
            <th className="pb-2 pr-4 text-right">Value</th>
            <th className="pb-2 text-right">Weighted</th>
          </tr>
        </thead>
        <tbody>
          {data.stages.map((s) => (
            <tr key={s.key} className="border-b border-gray-800/50">
              <td className="py-1.5 pr-4 text-white">{s.name}</td>
              <td className="py-1.5 pr-4 text-right text-gray-300">{s.count}</td>
              <td className="py-1.5 pr-4 text-right font-mono text-gray-300">{formatCurrency(s.value)}</td>
              <td className="py-1.5 text-right font-mono text-gray-400">{formatCurrency(s.weightedValue)}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="pt-2 pr-4 text-white">Total</td>
            <td className="pt-2 pr-4 text-right text-white">{data.stages.reduce((s, d) => s + d.count, 0)}</td>
            <td className="pt-2 pr-4 text-right font-mono text-white">{formatCurrency(data.totalPipeline)}</td>
            <td className="pt-2 text-right font-mono text-white">{formatCurrency(data.weightedForecast)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
