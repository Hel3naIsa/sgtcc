import { Suspense } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { requireSessao } from "@/lib/auth/server-session";
import { ROTULO_PERFIL, homeDoPerfil } from "@/lib/auth/perfis";
import { LogoutButton } from "@/components/layout/logout-button";

/** Cabeçalho lê o cookie de sessão (dado de requisição), por isso fica em Suspense. */
async function Cabecalho() {
  const sessao = await requireSessao();
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={homeDoPerfil(sessao.perfil)} className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5" /> SGTCC
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm leading-tight sm:block">
            <div className="font-medium">{sessao.nome ?? sessao.email ?? "Usuário"}</div>
            <div className="text-xs text-muted-foreground">{ROTULO_PERFIL[sessao.perfil]}</div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-[53px] border-b bg-card" />}>
        <Cabecalho />
      </Suspense>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
