import React, { useState } from 'react';
import { useListAllDonations, useUpdateDonationStatus, useGetHotelProfile } from '../../hooks/useQueries';
import { DonationStatus } from '../../backend';
import {
  formatFoodType,
  formatStorageCondition,
  formatDonationStatus,
  formatTimestamp,
  getStatusColor,
} from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Donation } from '../../backend';
import type { Principal } from '@dfinity/principal';

const ALL_STATUSES = Object.values(DonationStatus);

function HotelNameCell({ principal }: { principal: Principal }) {
  const { data: profile } = useGetHotelProfile(principal);
  return <span>{profile?.name ?? principal.toString().slice(0, 10) + '...'}</span>;
}

function DonationRow({ donation }: { donation: Donation }) {
  const updateStatus = useUpdateDonationStatus();
  const [localStatus, setLocalStatus] = useState<DonationStatus>(donation.status);

  const handleStatusChange = async (newStatus: DonationStatus) => {
    setLocalStatus(newStatus);
    try {
      await updateStatus.mutateAsync({ donationId: donation.id, newStatus });
      toast.success('Status updated');
    } catch {
      setLocalStatus(donation.status);
      toast.error('Failed to update status');
    }
  };

  const isUnsafe = !donation.spoilageSafe;

  return (
    <TableRow className={isUnsafe ? 'bg-destructive/5' : undefined}>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {formatTimestamp(donation.submittedAt)}
      </TableCell>
      <TableCell className="font-medium text-sm">
        <HotelNameCell principal={donation.hotelPrincipal} />
      </TableCell>
      <TableCell className="text-sm">{formatFoodType(donation.foodType)}</TableCell>
      <TableCell className="text-sm">{donation.quantityKg.toFixed(1)} kg</TableCell>
      <TableCell className="text-sm">{formatStorageCondition(donation.storageCondition)}</TableCell>
      <TableCell className="text-sm">{donation.timeSinceCooked.toFixed(1)}h</TableCell>
      <TableCell>
        {isUnsafe ? (
          <Badge
            variant="outline"
            className="text-xs bg-destructive/10 text-destructive border-destructive/20 whitespace-nowrap"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unsafe
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs bg-primary-50 text-primary-700 border-primary-200"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Safe
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-xs ${getStatusColor(localStatus)}`}>
          {formatDonationStatus(localStatus)}
        </Badge>
      </TableCell>
      <TableCell>
        <Select
          value={localStatus}
          onValueChange={(v) => handleStatusChange(v as DonationStatus)}
          disabled={updateStatus.isPending}
        >
          <SelectTrigger className="h-7 text-xs w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {formatDonationStatus(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}

export default function AdminFoodSafetyMonitoring() {
  const { data: donations, isLoading } = useListAllDonations();

  const unsafeCount = donations?.filter((d) => !d.spoilageSafe).length ?? 0;
  const totalCount = donations?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border-primary-100 shadow-card">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Donations</p>
            <p className="font-display font-bold text-lg text-foreground">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20 shadow-card">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Unsafe Donations</p>
            <p className="font-display font-bold text-lg text-destructive">{unsafeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary-50 border-secondary-100 shadow-card">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Safe Donations</p>
            <p className="font-display font-bold text-lg text-foreground">
              {totalCount - unsafeCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unsafe alert */}
      {unsafeCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            {unsafeCount} donation{unsafeCount !== 1 ? 's' : ''} flagged as unsafe.
            Rows highlighted in red require attention.
          </p>
        </div>
      )}

      {/* Donations table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-base">
            <ShieldAlert className="w-4 h-4 text-primary-600" />
            All Donations — Food Safety Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : donations && donations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Food Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Time Cooked</TableHead>
                    <TableHead>Safety</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...donations]
                    .sort((a, b) => Number(b.submittedAt - a.submittedAt))
                    .map((donation) => (
                      <DonationRow key={donation.id.toString()} donation={donation} />
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No donations to monitor</p>
              <p className="text-sm mt-1">Donations will appear here once hotels start submitting</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
