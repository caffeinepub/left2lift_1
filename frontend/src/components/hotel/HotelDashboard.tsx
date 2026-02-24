import React from 'react';
import { useGetMyHotelDonations } from '../../hooks/useQueries';
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
import { Package, Scale, CheckCircle2, Users, History } from 'lucide-react';

export default function HotelDashboard() {
  const { data: donations, isLoading } = useGetMyHotelDonations();

  const totalDonations = donations?.length ?? 0;
  const totalKg = donations?.reduce((sum, d) => sum + d.quantityKg, 0) ?? 0;
  const completedCount = donations?.filter((d) => d.status === DonationStatus.completed).length ?? 0;
  const peopleFed = Math.round(totalKg * 2.5);

  const metrics = [
    {
      label: 'Total Donations',
      value: totalDonations,
      icon: <Package className="w-5 h-5 text-primary-600" />,
      bg: 'bg-primary-50',
      border: 'border-primary-100',
    },
    {
      label: 'Total kg Donated',
      value: `${totalKg.toFixed(1)} kg`,
      icon: <Scale className="w-5 h-5 text-secondary-600" />,
      bg: 'bg-secondary-50',
      border: 'border-secondary-100',
    },
    {
      label: 'Completed Deliveries',
      value: completedCount,
      icon: <CheckCircle2 className="w-5 h-5 text-primary-600" />,
      bg: 'bg-primary-50',
      border: 'border-primary-100',
    },
    {
      label: 'Est. People Fed',
      value: peopleFed.toLocaleString(),
      icon: <Users className="w-5 h-5 text-secondary-600" />,
      bg: 'bg-secondary-50',
      border: 'border-secondary-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : donations && donations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Food Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Safe?</TableHead>
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
                          {formatFoodType(donation.foodType)}
                        </TableCell>
                        <TableCell>{donation.quantityKg.toFixed(1)} kg</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(donation.status)}`}
                          >
                            {formatDonationStatus(donation.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {donation.spoilageSafe ? (
                            <span className="text-primary-600 text-xs font-medium">✓ Safe</span>
                          ) : (
                            <span className="text-destructive text-xs font-medium">✗ Unsafe</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No donations yet</p>
              <p className="text-sm mt-1">Submit your first donation to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
