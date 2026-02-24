import React, { useEffect, useState, ReactNode } from 'react';

interface AnimatedStatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  unit?: string;
  decimals?: number;
  color?: string;
}

export default function AnimatedStatCard({
  label,
  value,
  icon,
  unit = '',
  decimals = 0,
  color = 'text-primary',
}: AnimatedStatCardProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const next = Math.min(increment * step, value);
      setCurrent(next);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const formatted =
    decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current).toLocaleString();

  return (
    <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-card hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-primary/10 ${color}`}>{icon}</div>
      </div>
      <div className={`text-3xl font-bold ${color} mb-1 animate-count-up`}>
        {formatted}
        {unit && <span className="text-lg ml-1 font-medium">{unit}</span>}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
