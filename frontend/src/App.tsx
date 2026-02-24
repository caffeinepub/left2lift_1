import React from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import LoginScreen from './pages/LoginScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import HotelPanel from './pages/HotelPanel';
import NGOPanel from './pages/NGOPanel';
import AdminPanel from './pages/AdminPanel';
import { AppUserRole } from './backend';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Show loading while initializing auth
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/left2lift-logo.dim_256x256.png"
            alt="Left2Lift"
            className="w-16 h-16 object-contain"
          />
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading Left2Lift...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → show login screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  // Authenticated but profile loading
  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/left2lift-logo.dim_256x256.png"
            alt="Left2Lift"
            className="w-16 h-16 object-contain"
          />
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Authenticated but no profile → show role selection
  if (!userProfile) {
    return (
      <>
        <RoleSelectionScreen onRoleSelected={() => queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] })} />
        <Toaster />
      </>
    );
  }

  // Route based on role
  const role = userProfile.appRole;

  return (
    <>
      {role === AppUserRole.hotel && <HotelPanel />}
      {role === AppUserRole.ngo && <NGOPanel />}
      {role === AppUserRole.admin && <AdminPanel />}
      <Toaster />
    </>
  );
}
