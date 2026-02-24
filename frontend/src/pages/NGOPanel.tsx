import React, { useState } from 'react';
import Layout from '../components/Layout';
import NGOProfileForm from '../components/ngo/NGOProfileForm';
import NGODonationRequests from '../components/ngo/NGODonationRequests';
import NGODashboard from '../components/ngo/NGODashboard';
import { useGetMyNGOProfile } from '../hooks/useQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Inbox, LayoutDashboard, UserCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function NGOPanel() {
  const { data: ngoProfile, isLoading } = useGetMyNGOProfile();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  // NGO needs to complete profile setup first
  if (!ngoProfile) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">Complete Your NGO Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Set up your organization profile to start receiving food donations
            </p>
          </div>
          <NGOProfileForm />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {ngoProfile.orgName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            NGO Dashboard — Manage your food donation requests
          </p>
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="mb-6 bg-muted border border-border">
            <TabsTrigger value="requests" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <Inbox className="w-4 h-4" />
              Donation Requests
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4" />
              My Dashboard
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <UserCircle className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <NGODonationRequests />
          </TabsContent>

          <TabsContent value="dashboard">
            <NGODashboard />
          </TabsContent>

          <TabsContent value="profile">
            <NGOProfileForm existingProfile={ngoProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
