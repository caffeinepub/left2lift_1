import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { FoodSafetyStatus } from '../../lib/foodSafetyEngine';

interface SafetyBadgeProps {
  status: FoodSafetyStatus;
  remainingHours: number;
  message: string;
}

export default function SafetyBadge({ status, remainingHours, message }: SafetyBadgeProps) {
  const config = {
    Safe: {
      icon: ShieldCheck,
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
      label: '🟢 Safe',
    },
    Urgent: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      label: '🟡 Urgent',
    },
    Unsafe: {
      icon: XCircle,
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      label: '🔴 Unsafe',
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <div className={`rounded-xl border-2 p-4 ${c.bg} ${c.border} animate-fade-in-up`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${c.bg} border ${c.border}`}>
          <Icon className={`w-6 h-6 ${c.iconColor}`} />
        </div>
        <div>
          <div className={`font-bold text-lg ${c.text}`}>{c.label}</div>
          <div className={`text-sm font-medium ${c.text}`}>{message}</div>
        </div>
        <div className="ml-auto text-right">
          <div className={`text-2xl font-bold ${c.text}`}>{remainingHours.toFixed(1)}h</div>
          <div className={`text-xs ${c.text} opacity-70`}>remaining</div>
        </div>
      </div>
      <div className="mt-2 text-xs opacity-60 flex items-center gap-1">
        <span>🤖 AI Food Safety Engine</span>
        <span>•</span>
        <span>Maharashtra Climate Factor Applied</span>
      </div>
    </div>
  );
}
