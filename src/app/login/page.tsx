import { Suspense } from "react";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getSessaoServidor } from "@/lib/auth/server-session";
import { destinoSeguro, homeDoPerfil } from "@/lib/auth/perfis";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar — SGTCC" };

/** Quem já tem sessão válida vai direto para a home do seu perfil. */
async function Conteudo({ searchParams }: { searchParams: Promise<{ next?: string; tab?: string }> }) {
  const { next, tab } = await searchParams;
  const sessao = await getSessaoServidor();
  const destino = destinoSeguro(next);
  if (sessao) redirect(destino ?? homeDoPerfil(sessao.perfil));
  return <LoginForm destino={destino ?? "/dashboard"} initialTab={tab === "cadastro" ? "cadastro" : "login"} />;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; tab?: string }> }) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center p-4 sm:p-6 bg-neutral-50/60 dark:bg-neutral-950/60">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="rounded-xl bg-primary p-2.5 text-primary-foreground shadow-xs">
            <GraduationCap className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">SGTCC</h1>
          <p className="text-xs text-muted-foreground">
            Sistema Integrado de Gestão de TCC &bull; Acesso Acadêmico
          </p>
        </div>
        <Suspense>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
