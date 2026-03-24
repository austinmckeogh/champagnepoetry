'use client';

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-800/60 bg-gray-900/50 p-5 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}
