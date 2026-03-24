'use client';

import type { PipelineData } from '@/lib/types';
import { TrafficLight } from './TrafficLight';
import { Card } from './Card';

export function VelocityTable({ data }: { data: PipelineData | null }) {
  if (!data) return null;

  return (
    <Card>
      <h3 className="text-base font-semibold text-white">Stage Velocity</h3>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="pb-2 pr-4">Stage</th>
            <th className="pb-2 pr-4 text-right">Avg Days</th>
            <th className="pb-2 pr-4 text-right">Limit</th>
            <th className="pb-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.velocity.map((v, i) => (
            <tr key={v.stage} className={i % 2 === 0 ? 'bg-gray-800/20' : ''}>
              <td className="py-2 pr-4 text-white">{v.stage}</td>
              <td className="py-2 pr-4 text-right font-mono text-gray-300">{v.avgDays}d</td>
              <td className="py-2 pr-4 text-right text-gray-400">{v.limit}d</td>
              <td className="py-2 text-center">
                <TrafficLight color={v.color} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
