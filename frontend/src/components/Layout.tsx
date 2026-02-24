import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { AppUserRole } from '../backend';
import { Building2, Heart, Shield, Leaf, LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export default function Layout({ children }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const roleLabel =
    userProfile?.appRole === AppUserRole.hotel
      ? 'Hotel'
      : userProfile?.appRole === AppUserRole.ngo
      ? 'NGO'
      : userProfile?.appRole === AppUserRole.admin
      ? 'Admin'
      : '';

  const RoleIcon =
    userProfile?.appRole === AppUserRole.hotel
      ? Building2
      : userProfile?.appRole === AppUserRole.ngo
      ? Heart
      : Shield;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/left2lift-logo.dim_256x256.png"
              alt="Left2Lift"
              className="w-9 h-9 object-contain"
            />
            <div>
              <span className="font-display font-bold text-lg text-primary-600 leading-none block">
                Left2Lift
              </span>
              <span className="text-xs text-muted-foreground leading-none">
                Food Redistribution Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userProfile && (
              <div className="hidden sm:flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-3 py-1.5">
                <RoleIcon className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-xs font-medium text-primary-700">
                  {roleLabel}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground max-w-[120px] truncate">
                {userProfile?.displayName || identity?.getPrincipal().toString().slice(0, 8) + '...'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full hover:bg-muted"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6 bg-card">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-primary-500" />
            <span>© {new Date().getFullYear()} Left2Lift — Reducing food waste, one meal at a time.</span>
          </div>
          <span>
            Built with <Heart className="w-3 h-3 inline text-secondary-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'left2lift')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
