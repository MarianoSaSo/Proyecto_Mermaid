'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ModeToggle } from './mode-toggle';

export function MainNav() {
  const pathname = usePathname();

  const items = [
    {
      href: '/',
      label: 'Inicio',
    },
    {
      href: '/acerca',
      label: 'Acerca de',
    },
    {
      href: '/contacto',
      label: 'Contacto',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Mermaid AI</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Aquí podrías agregar una barra de búsqueda , mas adelante lo haremos*/}
          </div>
          <nav className="flex items-center">
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
