import React, { useState } from 'react';
import Layout from '../components/Layout';
import HotelDonationForm from '../components/hotel/HotelDonationForm';
import HotelDashboard from '../components/hotel/HotelDashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PlusCircle, LayoutDashboard } from 'lucide-react';

export default function HotelPanel() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Hotel Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your food donations and track your impact
          </p>
        </div>

        <Tabs defaultValue="donate">
          <TabsList className="mb-6 bg-muted border border-border">
            <TabsTrigger value="donate" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <PlusCircle className="w-4 h-4" />
              New Donation
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <LayoutDashboard className="w-4 h-4" />
              My Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donate">
            <HotelDonationForm />
          </TabsContent>

          <TabsContent value="dashboard">
            <HotelDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
