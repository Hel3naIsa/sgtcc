import type { StatusEntrega, StatusGeralTCC } from "@/types";

export const ROTULO_STATUS_ENTREGA: Record<StatusEntrega, string> = {
  AGUARDANDO_ENVIO: "Aguardando envio",
  PRONTA_PARA_REVISAO: "Pronta para revisão",
  EM_REVISAO: "Em revisão",
  SOLICITADA_CORRECAO: "Correção solicitada",
  CONCLUIDA: "Concluída",
  ATRASADA: "Atrasada",
};

export const ROTULO_STATUS_TCC: Record<StatusGeralTCC, string> = {
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_BANCA: "Aguardando banca",
  DEFENDIDO: "Defendido",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
};

const FUSO = "America/Sao_Paulo";

export function formatarData(v: Date | string | undefined): string {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("pt-BR", { timeZone: FUSO });
}

export function formatarDataHora(v: Date | string | undefined): string {
  if (!v) return "—";
  return new Date(v).toLocaleString("pt-BR", { timeZone: FUSO, dateStyle: "short", timeStyle: "short" });
}
