import { Suspense } from "react";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getSessaoServidor } from "@/lib/auth/server-session";
import { destinoSeguro, homeDoPerfil } from "@/lib/auth/perfis";
import { LoginSso } from "./login-sso";

export const metadata = { title: "Entrar — SGTCC" };

/** Quem já tem sessão válida vai direto para a home do seu perfil. */
async function Conteudo({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const sessao = await getSessaoServidor();
  const destino = destinoSeguro(next);
  if (sessao) redirect(destino ?? homeDoPerfil(sessao.perfil));
  // Sem ?next, o dashboard redireciona para a home do perfil.
  return <LoginSso destino={destino ?? "/dashboard"} />;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="rounded-lg bg-primary p-2 text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">SGTCC</h1>
          <p className="text-sm text-muted-foreground">Acesse com sua conta institucional</p>
        </div>
        <Suspense>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
