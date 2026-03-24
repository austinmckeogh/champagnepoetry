'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { PipelineData } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { Card } from './Card';

export function AgingAnalysis({ data }: { data: PipelineData | null }) {
  if (!data) return null;

  const chartData = data.aging.map((b) => ({
    name: b.label,
    count: b.count,
    value: b.value,
  }));

  return (
    <Card>
      <h3 className="text-base font-semibold text-white">Deal Aging</h3>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => [
                name === 'value' ? formatCurrency(value) : value,
                name === 'value' ? 'Value' : 'Deals',
              ]}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
        {data.aging.map((b) => (
          <div key={b.label} className="rounded-lg border border-gray-800/60 bg-gray-800/30 p-2">
            <div className="text-gray-400">{b.label}</div>
            <div className="font-semibold text-white">{b.count} deals</div>
            <div className="text-xs text-gray-500">{formatCurrency(b.value)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
