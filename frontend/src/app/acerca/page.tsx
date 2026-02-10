'use client';

import DashboardLayout from "@/app/dashboard-layout";
import AboutMe from "@/components/AboutMe/AboutMe";

export default function AcercaPage() {
    return (
        <DashboardLayout title="Conoce a Maniek">
            <div className="w-full bg-white min-h-screen">
                <AboutMe />
            </div>
        </DashboardLayout>
    );
}
