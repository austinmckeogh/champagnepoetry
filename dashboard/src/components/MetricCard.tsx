'use client';

import type { TrafficLightColor } from '@/lib/types';
import { TrafficLight } from './TrafficLight';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  color?: TrafficLightColor;
}

const accentBorder: Record<TrafficLightColor, string> = {
  green: 'border-l-emerald-500',
  yellow: 'border-l-amber-400',
  red: 'border-l-red-500',
};

export function MetricCard({ label, value, subtitle, color }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-800/60 bg-gray-900/50 p-4 backdrop-blur ${
        color ? `border-l-2 ${accentBorder[color]}` : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        {color && <TrafficLight color={color} />}
      </div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {subtitle && <div className="mt-0.5 text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
}
