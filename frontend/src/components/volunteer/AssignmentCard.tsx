import React from 'react';
import { MapPin, Clock, Truck, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Donation, DonationStatus } from '../../backend';
import { FoodSafetyStatus } from '../../lib/foodSafetyEngine';
import SafetyBadge from '../donation/SafetyBadge';
import { useCountdown } from '../../hooks/useCountdown';

interface AssignmentCardProps {
  donation: Donation;
  urgencyStatus: FoodSafetyStatus;
  remainingHours: number;
  safetyMessage: string;
  onMarkPickedUp: () => void;
  onMarkDelivered: () => void;
  isUpdating: boolean;
  isEmergencyMode: boolean;
}

function foodTypeLabel(ft: string) {
  const map: Record<string, string> = {
    rice: 'Rice', curry: 'Curry', bread: 'Bread', desserts: 'Desserts',
    vegetables: 'Vegetables', fish: 'Fish', dairy: 'Dairy', other: 'Other',
  };
  return map[ft] || ft;
}

export default function AssignmentCard({
  donation,
  urgencyStatus,
  remainingHours,
  safetyMessage,
  onMarkPickedUp,
  onMarkDelivered,
  isUpdating,
  isEmergencyMode,
}: AssignmentCardProps) {
  const countdown = useCountdown(donation.pickupDeadline);

  const borderColor = isEmergencyMode
    ? 'border-red-500'
    : urgencyStatus === 'Safe'
    ? 'border-green-400'
    : urgencyStatus === 'Urgent'
    ? 'border-yellow-400'
    : 'border-red-400';

  const bgColor = isEmergencyMode
    ? 'bg-red-50/50 dark:bg-red-900/10'
    : urgencyStatus === 'Safe'
    ? 'bg-green-50/50 dark:bg-green-900/10'
    : urgencyStatus === 'Urgent'
    ? 'bg-yellow-50/50 dark:bg-yellow-900/10'
    : 'bg-red-50/50 dark:bg-red-900/10';

  return (
    <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-4 hover-lift transition-all`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">{foodTypeLabel(String(donation.foodType))}</span>
          <span className="text-muted-foreground text-sm">• {donation.quantityKg} kg</span>
        </div>
        <div className="flex items-center gap-1">
          {(urgencyStatus === 'Urgent' || urgencyStatus === 'Unsafe') && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              URGENT
            </span>
          )}
          {isEmergencyMode && (
            <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
              PRIORITY
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
        <MapPin className="w-3 h-3 text-secondary" />
        <span>{donation.pickupAddress}</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>
            Deadline: {countdown.isExpired ? 'Expired' : `${countdown.hoursRemaining}h ${countdown.minutesRemaining}m`}
          </span>
        </div>
        <span>City: {donation.city}</span>
      </div>

      <SafetyBadge status={urgencyStatus} remainingHours={remainingHours} message={safetyMessage} />

      <div className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <Truck className="w-3 h-3 inline mr-1" />
        Assigned to you: closest volunteer in {donation.city}
      </div>

      <div className="flex gap-2 mt-3 flex-wrap">
        {donation.status === DonationStatus.accepted && (
          <Button
            size="sm"
            onClick={onMarkPickedUp}
            disabled={isUpdating}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Truck className="w-4 h-4 mr-1" />
            Mark as Picked Up
          </Button>
        )}
        {donation.status === DonationStatus.inTransit && (
          <Button
            size="sm"
            onClick={onMarkDelivered}
            disabled={isUpdating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Mark as Delivered
          </Button>
        )}
      </div>
    </div>
  );
}
