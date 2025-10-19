"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string; // Nuevo prop opcional para el título
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar para móviles */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-background">
              <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                <Sidebar className="w-full border-0" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar para escritorio */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        {/* Barra de navegación superior */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menú</span>
          </Button>
          <MainNav />
        </header>

        {/* Título opcional, arriba a la izquierda */}
        {title && (
          <div className="px-4 md:px-6 py-2 md:py-3 flex justify-center">
            <h1 className="text-base md:text-lg font-semibold text-gray-900 text-center">
              {title}
            </h1>
          </div>
        )}

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <div className="w-full p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
