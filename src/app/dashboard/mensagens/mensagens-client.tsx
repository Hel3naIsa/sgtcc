"use client";

import React, { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";

interface Mensagem {
  autor: "me" | "outro";
  nome: string;
  texto: string;
  hora: string;
}

interface MensagensClientProps {
  nomeUsuario: string;
  papel: string;
}

export function MensagensClient({ nomeUsuario, papel }: MensagensClientProps) {
  const isProf = papel === "ORIENTADOR" || papel === "COORDENACAO" || papel === "ADMIN";

  const [contatoAtivo, setContatoAtivo] = useState(0);
  const [texto, setTexto] = useState("");

  const contatos = isProf
    ? [
        { id: 0, nome: "Jorge", sub: "Sistema de Gestão de TCC (Aluno)", hora: "09:40", inicial: "J" },
        { id: 1, nome: "Maria", sub: "Análise de Dados Acadêmicos (Aluna)", hora: "14:05", inicial: "M" },
      ]
    : [
        { id: 0, nome: "Prof.ª Joana Jordão", sub: "Orientadora Docente", hora: "09:12", inicial: "J" },
      ];

  const [conversas, setConversas] = useState<Record<number, Mensagem[]>>({
    0: [
      {
        autor: isProf ? "me" : "outro",
        nome: isProf ? "Você" : "Prof.ª Joana Jordão",
        texto: "Olá! Revisei a introdução do trabalho. Pode avançar para os próximos tópicos do cronograma.",
        hora: "09:12",
      },
      {
        autor: isProf ? "outro" : "me",
        nome: isProf ? "Jorge" : "Você",
        texto: "Obrigado pelas orientações! Vou ajustar as referências e subir a versão 2 antes do prazo limite.",
        hora: "09:40",
      },
    ],
    1: [
      {
        autor: isProf ? "me" : "outro",
        nome: isProf ? "Você" : "Prof. Orientador",
        texto: "Maria, como está o andamento da coleta de dados para a análise?",
        hora: "14:05",
      },
    ],
  });

  const mensagensAtuais = conversas[contatoAtivo] || [];

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;

    const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const novaMsg: Mensagem = {
      autor: "me",
      nome: "Você",
      texto: texto.trim(),
      hora: agora,
    };

    setConversas((prev) => ({
      ...prev,
      [contatoAtivo]: [...(prev[contatoAtivo] || []), novaMsg],
    }));

    setTexto("");
  };

  const contato = contatos[contatoAtivo] || contatos[0];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111a2e]">
          Mensagens Integradas
        </h1>
        <p className="text-xs sm:text-sm text-[#6b7385] mt-0.5">
          {isProf ? "Comunicação centralizada com seus orientandos" : "Comunicação direta com seu orientador"}
        </p>
      </div>

      {/* Caixa de Mensagens no estilo do protótipo */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] border border-[#dfe2e8] rounded-[12px] overflow-hidden bg-white shadow-xs min-h-[520px]">
        {/* Lista Lateral de Conversas */}
        <div className="border-r border-[#dfe2e8] bg-white overflow-y-auto">
          <div className="p-3.5 bg-[#f4f5f7] border-b border-[#dfe2e8] text-xs font-semibold text-[#6b7385]">
            Contatos do TCC
          </div>
          <div className="divide-y divide-[#dfe2e8]">
            {contatos.map((c) => {
              const ativo = c.id === contatoAtivo;
              const ultima = conversas[c.id]?.[conversas[c.id].length - 1];

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setContatoAtivo(c.id)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                    ativo ? "bg-[#f4f5f7] border-l-4 border-[#1e78f0]" : "hover:bg-[#fafbfc]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#0f1b33] text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {c.inicial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline">
                      <b className="text-xs font-semibold text-[#111a2e] truncate">{c.nome}</b>
                      <span className="text-[10.5px] text-[#6b7385]">{c.hora}</span>
                    </div>
                    <p className="text-[11px] text-[#6b7385] truncate mt-0.5">
                      {ultima ? ultima.texto : c.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Área de Conversa Aberta */}
        <div className="flex flex-col bg-[#f4f5f7] min-h-[460px]">
          {/* Topo do Chat */}
          <div className="px-5 py-3.5 bg-white border-b border-[#dfe2e8] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0f1b33] text-white font-bold flex items-center justify-center text-xs">
              {contato.inicial}
            </div>
            <div>
              <b className="text-xs sm:text-sm font-semibold text-[#111a2e] block leading-tight">{contato.nome}</b>
              <small className="text-[11px] text-[#6b7385]">{contato.sub}</small>
            </div>
          </div>

          {/* Lista de Balões */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {mensagensAtuais.map((m, i) => {
              const souEu = m.autor === "me";

              return (
                <div key={i} className={`flex flex-col ${souEu ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-[12px] text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                      souEu
                        ? "bg-[#1e78f0] text-white rounded-br-[2px]"
                        : "bg-white text-[#111a2e] border border-[#dfe2e8] rounded-bl-[2px]"
                    }`}
                  >
                    <p>{m.texto}</p>
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        souEu ? "text-white/80" : "text-[#6b7385]"
                      }`}
                    >
                      {m.hora}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Campo de Input e Envio */}
          <form onSubmit={handleEnviar} className="p-3 bg-white border-t border-[#dfe2e8] flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="flex-1 px-4 py-2 text-xs bg-[#f4f5f7] border border-[#dfe2e8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1e78f0] focus:bg-white text-[#111a2e]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#1e78f0] hover:bg-[#1666d3] text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span>Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
