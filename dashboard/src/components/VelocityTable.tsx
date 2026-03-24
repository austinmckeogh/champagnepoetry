'use client';

import type { PipelineData } from '@/lib/types';
import { TrafficLight } from './TrafficLight';

export function VelocityTable({ data }: { data: PipelineData | null }) {
  if (!data) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white">Stage Velocity</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-left text-gray-400">
            <th className="pb-2 pr-4">Stage</th>
            <th className="pb-2 pr-4 text-right">Avg Days</th>
            <th className="pb-2 pr-4 text-right">Limit</th>
            <th className="pb-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.velocity.map((v) => (
            <tr key={v.stage} className="border-b border-gray-800/50">
              <td className="py-1.5 pr-4 text-white">{v.stage}</td>
              <td className="py-1.5 pr-4 text-right font-mono text-gray-300">{v.avgDays}d</td>
              <td className="py-1.5 pr-4 text-right text-gray-400">{v.limit}d</td>
              <td className="py-1.5 text-center">
                <TrafficLight color={v.color} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
