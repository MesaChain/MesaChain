"use client";

import { ReserveButton } from '../components/Reserve/ReserveButton';
import { useAuth } from '../lib/hooks/useAuth';
import RoleBasedContent from '../components/auth/RoleBasedContent';
import { UserRole, Permission } from '../types/auth';
import Dashboard from '../components/Dashboard/Dashboard';
import Link from 'next/link';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <section className="text-center py-24">
          <h1 className="text-4xl font-bold mb-6">Welcome to MesaChain</h1>
          <Link href="/login" className="mb-8 text-lg text-gray-600">
            Please log in to continue
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Role: <span className="font-medium text-green-600">{user?.role}</span>
        </p>
      </div>

      {/* Admin Dashboard */}
      <RoleBasedContent roles={[UserRole.ADMIN]}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">System Overview</h3>
            <p className="text-gray-600">Complete administrative access to all features.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">User Management</h3>
            <p className="text-gray-600">Manage staff roles and permissions.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Reports</h3>
            <p className="text-gray-600">View comprehensive analytics and reports.</p>
          </div>
        </div>
      </RoleBasedContent>

      {/* Staff Dashboard */}
      <RoleBasedContent roles={[UserRole.STAFF]} permissions={[Permission.POS]}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Order Management</h3>
            <p className="text-gray-600">Process orders and manage customer requests.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Menu Operations</h3>
            <p className="text-gray-600">Update menu items and availability.</p>
          </div>
        </div>
      </RoleBasedContent>

      {/* User Dashboard */}
      <RoleBasedContent roles={[UserRole.USER]}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Make a Reservation</h3>
            <p className="text-gray-600 mb-4">Reserve your table in seconds!</p>
            <ReserveButton />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Order History</h3>
            <p className="text-gray-600">View your past orders and reservations.</p>
          </div>
        </div>
      </RoleBasedContent>

      {/* Common Dashboard Component */}
      <Dashboard />
    </main>
  );
}
