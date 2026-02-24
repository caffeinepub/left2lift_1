import React from 'react';
import { MapPin, Clock, Building2, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NGOMatchCardProps {
  ngoName: string;
  ngoArea: string;
  distanceKm: number;
  estimatedPickupMinutes: number;
  isLoading?: boolean;
}

export default function NGOMatchCard({
  ngoName,
  ngoArea,
  distanceKm,
  estimatedPickupMinutes,
  isLoading,
}: NGOMatchCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-primary/30 p-4 bg-primary/5">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-primary/5 dark:bg-primary/10 p-4 animate-slide-in-right hover-lift">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10 border border-primary/30">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
              Best Match Found
            </span>
          </div>
          <h3 className="font-bold text-lg text-foreground">{ngoName}</h3>
          <p className="text-sm text-muted-foreground">{ngoArea}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">{distanceKm} km away</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-secondary">~{estimatedPickupMinutes} min pickup</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        📍 Nearest trust found {distanceKm} km away – Estimated pickup in {estimatedPickupMinutes} minutes
      </div>
    </div>
  );
}
