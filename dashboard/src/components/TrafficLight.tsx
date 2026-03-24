'use client';

import type { TrafficLightColor } from '@/lib/types';

const colorClasses: Record<TrafficLightColor, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
};

export function TrafficLight({ color }: { color: TrafficLightColor }) {
  return (
    <span
      className={`inline-block h-3 w-3 rounded-full ${colorClasses[color]}`}
      title={color}
    />
  );
}
