'use client';

import DashboardLayout from "@/app/dashboard-layout";
import UserProfile from "@/components/UserProfile/UserProfile";
import AuthGuard from "@/components/AuthGuard/AuthGuard";

export default function ProfilePage() {
    return (
        <AuthGuard>
            <DashboardLayout title="Mi Perfil">
                <div className="w-full bg-gray-50/50 min-h-screen">
                    <UserProfile />
                </div>
            </DashboardLayout>
        </AuthGuard>
    );
}
