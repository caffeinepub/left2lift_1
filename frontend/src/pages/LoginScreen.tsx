import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Leaf, Heart, Users, ArrowRight } from 'lucide-react';

export default function LoginScreen() {
  const { login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <img
            src="/assets/generated/left2lift-logo.dim_256x256.png"
            alt="Left2Lift Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="font-display font-bold text-xl text-primary-600">Left2Lift</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium border border-primary-200">
              <Leaf className="w-4 h-4" />
              AI-Powered Food Redistribution
            </div>

            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Turning{' '}
              <span className="text-primary-600">Leftovers</span>{' '}
              into{' '}
              <span className="text-secondary-500">Lifelines</span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Left2Lift connects hotels and restaurants with NGOs to redistribute surplus food,
              reduce waste, and feed communities — powered by intelligent matching.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-4 bg-card rounded-xl border border-border shadow-card">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Zero Waste</p>
              </div>
              <div className="text-center p-4 bg-card rounded-xl border border-border shadow-card">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 text-secondary-600" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Feed More</p>
              </div>
              <div className="text-center p-4 bg-card rounded-xl border border-border shadow-card">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Connect</p>
              </div>
            </div>
          </div>

          {/* Right: Login card */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-8 space-y-6">
            <div className="text-center space-y-2">
              <img
                src="/assets/generated/left2lift-logo.dim_256x256.png"
                alt="Left2Lift"
                className="w-20 h-20 object-contain mx-auto"
              />
              <h2 className="font-display text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground text-sm">
                Sign in securely with Internet Identity to access your dashboard
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Hotels & Restaurants</p>
                  <p className="text-xs text-muted-foreground">Submit surplus food donations</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                <div className="w-5 h-5 rounded-full bg-secondary-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">NGOs & Trusts</p>
                  <p className="text-xs text-muted-foreground">Receive matched food donations</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Administrators</p>
                  <p className="text-xs text-muted-foreground">Monitor and manage the platform</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Sign In with Internet Identity
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Secured by Internet Computer's decentralized identity system
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Left2Lift. All rights reserved.</span>
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
