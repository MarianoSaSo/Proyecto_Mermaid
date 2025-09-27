"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname(); //Este pathname lo usamos para luego ayudarnos a saber si el elemento se debe activar o no
  const menuGroups = getMenuList(pathname);

  return (
    <div
      className={cn(
        "hidden md:flex flex-col h-screen w-64 border-r bg-background p-4",
        className
      )}
    >
      <div className="flex items-center justify-center mb-4 px-2">
        <video
          src="/logo_lateral2.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-32 h-32 rounded-full shadow object-cover"
        />
      </div>

      <nav className="flex-1 space-y-8">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {group.groupLabel && ( //Si el grupo tiene groupLabel, se muestra como título
              <h3 className="px-2 text-sm font-medium text-muted-foreground">
                {group.groupLabel}
              </h3>
            )}
            <ul className="space-y-1">
              {group.menus.map((menu, menuIndex) => {
                const isActive =
                  pathname === menu.href ||
                  (menu.href !== "/" && pathname.startsWith(menu.href));

                return (
                  <li key={menuIndex}>
                    <Link
                      href={menu.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <menu.icon className="h-4 w-4" />
                      <span>{menu.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
