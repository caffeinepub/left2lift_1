import React from 'react';
import Layout from '../components/Layout';
import AdminUserManagement from '../components/admin/AdminUserManagement';
import AdminFoodSafetyMonitoring from '../components/admin/AdminFoodSafetyMonitoring';
import AdminSystemAnalytics from '../components/admin/AdminSystemAnalytics';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, ShieldAlert, BarChart3 } from 'lucide-react';

export default function AdminPanel() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users, monitor food safety, and view system analytics
          </p>
        </div>

        <Tabs defaultValue="analytics">
          <TabsList className="mb-6 bg-muted border border-border">
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <ShieldAlert className="w-4 h-4" />
              Food Safety
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdminSystemAnalytics />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="safety">
            <AdminFoodSafetyMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
