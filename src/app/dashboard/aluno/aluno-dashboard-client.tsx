"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ROTULO_STATUS_TCC, ROTULO_STATUS_ENTREGA, formatarData } from "@/components/layout/status";
import type { TccResumo, PainelTcc } from "@/lib/data/queries";
import { BookOpen, Calendar, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

interface AlunoDashboardClientProps {
  nomeAluno: string;
  tccs: TccResumo[];
  detalhesPrincipal: PainelTcc | null;
}

export function AlunoDashboardClient({
  nomeAluno,
  tccs,
  detalhesPrincipal,
}: AlunoDashboardClientProps) {
  const tccPrincipal = tccs[0] ?? null;

  // Estatísticas baseadas nos marcos do TCC principal
  const marcos = detalhesPrincipal?.itens ?? [];
  const totalMarcos = marcos.length;
  const marcosConcluidos = marcos.filter((m) => m.statusEfetivo === "CONCLUIDA").length;
  const porcentagemGeral = totalMarcos > 0 ? Math.round((marcosConcluidos / totalMarcos) * 100) : 0;

  // Próxima entrega pendente
  const proximaEntrega = marcos.find((m) => m.statusEfetivo !== "CONCLUIDA");

  // Total de feedbacks recebidos
  const totalFeedbacks = marcos.reduce((acc, m) => acc + m.feedbacks.length, 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho no estilo do protótipo */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#111a2e]">
          Olá, {nomeAluno}
        </h1>
        <p className="text-[12.5px] text-[#6b7385] mt-0.5">
          Acompanhe o andamento do seu TCC e os prazos das suas entregas
        </p>
      </div>

      {/* Stats Cards com as cores e visual do protótipo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Conclusão Geral"
          value={`${porcentagemGeral}%`}
          variant="green"
        />
        <StatCard
          label="Marcos Concluídos"
          value={`${marcosConcluidos} de ${totalMarcos || 1}`}
          variant="blue"
        />
        <StatCard
          label="Próximo Prazo"
          value={proximaEntrega ? formatarData(proximaEntrega.marco.dataLimite) : "Em dia"}
          variant="yellow"
          icon={<Calendar className="w-4 h-4" />}
        />
        <StatCard
          label="Feedbacks Recebidos"
          value={totalFeedbacks}
          variant="red"
          icon={<MessageSquare className="w-4 h-4" />}
        />
      </div>

      {/* Detalhes do Trabalho e Barra de Progresso */}
      {tccPrincipal ? (
        <section className="border border-[#dfe2e8] rounded-[10px] p-5 sm:p-6 bg-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#dfe2e8] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1e78f0]">
                  Trabalho de Conclusão de Curso
                </span>
                <StatusPill status={ROTULO_STATUS_TCC[tccPrincipal.statusGeral] ?? tccPrincipal.statusGeral} />
              </div>
              <h2 className="text-lg font-bold text-[#111a2e] mt-1">{tccPrincipal.titulo}</h2>
              <p className="text-xs text-[#6b7385] mt-1">
                Orientador(a): <span className="font-semibold text-[#111a2e]">{tccPrincipal.orientadorNome}</span>
              </p>
            </div>

            <div className="min-w-[180px] space-y-1">
              <div className="flex justify-between items-baseline">
                <b className="text-2xl font-bold text-[#111a2e]">{porcentagemGeral}%</b>
                <span className="text-xs text-[#6b7385]">concluído</span>
              </div>
              <ProgressBar value={porcentagemGeral} />
            </div>
          </div>

          {/* Marcos e Entregas (Blocos do TCC) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111a2e]">
                Etapas e Entregas do Semestre
              </h3>
              <Link
                href={`/dashboard/tcc/${tccPrincipal.id}`}
                className="text-xs font-semibold text-[#1e78f0] hover:underline flex items-center gap-1"
              >
                Ver histórico e submeter arquivos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {marcos.map((item, idx) => {
                const statusStr = ROTULO_STATUS_ENTREGA[item.statusEfetivo] ?? item.statusEfetivo;
                const isConcluido = item.statusEfetivo === "CONCLUIDA";
                const prazo = formatarData(item.marco.dataLimite);

                return (
                  <article
                    key={item.marco.id}
                    className="border border-[#dfe2e8] rounded-[8px] p-4 bg-[#f4f5f7] flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#111a2e] leading-snug">
                          {idx + 1}. {item.marco.titulo}
                        </h4>
                        <StatusPill status={statusStr} />
                      </div>
                      <p className="text-[11px] text-[#6b7385]">
                        Prazo limite: <span className="font-medium text-[#111a2e]">{prazo}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#dfe2e8] text-[11.5px] text-[#6b7385] space-y-1">
                      <div className="flex justify-between">
                        <span>Arquivos enviados:</span>
                        <span className="font-semibold text-[#111a2e]">{item.versoes.length} versão(ões)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Feedbacks:</span>
                        <span className="font-semibold text-[#111a2e]">{item.feedbacks.length} nota(s)</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <div className="border border-dashed border-[#dfe2e8] rounded-[10px] p-10 text-center space-y-2 bg-white">
          <BookOpen className="w-8 h-8 text-[#6b7385] mx-auto" />
          <h3 className="text-sm font-bold text-[#111a2e]">Nenhum TCC ativo no momento</h3>
          <p className="text-xs text-[#6b7385]">
            Você ainda não foi vinculado a um TCC neste semestre letivo. Entre em contato com a coordenação.
          </p>
        </div>
      )}
    </div>
  );
}
