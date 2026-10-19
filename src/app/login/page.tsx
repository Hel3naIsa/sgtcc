import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessaoServidor } from "@/lib/auth/server-session";
import { destinoSeguro, homeDoPerfil } from "@/lib/auth/perfis";
import { LoginForm } from "./login-form";

export const metadata = { title: "Acesse sua conta — SGTCC" };

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
    <Suspense fallback={<div className="min-h-screen bg-[#0f1b33]" />}>
      <Conteudo searchParams={searchParams} />
    </Suspense>
  );
}
