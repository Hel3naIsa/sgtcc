"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, MessageSquare, Calendar } from "lucide-react";
import { homeDoPerfil } from "@/lib/auth/perfis";
import { PerfilEnum } from "@/types";

interface DashboardNavProps {
  perfil: PerfilEnum;
}

export function DashboardNav({ perfil }: DashboardNavProps) {
  const pathname = usePathname();
  const homePath = homeDoPerfil(perfil);

  const isProf =
    perfil === PerfilEnum.ORIENTADOR ||
    perfil === PerfilEnum.COORDENACAO ||
    perfil === PerfilEnum.ADMIN;

  const links = [
    {
      href: homePath,
      label: "Dashboard",
      icon: LayoutDashboard,
      ativo: pathname === homePath || (pathname.startsWith("/dashboard/tcc") && !pathname.includes("mensagens") && !pathname.includes("calendario")),
    },
    ...(isProf
      ? [
          {
            href: "/dashboard/orientador",
            label: "Meus Alunos",
            icon: Users,
            ativo: pathname === "/dashboard/orientador" && homePath !== "/dashboard/orientador",
          },
        ]
      : []),
    {
      href: "/dashboard/mensagens",
      label: "Mensagens",
      icon: MessageSquare,
      ativo: pathname === "/dashboard/mensagens",
    },
    {
      href: "/dashboard/calendario",
      label: "Calendário",
      icon: Calendar,
      ativo: pathname === "/dashboard/calendario",
    },
  ];

  return (
    <nav className="space-y-1.5">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.ativo;

        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive
                ? "bg-[#1e78f0] text-white shadow-xs"
                : "text-[#d6dcea] hover:bg-[#1a2a4a] hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
