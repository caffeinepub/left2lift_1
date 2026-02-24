import React, { useEffect, useState } from 'react';
import { Package, Scale, Users } from 'lucide-react';
import { Donation, DonationStatus } from '../../backend';

interface NGOMetricsProps {
  donations: Donation[];
}

function AnimatedNumber({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{current.toLocaleString()}</span>;
}

export default function NGOMetrics({ donations }: NGOMetricsProps) {
  const acceptedDonations = donations.filter(
    (d) => d.status === DonationStatus.accepted || d.status === DonationStatus.completed
  );
  const totalKg = acceptedDonations.reduce((sum, d) => sum + d.quantityKg, 0);
  const peopleServed = Math.round(totalKg * 2.5);
  const totalDonations = donations.length;

  const metrics = [
    { label: 'Total Donations', value: totalDonations, icon: Package, unit: '' },
    { label: 'Total Kg Received', value: Math.round(totalKg), icon: Scale, unit: 'kg' },
    { label: 'People Served', value: peopleServed, icon: Users, unit: '' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.label}
            className="glass-card rounded-xl p-4 text-center border border-primary/20 bg-primary/5 dark:bg-primary/10"
          >
            <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              <AnimatedNumber target={m.value} />
              {m.unit && <span className="text-sm ml-1">{m.unit}</span>}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
          </div>
        );
      })}
    </div>
  );
}
