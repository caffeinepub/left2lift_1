import React, { useState } from 'react';
import {
  useGetMyNGODonations,
  useAcceptDonation,
  useRejectDonation,
  useGetHotelProfile,
  useSubmitFeedback,
} from '../../hooks/useQueries';
import { DonationStatus } from '../../backend';
import {
  formatFoodType,
  formatDonationStatus,
  formatTimestamp,
  getRemainingHours,
  getStatusColor,
} from '../../lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Inbox,
  MapPin,
  Clock,
  Scale,
  Utensils,
  CheckCircle2,
  XCircle,
  Building2,
  Star,
  AlertTriangle,
} from 'lucide-react';
import type { Donation } from '../../backend';
import type { Principal } from '@dfinity/principal';
import NGOFeedbackForm from './NGOFeedbackForm';

function DonationCard({ donation }: { donation: Donation }) {
  const acceptDonation = useAcceptDonation();
  const rejectDonation = useRejectDonation();
  const [showFeedback, setShowFeedback] = useState(false);

  const { data: hotelProfile } = useGetHotelProfile(donation.hotelPrincipal);
  const remainingHours = getRemainingHours(donation.pickupDeadline);
  const isExpired = remainingHours <= 0;
  const isUrgent = remainingHours > 0 && remainingHours <= 2;

  const canAccept = donation.status === DonationStatus.matched;
  const canReject =
    donation.status === DonationStatus.matched ||
    donation.status === DonationStatus.accepted;
  const isCompleted = donation.status === DonationStatus.completed;

  const handleAccept = async () => {
    try {
      await acceptDonation.mutateAsync(donation.id);
      toast.success('Donation accepted!');
    } catch {
      toast.error('Failed to accept donation');
    }
  };

  const handleReject = async () => {
    try {
      await rejectDonation.mutateAsync(donation.id);
      toast.success('Donation rejected');
    } catch {
      toast.error('Failed to reject donation');
    }
  };

  return (
    <Card
      className={`shadow-card border ${
        isExpired
          ? 'border-destructive/30 bg-destructive/5'
          : isUrgent
          ? 'border-secondary-300 bg-secondary-50'
          : 'border-border'
      }`}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-primary-600" />
                <span className="font-display font-semibold text-foreground">
                  {formatFoodType(donation.foodType)}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusColor(donation.status)}`}
                >
                  {formatDonationStatus(donation.status)}
                </Badge>
              </div>
              {isExpired && (
                <Badge
                  variant="outline"
                  className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Expired
                </Badge>
              )}
              {isUrgent && !isExpired && (
                <Badge
                  variant="outline"
                  className="text-xs bg-secondary-100 text-secondary-700 border-secondary-200"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Scale className="w-3.5 h-3.5 text-primary-500" />
                <span>{donation.quantityKg.toFixed(1)} kg</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-secondary-500" />
                <span>
                  {isExpired
                    ? 'Deadline passed'
                    : `${remainingHours.toFixed(1)}h remaining`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 text-primary-500" />
                <span className="truncate">
                  {hotelProfile?.name ?? 'Loading...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground col-span-2 sm:col-span-3">
                <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                <span className="truncate">{donation.pickupAddress}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Submitted: {formatTimestamp(donation.submittedAt)}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            {canAccept && (
              <button
                onClick={handleAccept}
                disabled={acceptDonation.isPending}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
              >
                {acceptDonation.isPending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Accept
              </button>
            )}
            {canReject && (
              <button
                onClick={handleReject}
                disabled={rejectDonation.isPending}
                className="flex items-center gap-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium px-4 py-2 rounded-lg border border-destructive/20 disabled:opacity-60"
              >
                {rejectDonation.isPending ? (
                  <div className="w-3.5 h-3.5 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                Reject
              </button>
            )}
            {isCompleted && (
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="flex items-center gap-1.5 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 text-sm font-medium px-4 py-2 rounded-lg border border-secondary-200"
              >
                <Star className="w-3.5 h-3.5" />
                Feedback
              </button>
            )}
          </div>
        </div>

        {/* Feedback form */}
        {showFeedback && isCompleted && (
          <div className="mt-4 pt-4 border-t border-border">
            <NGOFeedbackForm
              donationId={donation.id}
              onSubmitted={() => setShowFeedback(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function NGODonationRequests() {
  const { data: donations, isLoading } = useGetMyNGODonations();

  const activeDonations =
    donations?.filter(
      (d) =>
        d.status === DonationStatus.matched ||
        d.status === DonationStatus.accepted ||
        d.status === DonationStatus.inTransit
    ) ?? [];

  const completedDonations =
    donations?.filter(
      (d) =>
        d.status === DonationStatus.completed ||
        d.status === DonationStatus.rejected
    ) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-16 text-center">
          <Inbox className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="font-display font-semibold text-lg text-foreground">
            No Donations Yet
          </h3>
          <p className="text-muted-foreground text-sm mt-2">
            You'll see matched donations here once hotels submit food for
            redistribution.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active donations */}
      {activeDonations.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary-600" />
            Active Requests ({activeDonations.length})
          </h2>
          {activeDonations.map((d) => (
            <DonationCard key={d.id.toString()} donation={d} />
          ))}
        </div>
      )}

      {/* Completed/Rejected */}
      {completedDonations.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            Past Donations ({completedDonations.length})
          </h2>
          {completedDonations.map((d) => (
            <DonationCard key={d.id.toString()} donation={d} />
          ))}
        </div>
      )}
    </div>
  );
}
