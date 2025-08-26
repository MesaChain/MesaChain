"use client";

import StaffManagement from "@/components/staff-management";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { UserRole } from "../../types/auth";

export default function StaffPage() {
    return (
        <ProtectedRoute roles={[UserRole.ADMIN]}>
            <main className="container mx-auto px-4 py-8">
                <StaffManagement />
            </main>
        </ProtectedRoute>
    );
}

