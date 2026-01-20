"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/' }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user.isLoggedIn) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white-50">
        <div
          className="w-45 h-45 rounded-xl overflow-hidden relative"
          style={{
            border: "4px solid rgba(255, 223, 186, 0.7)",
            boxShadow: "0 0 40px 10px rgba(255, 223, 186, 0.4)",
          }}
        >
          <video
            src="/loading_hero.mp4"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform translate-y-[-2%]"
          />
        </div>
        <p className="mt-6 text-gray-700 font-medium">Verificando autenticación...</p>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (la redirección se encargará)
  if (!user.isLoggedIn) {
    return null;
  }

  // Si está autenticado, renderizar los children
  return <>{children}</>;
}
