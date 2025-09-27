'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Evitar hidratación hasta que el componente se monte en el cliente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calcular el tema siguiente de manera segura
  const nextTheme = React.useMemo(() => {
    if (!mounted) return 'light';
    if (!theme) return 'light';
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    return theme === 'light' ? 'dark' : 'system';
  }, [theme, mounted]);

  // Obtener el ícono actual de manera segura
  const CurrentIcon = React.useMemo(() => {
    if (!mounted) return Sun;
    if (theme === 'system') return Monitor;
    return theme === 'dark' ? Moon : Sun;
  }, [theme, mounted]);

  // Si no está montado, renderizar un botón de carga
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-md"
        aria-label="Cambiar tema"
      >
        <div className="h-4 w-4" />
        <span className="sr-only">Cambiar tema</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md"
          onClick={() => setTheme(nextTheme)}
          aria-label="Cambiar tema"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
