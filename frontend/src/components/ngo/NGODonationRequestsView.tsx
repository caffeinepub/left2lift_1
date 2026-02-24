import React, { useState } from 'react';
import { Package, MapPin, Clock, Flag, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Donation, DonationStatus } from '../../backend';
import { calculateFoodSafety } from '../../lib/foodSafetyEngine';
import SafetyBadge from '../donation/SafetyBadge';
import MapPreviewCard from './MapPreviewCard';
import NGOMetrics from './NGOMetrics';
import { useGetMyNGODonations, useAcceptDonation, useRejectDonation } from '../../hooks/useQueries';
import { useToast } from '../../hooks/useToast';
import { useEmergencyMode } from '../../hooks/useEmergencyMode';

function foodTypeLabel(ft: string) {
  const map: Record<string, string> = {
    rice: 'Rice', curry: 'Curry', bread: 'Bread', desserts: 'Desserts',
    vegetables: 'Vegetables', fish: 'Fish', dairy: 'Dairy', other: 'Other',
  };
  return map[ft] || ft;
}

function storageLabel(sc: string) {
  const map: Record<string, string> = {
    refrigerated: 'Refrigerated', roomTemperature: 'Room Temp', hot: 'Hot',
  };
  return map[sc] || sc;
}

export default function NGODonationRequestsView() {
  const { data: donations, isLoading } = useGetMyNGODonations();
  const acceptMutation = useAcceptDonation();
  const rejectMutation = useRejectDonation();
  const { showToast } = useToast();
  const { isEmergencyMode } = useEmergencyMode();
  const [expandedId, setExpandedId] = useState<bigint | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        ))}
      </div>
    );
  }

  const allDonations = donations || [];
  const activeDonations = allDonations.filter(
    (d) => d.status === DonationStatus.pending || d.status === DonationStatus.matched || d.status === DonationStatus.accepted
  );

  let sortedDonations = [...activeDonations];
  if (isEmergencyMode) {
    sortedDonations.sort((a, b) => {
      const safetyA = calculateFoodSafety(String(a.foodType), a.quantityKg, a.timeSinceCooked, String(a.storageCondition), a.city);
      const safetyB = calculateFoodSafety(String(b.foodType), b.quantityKg, b.timeSinceCooked, String(b.storageCondition), b.city);
      const order = { Unsafe: 0, Urgent: 1, Safe: 2 };
      return order[safetyA.status] - order[safetyB.status];
    });
  }

  const handleAccept = async (id: bigint) => {
    try {
      await acceptMutation.mutateAsync(id);
      showToast('Donation accepted successfully!', 'success');
    } catch (e) {
      showToast('Failed to accept donation', 'error');
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await rejectMutation.mutateAsync(id);
      showToast('Donation rejected', 'info');
    } catch (e) {
      showToast('Failed to reject donation', 'error');
    }
  };

  return (
    <div>
      <NGOMetrics donations={allDonations} />

      {sortedDonations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No active donation requests</p>
          <p className="text-sm">New donations will appear here when matched to your NGO</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDonations.map((donation) => {
            const safety = calculateFoodSafety(
              String(donation.foodType),
              donation.quantityKg,
              donation.timeSinceCooked,
              String(donation.storageCondition),
              donation.city
            );
            const isExpanded = expandedId === donation.id;
            const isUrgentOrUnsafe = safety.status === 'Urgent' || safety.status === 'Unsafe';
            const borderColor = isEmergencyMode
              ? 'border-red-400'
              : safety.status === 'Safe'
              ? 'border-green-300'
              : safety.status === 'Urgent'
              ? 'border-yellow-400'
              : 'border-red-400';

            return (
              <div
                key={String(donation.id)}
                className={`rounded-xl border-2 ${borderColor} bg-card dark:bg-card/80 p-4 hover-lift transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-lg text-foreground">
                        {foodTypeLabel(String(donation.foodType))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        • {donation.quantityKg} kg
                      </span>
                      {isUrgentOrUnsafe && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                          <Flag className="w-3 h-3" />
                          PRIORITY
                        </span>
                      )}
                      {isEmergencyMode && (
                        <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                          PRIORITY OVERRIDE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{donation.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Clock className="w-3 h-3" />
                      <span>Storage: {storageLabel(String(donation.storageCondition))}</span>
                      <span className="mx-1">•</span>
                      <span>City: {donation.city}</span>
                    </div>
                    <SafetyBadge
                      status={safety.status}
                      remainingHours={safety.remainingHours}
                      message={safety.message}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {donation.status !== DonationStatus.accepted && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(donation.id)}
                        disabled={acceptMutation.isPending}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(donation.id)}
                        disabled={rejectMutation.isPending}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {donation.status === DonationStatus.accepted && (
                    <span className="text-sm font-semibold text-primary flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Accepted
                    </span>
                  )}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : donation.id)}
                    className="ml-auto text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? 'Hide Map' : 'Show Map'}
                  </button>
                </div>

                {isExpanded && donation.status === DonationStatus.accepted && (
                  <MapPreviewCard
                    donorAddress={donation.pickupAddress}
                    ngoAddress="NGO Location"
                    city={donation.city}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
