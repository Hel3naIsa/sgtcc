import { Suspense } from "react";
import { requireSessao } from "@/lib/auth/server-session";
import { ROTULO_PERFIL } from "@/lib/auth/perfis";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PerfilEnum } from "@/types";

export const metadata = { title: "Painel do Aluno — SGTCC" };
export const dynamic = "force-dynamic";

async function ConteudoAluno() {
  const sessao = await requireSessao(PerfilEnum.ALUNO);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-[#dfe2e8] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#111a2e]">Painel do Aluno</h1>
        <p className="text-sm text-[#6b7385] mt-1">
          Acompanhamento acadêmico e gestão de Trabalho de Conclusão de Curso
        </p>
      </div>

      {/* Card de Informações da Sessão */}
      <div className="p-6 rounded-xl border border-[#dfe2e8] bg-[#f4f5f7] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111a2e]">
              Bem-vindo(a), {sessao.nome ?? "Aluno(a)"}!
            </h2>
            <p className="text-xs text-[#6b7385]">
              Sua conta institucional está conectada ao sistema.
            </p>
          </div>
        </div>

        {/* Informações da Credencial Autenticada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white rounded-lg border border-[#dfe2e8]">
            <span className="text-[#6b7385] block font-medium">E-mail Institucional:</span>
            <span className="font-semibold text-[#111a2e]">{sessao.email}</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-[#dfe2e8]">
            <span className="text-[#6b7385] block font-medium">Perfil:</span>
            <span className="font-semibold text-[#1e78f0]">{ROTULO_PERFIL[sessao.perfil]}</span>
          </div>
          {sessao.usuario?.id && (
            <div className="p-3 bg-white rounded-lg border border-[#dfe2e8]">
              <span className="text-[#6b7385] block font-medium">Identificador:</span>
              <span className="font-mono text-[#111a2e]">{sessao.uid}</span>
            </div>
          )}
          <div className="p-3 bg-white rounded-lg border border-[#dfe2e8]">
            <span className="text-[#6b7385] block font-medium">Status da Conexão:</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Sessão Ativa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlunoDashboardPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[#f4f5f7]" />}>
      <ConteudoAluno />
    </Suspense>
  );
}
