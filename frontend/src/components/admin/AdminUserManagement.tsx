import React from 'react';
import { useListAllUsers, useDeactivateUser } from '../../hooks/useQueries';
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
import { toast } from 'sonner';
import { Users, Building2, Heart, UserX, CheckCircle2 } from 'lucide-react';
import type { Principal } from '@dfinity/principal';

export default function AdminUserManagement() {
  const { data: usersData, isLoading } = useListAllUsers();
  const deactivateUser = useDeactivateUser();

  const [hotels, ngos] = usersData ?? [[], []];
  const totalUsers = hotels.length + ngos.length;

  const handleDeactivate = async (principal: Principal, name: string) => {
    if (!confirm(`Are you sure you want to deactivate "${name}"?`)) return;
    try {
      await deactivateUser.mutateAsync(principal);
      toast.success(`${name} has been deactivated`);
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-primary-50 border-primary-100 shadow-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="font-display font-bold text-lg text-foreground">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary-50 border-secondary-100 shadow-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary-600" />
              <div>
                <p className="text-xs text-muted-foreground">Hotels</p>
                <p className="font-display font-bold text-lg text-foreground">{hotels.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary-50 border-primary-100 shadow-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary-600" />
              <div>
                <p className="text-xs text-muted-foreground">NGOs</p>
                <p className="font-display font-bold text-lg text-foreground">{ngos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotels table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-primary-600" />
            Hotels &amp; Restaurants
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : hotels.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotels.map((hotel) => (
                    <TableRow key={hotel.principal.toString()}>
                      <TableCell className="font-medium">{hotel.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {hotel.principal.toString().slice(0, 16)}...
                      </TableCell>
                      <TableCell>
                        {hotel.active ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-primary-50 text-primary-700 border-primary-200"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {hotel.active && (
                          <button
                            onClick={() => handleDeactivate(hotel.principal, hotel.name)}
                            disabled={deactivateUser.isPending}
                            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 font-medium disabled:opacity-50"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Deactivate
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No hotels registered yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* NGOs table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-base">
            <Heart className="w-4 h-4 text-secondary-600" />
            NGOs &amp; Trusts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : ngos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ngos.map((ngo) => (
                    <TableRow key={ngo.principal.toString()}>
                      <TableCell className="font-medium">{ngo.orgName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {ngo.locationAddress}
                      </TableCell>
                      <TableCell className="text-sm">
                        {ngo.currentDailyReceivedKg.toFixed(1)}/{ngo.dailyCapacityKg.toFixed(1)} kg
                      </TableCell>
                      <TableCell>
                        {ngo.active ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-primary-50 text-primary-700 border-primary-200"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {ngo.active && (
                          <button
                            onClick={() => handleDeactivate(ngo.principal, ngo.orgName)}
                            disabled={deactivateUser.isPending}
                            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 font-medium disabled:opacity-50"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Deactivate
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No NGOs registered yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
