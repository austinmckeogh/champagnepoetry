'use client';

import type { TrafficLightColor } from '@/lib/types';

const colorClasses: Record<TrafficLightColor, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
};

const glowStyles: Record<TrafficLightColor, React.CSSProperties> = {
  green: { boxShadow: '0 0 6px 1px rgba(16, 185, 129, 0.45)' },
  yellow: { boxShadow: '0 0 6px 1px rgba(251, 191, 36, 0.45)' },
  red: { boxShadow: '0 0 6px 1px rgba(239, 68, 68, 0.45)' },
};

export function TrafficLight({ color }: { color: TrafficLightColor }) {
  return (
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full ${colorClasses[color]}`}
      style={glowStyles[color]}
      title={color}
    />
  );
}
