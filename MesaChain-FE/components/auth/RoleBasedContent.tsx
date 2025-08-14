"use client";
import React from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { UserRole, Permission } from '../../types/auth';

interface RoleBasedContentProps {
  children?: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  fallback?: React.ReactNode;
}

export default function RoleBasedContent({
  children,
  roles,
  permissions,
  fallback = null
}: RoleBasedContentProps) {
  const { hasAnyRole, hasAnyPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  // Check role requirements
  if (roles && !hasAnyRole(roles)) {
    return fallback;
  }

  // Check permission requirements
  if (permissions && !hasAnyPermission(permissions)) {
    return fallback;
  }

  return <>{children}</>;
}