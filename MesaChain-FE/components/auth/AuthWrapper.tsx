"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/hooks/useAuth';
import Sidebar from '../MesaSidebar';
import MainContent from '../layout/MainContent';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Pages that don't require authentication
  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(pathname);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated and not on a public page, show login page
  if (!isAuthenticated && !isPublicPage) {
    return children; // This will show the login form through routing
  }

  // If user is authenticated and on login page, redirect to dashboard
  if (isAuthenticated && isPublicPage) {
    window.location.href = '/';
    return null;
  }

  // If authenticated or on public page, show appropriate layout
  if (isAuthenticated && !isPublicPage) {
    return (
      <>
        <Sidebar />
        <MainContent>{children}</MainContent>
      </>
    );
  }

  // For public pages (like login), show without sidebar
  return children;
}