"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface Evento {
  dia: number;
  mes: string;
  titulo: string;
  tipo: "entrega" | "reuniao" | "banca";
  paraQuem: string;
}

export function CalendarioClient() {
  const [mesAtual, setMesAtual] = useState("Outubro de 2026");

  const eventos: Evento[] = [
    { dia: 15, mes: "09", titulo: "Marco 1: Entrega da Qualificação", tipo: "entrega", paraQuem: "Todos os Alunos" },
    { dia: 7, mes: "10", titulo: "Reunião de Alinhamento de Metodologia", tipo: "reuniao", paraQuem: "Orientandos" },
    { dia: 10, mes: "11", titulo: "Marco 2: Entrega Final da Monografia (Bloqueio estrito)", tipo: "entrega", paraQuem: "Todos os Alunos" },
    { dia: 25, mes: "11", titulo: "Início do Período de Defesas com Bancas Examinadoras", tipo: "banca", paraQuem: "Professores e Alunos" },
  ];

  // Matriz de 31 dias de Outubro de 2026 (Quinta-feira é dia 1)
  const diasOutubro = Array.from({ length: 31 }, (_, i) => i + 1);
  const diasComEvento = [7, 14, 19, 21, 28];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111a2e]">
          Calendário Acadêmico de TCC
        </h1>
        <p className="text-xs sm:text-sm text-[#6b7385] mt-0.5">
          Cronograma de marcos, entregas e bancas avaliadoras do semestre letivo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Grade do Calendário no estilo do protótipo */}
        <div className="border border-[#dfe2e8] rounded-[12px] p-6 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#dfe2e8]">
            <h2 className="text-sm sm:text-base font-bold text-[#111a2e] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#1e78f0]" /> {mesAtual}
            </h2>
            <span className="text-xs text-[#6b7385] font-semibold bg-[#f4f5f7] px-2.5 py-1 rounded-full">
              Semestre 2026/2
            </span>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#6b7385]">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Dias do Mês */}
          <div className="grid grid-cols-7 gap-2">
            {/* Espaços vazios antes do dia 1 (outubro começou numa quinta: 4 dias vazios) */}
            <div className="h-12 border border-transparent" />
            <div className="h-12 border border-transparent" />
            <div className="h-12 border border-transparent" />
            <div className="h-12 border border-transparent" />

            {diasOutubro.map((dia) => {
              const temEvento = diasComEvento.includes(dia);

              return (
                <div
                  key={dia}
                  className={`h-12 rounded-[6px] border p-1.5 text-xs flex flex-col justify-between transition-colors ${
                    temEvento
                      ? "bg-[#ffd84d] text-[#111a2e] border-[#ffd84d] font-bold"
                      : dia === 26
                      ? "border-[#1e78f0] font-bold text-[#1e78f0] bg-blue-50/50"
                      : "border-[#dfe2e8] text-[#111a2e] bg-white hover:bg-[#f4f5f7]"
                  }`}
                >
                  <span className="block leading-none">{dia}</span>
                  {temEvento && (
                    <span className="text-[9.5px] truncate block opacity-90">Prazo</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Próximos Eventos */}
        <div className="border border-[#dfe2e8] rounded-[12px] p-6 bg-white shadow-xs space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-[#111a2e] pb-2 border-b border-[#dfe2e8]">
            Próximos Marcos Semestrais
          </h3>

          <div className="space-y-3">
            {eventos.map((ev, i) => (
              <div
                key={i}
                className="p-3.5 rounded-[8px] border border-[#dfe2e8] bg-[#f4f5f7] flex items-start gap-3"
              >
                <div className="px-2.5 py-1.5 rounded-[6px] bg-[#0f1b33] text-white font-bold text-xs shrink-0 text-center">
                  <span className="block text-sm leading-none">{ev.dia}</span>
                  <span className="text-[10px] text-blue-200">/{ev.mes}</span>
                </div>
                <div className="min-w-0">
                  <b className="text-xs font-semibold text-[#111a2e] block leading-snug">
                    {ev.titulo}
                  </b>
                  <span className="text-[11px] text-[#6b7385] block mt-0.5">
                    Público: {ev.paraQuem}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
