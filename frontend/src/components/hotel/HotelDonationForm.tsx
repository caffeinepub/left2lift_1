import React, { useState } from 'react';
import { useSubmitDonation } from '../../hooks/useQueries';
import { FoodType, StorageCondition } from '../../backend';
import { formatFoodType, formatStorageCondition, dateToNanoseconds } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Utensils,
  MapPin,
  Clock,
  Thermometer,
  Scale,
  Calendar,
  Users,
  Building2,
} from 'lucide-react';
import type { Principal } from '@dfinity/principal';

const FOOD_TYPES = Object.values(FoodType);
const STORAGE_CONDITIONS = Object.values(StorageCondition);

const CITIES = ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur'];

interface SubmissionResult {
  spoilageSafe: boolean;
  matchedNGO: Principal | null;
}

export default function HotelDonationForm() {
  const [foodType, setFoodType] = useState<FoodType>(FoodType.rice);
  const [quantityKg, setQuantityKg] = useState('');
  const [timeSinceCooked, setTimeSinceCooked] = useState('');
  const [storageCondition, setStorageCondition] = useState<StorageCondition>(StorageCondition.refrigerated);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDeadline, setPickupDeadline] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const submitDonation = useSubmitDonation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantityKg || !timeSinceCooked || !pickupAddress || !pickupDeadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const deadlineDate = new Date(pickupDeadline);
    if (isNaN(deadlineDate.getTime())) {
      toast.error('Invalid pickup deadline date');
      return;
    }

    try {
      const [spoilageSafe, matchedNGO] = await submitDonation.mutateAsync({
        foodType,
        quantityKg: parseFloat(quantityKg),
        timeSinceCooked: parseFloat(timeSinceCooked),
        storageCondition,
        pickupAddress,
        pickupDeadline: dateToNanoseconds(deadlineDate),
        city,
      });

      setResult({ spoilageSafe, matchedNGO });
      toast.success('Donation submitted successfully!');

      // Reset form
      setQuantityKg('');
      setTimeSinceCooked('');
      setPickupAddress('');
      setPickupDeadline('');
    } catch (err) {
      toast.error('Failed to submit donation. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Result card */}
      {result && (
        <Card className={`border-2 ${result.spoilageSafe ? 'border-primary-300 bg-primary-50' : 'border-destructive/30 bg-destructive/5'}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {result.spoilageSafe ? (
                <CheckCircle2 className="w-8 h-8 text-primary-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-8 h-8 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  {result.spoilageSafe ? 'Food is Safe for Donation ✓' : 'Food Safety Warning'}
                </h3>
                {result.spoilageSafe ? (
                  <div className="mt-2 space-y-1">
                    {result.matchedNGO ? (
                      <div className="flex items-center gap-2 text-sm text-primary-700">
                        <Building2 className="w-4 h-4" />
                        <span>
                          <strong>NGO Matched!</strong> An NGO has been assigned to collect this donation.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-secondary-700">
                        <Users className="w-4 h-4" />
                        <span>No NGO available right now. Your donation is queued as unmatched.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-destructive mt-1">
                    This food has exceeded safe storage time and cannot be donated. Please dispose of it safely.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary-600" />
            Submit Food Donation
          </CardTitle>
          <CardDescription>
            Fill in the details about the surplus food you'd like to donate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Food Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-primary-600" />
                  Food Type
                </Label>
                <Select value={foodType} onValueChange={(v) => setFoodType(v as FoodType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_TYPES.map((ft) => (
                      <SelectItem key={ft} value={ft}>
                        {formatFoodType(ft)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Storage Condition */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-secondary-500" />
                  Storage Condition
                </Label>
                <Select value={storageCondition} onValueChange={(v) => setStorageCondition(v as StorageCondition)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORAGE_CONDITIONS.map((sc) => (
                      <SelectItem key={sc} value={sc}>
                        {formatStorageCondition(sc)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-primary-600" />
                  Quantity (kg)
                </Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="e.g. 10.5"
                  required
                />
              </div>

              {/* Time Since Cooked */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-secondary-500" />
                  Time Since Cooked (hours)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={timeSinceCooked}
                  onChange={(e) => setTimeSinceCooked(e.target.value)}
                  placeholder="e.g. 2.5"
                  required
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-600" />
                City
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pickup Address */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-600" />
                Pickup Address
              </Label>
              <Input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="e.g. 123 Main Street, Andheri East, Mumbai"
                required
              />
            </div>

            {/* Pickup Deadline */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-secondary-500" />
                Pickup Deadline
              </Label>
              <Input
                type="datetime-local"
                value={pickupDeadline}
                onChange={(e) => setPickupDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            {/* Spoilage info */}
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-100 text-xs text-primary-700">
              <strong>Spoilage thresholds:</strong> Refrigerated: 24h • Room Temperature: 6h • Hot: 4h
              <br />
              Fish &amp; Dairy: thresholds reduced by 2h each
            </div>

            <button
              type="submit"
              disabled={submitDonation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitDonation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Utensils className="w-4 h-4" />
                  Submit Donation
                </>
              )}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
