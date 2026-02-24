import React from 'react';
import { useGetMyNGODonations, useGetHotelProfile } from '../../hooks/useQueries';
import { DonationStatus } from '../../backend';
import { formatFoodType, formatDonationStatus, formatTimestamp, getStatusColor } from '../../lib/utils';
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
import { Package, Scale, Users, History, Building2 } from 'lucide-react';
import type { Donation } from '../../backend';
import type { Principal } from '@dfinity/principal';

function HotelName({ principal }: { principal: Principal }) {
  const { data: profile } = useGetHotelProfile(principal);
  return <span>{profile?.name ?? principal.toString().slice(0, 8) + '...'}</span>;
}

export default function NGODashboard() {
  const { data: donations, isLoading } = useGetMyNGODonations();

  const receivedDonations = donations?.filter(
    (d) =>
      d.status === DonationStatus.accepted ||
      d.status === DonationStatus.inTransit ||
      d.status === DonationStatus.completed
  ) ?? [];

  const totalDonations = receivedDonations.length;
  const totalKg = receivedDonations.reduce((sum, d) => sum + d.quantityKg, 0);
  const peopleServed = Math.round(totalKg * 2.5);

  const metrics = [
    {
      label: 'Donations Received',
      value: totalDonations,
      icon: <Package className="w-5 h-5 text-primary-600" />,
      bg: 'bg-primary-50',
      border: 'border-primary-100',
    },
    {
      label: 'Total kg Received',
      value: `${totalKg.toFixed(1)} kg`,
      icon: <Scale className="w-5 h-5 text-secondary-600" />,
      bg: 'bg-secondary-50',
      border: 'border-secondary-100',
    },
    {
      label: 'People Served',
      value: peopleServed.toLocaleString(),
      icon: <Users className="w-5 h-5 text-primary-600" />,
      bg: 'bg-primary-50',
      border: 'border-primary-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className={`${m.bg} border ${m.border} shadow-card`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${m.bg} border ${m.border}`}>
                  {m.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mt-1" />
                  ) : (
                    <p className="text-xl font-display font-bold text-foreground">{m.value}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donation History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <History className="w-5 h-5 text-primary-600" />
            Donation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : donations && donations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Food Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...donations]
                    .sort((a, b) => Number(b.submittedAt - a.submittedAt))
                    .map((donation) => (
                      <TableRow key={donation.id.toString()}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(donation.submittedAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <HotelName principal={donation.hotelPrincipal} />
                          </div>
                        </TableCell>
                        <TableCell>{formatFoodType(donation.foodType)}</TableCell>
                        <TableCell>{donation.quantityKg.toFixed(1)} kg</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(donation.status)}`}
                          >
                            {formatDonationStatus(donation.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No donation history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
