import React, { useState } from 'react';
import { Building2, Heart, Shield, ArrowRight, Leaf } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { AppUserRole, UserProfile } from '../backend';
import { toast } from 'sonner';

interface RoleSelectionScreenProps {
  onRoleSelected: () => void;
}

type RoleOption = {
  role: AppUserRole;
  label: string;
  description: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
};

const roleOptions: RoleOption[] = [
  {
    role: AppUserRole.hotel,
    label: 'Hotel / Restaurant',
    description: 'Submit surplus food donations and track your impact on reducing food waste.',
    IconComponent: Building2,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
  {
    role: AppUserRole.ngo,
    label: 'NGO / Trust',
    description: 'Receive matched food donations and serve your community with fresh meals.',
    IconComponent: Heart,
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-50',
    borderColor: 'border-secondary-200',
  },
  {
    role: AppUserRole.admin,
    label: 'Administrator',
    description: 'Monitor the platform, manage users, and view system-wide analytics.',
    IconComponent: Shield,
    color: 'text-primary-700',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
];

export default function RoleSelectionScreen({ onRoleSelected }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<AppUserRole | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<'role' | 'name'>('role');

  const saveProfile = useSaveCallerUserProfile();

  const handleRoleSelect = (role: AppUserRole) => {
    setSelectedRole(role);
    setStep('name');
  };

  const handleSubmit = async () => {
    if (!selectedRole || !displayName.trim()) return;

    const profile: UserProfile = {
      appRole: selectedRole,
      displayName: displayName.trim(),
    };

    try {
      await saveProfile.mutateAsync(profile);
      onRoleSelected();
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const selectedOption = roleOptions.find((r) => r.role === selectedRole);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <img
            src="/assets/generated/left2lift-logo.dim_256x256.png"
            alt="Left2Lift Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="font-display font-bold text-xl text-primary-600">Left2Lift</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {step === 'role' ? (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium border border-primary-200 mb-4">
                  <Leaf className="w-4 h-4" />
                  First Time Setup
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Choose Your Role
                </h1>
                <p className="text-muted-foreground">
                  Select how you'll be using Left2Lift. This cannot be changed later.
                </p>
              </div>

              <div className="grid gap-4">
                {roleOptions.map((option) => (
                  <button
                    key={option.role}
                    onClick={() => handleRoleSelect(option.role)}
                    className={`w-full text-left p-5 rounded-xl border-2 ${option.bgColor} ${option.borderColor} hover:shadow-card-hover group`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${option.color} ${option.bgColor} p-3 rounded-xl border ${option.borderColor}`}>
                        <option.IconComponent className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {option.label}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${option.color} opacity-0 group-hover:opacity-100`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <button
                  onClick={() => setStep('role')}
                  className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
                >
                  ← Back to role selection
                </button>
                {selectedOption && (
                  <div className={`inline-flex items-center gap-2 ${selectedOption.bgColor} ${selectedOption.color} px-3 py-1.5 rounded-full text-sm font-medium border ${selectedOption.borderColor} mb-2`}>
                    <selectedOption.IconComponent className="w-4 h-4" />
                    {selectedOption.label}
                  </div>
                )}
                <h1 className="font-display text-3xl font-bold text-foreground">
                  What's Your Name?
                </h1>
                <p className="text-muted-foreground">
                  {selectedRole === AppUserRole.hotel
                    ? 'Enter your hotel or restaurant name'
                    : selectedRole === AppUserRole.ngo
                    ? 'Enter your organization name'
                    : 'Enter your administrator name'}
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-card">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {selectedRole === AppUserRole.hotel
                      ? 'Hotel / Restaurant Name'
                      : selectedRole === AppUserRole.ngo
                      ? 'Organization Name'
                      : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={
                      selectedRole === AppUserRole.hotel
                        ? 'e.g. The Grand Hotel'
                        : selectedRole === AppUserRole.ngo
                        ? 'e.g. City Food Bank'
                        : 'e.g. Admin User'
                    }
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!displayName.trim() || saveProfile.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saveProfile.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Continue to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
