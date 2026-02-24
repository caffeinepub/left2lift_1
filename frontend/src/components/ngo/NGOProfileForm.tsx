import React, { useState, useEffect } from 'react';
import { useRegisterNGO } from '../../hooks/useQueries';
import { FoodType, NGOProfile } from '../../backend';
import { formatFoodType } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Building2, MapPin, Scale, Utensils, Save } from 'lucide-react';

const FOOD_TYPES = Object.values(FoodType);

interface NGOProfileFormProps {
  existingProfile?: NGOProfile;
}

export default function NGOProfileForm({ existingProfile }: NGOProfileFormProps) {
  const [orgName, setOrgName] = useState(existingProfile?.orgName ?? '');
  const [locationAddress, setLocationAddress] = useState(existingProfile?.locationAddress ?? '');
  const [dailyCapacityKg, setDailyCapacityKg] = useState(
    existingProfile?.dailyCapacityKg?.toString() ?? ''
  );
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<FoodType[]>(
    existingProfile?.foodTypePreferences ?? []
  );

  const registerNGO = useRegisterNGO();

  const toggleFoodType = (ft: FoodType) => {
    setSelectedFoodTypes((prev) =>
      prev.includes(ft) ? prev.filter((f) => f !== ft) : [...prev, ft]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName.trim() || !locationAddress.trim() || !dailyCapacityKg) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedFoodTypes.length === 0) {
      toast.error('Please select at least one food type preference');
      return;
    }

    try {
      await registerNGO.mutateAsync({
        orgName: orgName.trim(),
        locationAddress: locationAddress.trim(),
        foodTypePreferences: selectedFoodTypes,
        dailyCapacityKg: parseFloat(dailyCapacityKg),
      });
      toast.success(existingProfile ? 'Profile updated!' : 'NGO profile created!');
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          {existingProfile ? 'Update NGO Profile' : 'Register Your NGO'}
        </CardTitle>
        <CardDescription>
          {existingProfile
            ? 'Update your organization details and food preferences'
            : 'Set up your organization profile to start receiving matched donations'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary-600" />
              Organization Name
            </Label>
            <Input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. City Food Bank"
              required
              disabled={!!existingProfile}
            />
            {existingProfile && (
              <p className="text-xs text-muted-foreground">Organization name cannot be changed after registration</p>
            )}
          </div>

          {/* Location Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-600" />
              Location Address
            </Label>
            <Input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="e.g. 456 Community Ave, City, State 67890"
              required
            />
          </div>

          {/* Daily Capacity */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-secondary-500" />
              Daily Capacity (kg)
            </Label>
            <Input
              type="number"
              min="1"
              step="0.5"
              value={dailyCapacityKg}
              onChange={(e) => setDailyCapacityKg(e.target.value)}
              placeholder="e.g. 100"
              required
            />
          </div>

          {/* Food Type Preferences */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-primary-600" />
              Food Type Preferences
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FOOD_TYPES.map((ft) => (
                <label
                  key={ft}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                    selectedFoodTypes.includes(ft)
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-card border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <Checkbox
                    checked={selectedFoodTypes.includes(ft)}
                    onCheckedChange={() => toggleFoodType(ft)}
                    className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                  />
                  <span className="text-sm font-medium">{formatFoodType(ft)}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={registerNGO.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {registerNGO.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {existingProfile ? 'Update Profile' : 'Register NGO'}
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
