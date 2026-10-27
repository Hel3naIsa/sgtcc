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
    <div className="space-y-8 w-full">
      {/* Cabeçalho no estilo do protótipo com tipografia aprimorada */}
      <div className="border-b border-[#dfe2e8] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111a2e]">
          Olá, {nomeAluno}
        </h1>
        <p className="text-sm text-[#6b7385] mt-1">
          Acompanhe o andamento do seu TCC, consulte feedbacks do orientador e envie novas versões
        </p>
      </div>

      {/* Stats Cards com dimensões mais confortáveis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Conclusão Geral"
          value={`${porcentagemGeral}%`}
          variant="green"
          className="p-5"
        />
        <StatCard
          label="Marcos Concluídos"
          value={`${marcosConcluidos} de ${totalMarcos || 1}`}
          variant="blue"
          className="p-5"
        />
        <StatCard
          label="Próximo Prazo"
          value={proximaEntrega ? formatarData(proximaEntrega.marco.dataLimite) : "Em dia"}
          variant="yellow"
          icon={<Calendar className="w-5 h-5" />}
          className="p-5"
        />
        <StatCard
          label="Feedbacks Recebidos"
          value={totalFeedbacks}
          variant="red"
          icon={<MessageSquare className="w-5 h-5" />}
          className="p-5"
        />
      </div>

      {/* Detalhes do Trabalho e Barra de Progresso com mais espaço e respiro */}
      {tccPrincipal ? (
        <section className="border border-[#dfe2e8] rounded-[12px] p-6 sm:p-8 bg-white shadow-xs space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#dfe2e8] pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e78f0]">
                  Trabalho de Conclusão de Curso
                </span>
                <StatusPill status={ROTULO_STATUS_TCC[tccPrincipal.statusGeral] ?? tccPrincipal.statusGeral} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111a2e] leading-snug">
                {tccPrincipal.titulo}
              </h2>
              <p className="text-sm text-[#6b7385]">
                Orientador(a): <span className="font-semibold text-[#111a2e]">{tccPrincipal.orientadorNome}</span>
              </p>
            </div>

            <div className="min-w-[220px] space-y-2 bg-[#f4f5f7] p-4 rounded-xl border border-[#dfe2e8]">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[#6b7385] uppercase tracking-wider">Progresso</span>
                <b className="text-2xl font-bold text-[#111a2e]">{porcentagemGeral}%</b>
              </div>
              <ProgressBar value={porcentagemGeral} className="h-2.5" />
            </div>
          </div>

          {/* Marcos e Entregas (Blocos do TCC) em grade ampla */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#111a2e]">
                  Etapas e Entregas do Semestre
                </h3>
                <p className="text-xs text-[#6b7385]">
                  Cronograma oficial de acompanhamento e marcos obrigatórios
                </p>
              </div>
              <Link
                href={`/dashboard/tcc/${tccPrincipal.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1e78f0] hover:bg-[#1666d3] text-white text-xs font-semibold transition-colors shadow-xs w-fit"
              >
                <span>Acessar histórico e submissões</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {marcos.map((item, idx) => {
                const statusStr = ROTULO_STATUS_ENTREGA[item.statusEfetivo] ?? item.statusEfetivo;
                const prazo = formatarData(item.marco.dataLimite);

                return (
                  <article
                    key={item.marco.id}
                    className="border border-[#dfe2e8] rounded-[10px] p-5 bg-[#f4f5f7] hover:border-[#b8c2d1] transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#111a2e] leading-snug">
                          {idx + 1}. {item.marco.titulo}
                        </h4>
                        <StatusPill status={statusStr} />
                      </div>
                      <p className="text-xs text-[#6b7385]">
                        Prazo limite: <span className="font-semibold text-[#111a2e]">{prazo}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#dfe2e8] text-xs text-[#6b7385] space-y-1.5">
                      <div className="flex justify-between">
                        <span>Arquivos enviados:</span>
                        <span className="font-semibold text-[#111a2e]">{item.versoes.length} versão(ões)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Feedbacks recebidos:</span>
                        <span className="font-semibold text-[#111a2e]">{item.feedbacks.length} comentário(s)</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <div className="border border-dashed border-[#dfe2e8] rounded-[12px] p-12 text-center space-y-3 bg-white">
          <BookOpen className="w-10 h-10 text-[#6b7385] mx-auto" />
          <h3 className="text-base font-bold text-[#111a2e]">Nenhum TCC ativo no momento</h3>
          <p className="text-xs text-[#6b7385] max-w-sm mx-auto">
            Você ainda não foi vinculado a um TCC neste semestre letivo. Entre em contato com a coordenação.
          </p>
        </div>
      )}
    </div>
  );
}
