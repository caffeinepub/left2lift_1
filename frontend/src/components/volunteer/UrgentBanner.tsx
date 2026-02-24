import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UrgentAssignment {
  area: string;
  mealCount: number;
  hoursRemaining: number;
}

interface UrgentBannerProps {
  assignments: UrgentAssignment[];
}

export default function UrgentBanner({ assignments }: UrgentBannerProps) {
  if (assignments.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {assignments.map((a, i) => (
        <div
          key={i}
          className="w-full rounded-xl border-2 border-red-400 bg-red-50/90 dark:bg-red-900/30 px-4 py-3 flex items-center gap-3 animate-pulse-emergency"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-bold text-red-800 dark:text-red-200">
            🚨 Urgent food pickup near {a.area}. {a.mealCount} meals expiring in {a.hoursRemaining.toFixed(1)} hours.
          </span>
        </div>
      ))}
    </div>
  );
}
