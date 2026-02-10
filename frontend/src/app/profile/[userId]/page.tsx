'use client';

import DashboardLayout from "@/app/dashboard-layout";
import UserProfile from "@/components/UserProfile/UserProfile";
import { useParams } from 'next/navigation';

export default function DynamicProfilePage() {
    const params = useParams();
    const userId = params.userId as string;

    return (
        <DashboardLayout title="Perfil de Usuario">
            <div className="w-full bg-gray-50/50 min-h-screen">
                <UserProfile userId={userId} />
            </div>
        </DashboardLayout>
    );
}
