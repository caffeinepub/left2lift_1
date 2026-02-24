import React from 'react';
import { useSystemAnalytics } from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Scale, Users, Package, Leaf, TrendingUp } from 'lucide-react';

export default function AdminSystemAnalytics() {
  const { data: analytics, isLoading } = useSystemAnalytics();

  const metrics = [
    {
      label: 'Total kg Redistributed',
      value: analytics ? `${analytics.totalKgRedistributed.toFixed(1)} kg` : '—',
      icon: <Scale className="w-6 h-6 text-primary-600" />,
      bg: 'bg-primary-50',
      border: 'border-primary-100',
      description: 'Food successfully delivered to NGOs',
    },
    {
      label: 'Total Users',
      value: analytics ? Number(analytics.totalUsers).toLocaleString() : '—',
      icon: <Users className="w-6 h-6 text-secondary-600" />,
      bg: 'bg-secondary-50',
      border: 'border-secondary-100',
      description: 'Hotels and NGOs registered',
    },
    {
      label: 'Total Donations',
      value: analytics ? Number(analytics.totalDonations).toLocaleString() : '—',
      icon: <Package className="w-6 h-6 text-primary-600" />,
      bg: 'bg-primary-50',
      border: 'border-primary-100',
      description: 'Donation submissions processed',
    },
    {
      label: 'Waste Reduced',
      value: analytics ? `${analytics.wasteReducedKg.toFixed(1)} kg` : '—',
      icon: <Leaf className="w-6 h-6 text-secondary-600" />,
      bg: 'bg-secondary-50',
      border: 'border-secondary-100',
      description: 'Food waste prevented from landfill',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 bg-primary-50 rounded-xl border border-primary-100">
        <TrendingUp className="w-5 h-5 text-primary-600" />
        <div>
          <p className="font-medium text-primary-800 text-sm">Platform Impact Overview</p>
          <p className="text-xs text-primary-600">
            Real-time statistics from the Left2Lift network
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className={`${m.bg} border ${m.border} shadow-card`}>
            <CardContent className="pt-6 pb-5">
              <div className="space-y-3">
                <div
                  className={`w-12 h-12 rounded-xl ${m.bg} border ${m.border} flex items-center justify-center`}
                >
                  {m.icon}
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-display font-bold text-foreground">{m.value}</p>
                )}
                <div>
                  <p className="font-medium text-sm text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* People fed estimate */}
      {analytics && (
        <Card className="bg-primary-600 border-primary-700 shadow-card">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Estimated People Fed</p>
                <p className="text-3xl font-display font-bold text-white">
                  {Math.round(analytics.totalKgRedistributed * 2.5).toLocaleString()}
                </p>
                <p className="text-white/60 text-xs mt-0.5">
                  Based on {analytics.totalKgRedistributed.toFixed(1)} kg redistributed × 2.5
                  meals/kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
