import { Suspense } from "react";
import { requireSessao } from "@/lib/auth/server-session";
import { MensagensClient } from "./mensagens-client";

export const metadata = { title: "Mensagens — SGTCC" };
export const dynamic = "force-dynamic";

async function ConteudoMensagens() {
  const sessao = await requireSessao();

  return (
    <MensagensClient
      nomeUsuario={sessao.nome ?? "Usuário"}
      papel={sessao.perfil}
    />
  );
}

export default function MensagensPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[#f4f5f7]" />}>
      <ConteudoMensagens />
    </Suspense>
  );
}
