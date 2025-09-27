import { profesoradoMenu, alumno } from "@/lib/constantes-sidebar";
import { Tag, Users, Settings, Bookmark, LayoutGrid, LucideIcon } from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

// 🔹 Convertir cada automatización en un item de menú principal, usando su icono original
const profesorado_Menu: Menu[] = profesoradoMenu.map(auto => ({
  href: auto.link,
  label: auto.text,
  icon: auto.icon
}));
const alumno_Menu: Menu[] = alumno.map(auto => ({
  href: auto.link,
  label: auto.text,
  icon: auto.icon
}));

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/",
          label: "Inicio",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Profesorado",
      menus: [
        {
          href: "/profesorado/vertodas",
          label: "Ver todas",
          icon: Settings
        },
        ...profesorado_Menu
      ]
    },
    {
      groupLabel: "Alumnado",
      menus: [
        {
          href: "/alumnado",
          label: "Ver todo",
          icon: Settings
        },
        ...alumno_Menu
      ]
    },
    {
      groupLabel: "Configuración",
      menus: [
        {
          href: "/config",
          label: "Configuración",
          icon: Settings
        }
      ]
    }
  ];
}
