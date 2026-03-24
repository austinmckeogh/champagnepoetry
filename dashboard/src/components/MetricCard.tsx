'use client';

import type { TrafficLightColor } from '@/lib/types';
import { TrafficLight } from './TrafficLight';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  color?: TrafficLightColor;
}

export function MetricCard({ label, value, subtitle, color }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        {color && <TrafficLight color={color} />}
      </div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {subtitle && <div className="mt-0.5 text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
}
