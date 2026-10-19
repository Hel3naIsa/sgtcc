import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessaoServidor } from "@/lib/auth/server-session";
import { destinoSeguro, homeDoPerfil } from "@/lib/auth/perfis";
import { LoginForm } from "./login-form";

export const metadata = { title: "Acesse sua conta — SGTCC" };

function LoginFallback() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#ffffff] font-sans">
      <div className="w-full md:w-5/12 lg:w-4/12 bg-[#0f1b33] flex flex-col items-center justify-center p-8 sm:p-12 text-center text-white min-h-[220px] md:min-h-screen">
        <div className="flex flex-col items-center space-y-3 max-w-xs animate-pulse">
          <div className="w-20 h-20 bg-white/10 rounded-2xl" />
          <div className="h-7 w-28 bg-white/10 rounded mt-2" />
          <div className="h-4 w-44 bg-white/10 rounded" />
        </div>
      </div>
      <div className="w-full md:w-7/12 lg:w-8/12 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white">
        <div className="w-full max-w-[420px] space-y-6 animate-pulse">
          <div className="h-7 w-44 bg-gray-200 rounded" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
          <div className="space-y-4 pt-2">
            <div className="h-10 w-full bg-gray-100 rounded-lg" />
            <div className="h-10 w-full bg-gray-100 rounded-lg" />
            <div className="h-11 w-full bg-[#1e78f0]/40 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Quem já tem sessão válida vai direto para a home do seu perfil. */
async function Conteudo({ searchParams }: { searchParams: Promise<{ next?: string; tab?: string }> }) {
  const { next, tab } = await searchParams;
  let sessao = null;
  try {
    sessao = await getSessaoServidor();
  } catch {
    sessao = null;
  }
  const destino = destinoSeguro(next);
  if (sessao) redirect(destino ?? homeDoPerfil(sessao.perfil));
  return <LoginForm destino={destino ?? "/dashboard"} initialTab={tab === "cadastro" ? "cadastro" : "login"} />;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; tab?: string }> }) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <Conteudo searchParams={searchParams} />
    </Suspense>
  );
}
