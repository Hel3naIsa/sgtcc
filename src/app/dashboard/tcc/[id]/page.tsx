import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessao } from "@/lib/auth/server-session";
import { homeDoPerfil } from "@/lib/auth/perfis";
import { getPainelTcc } from "@/lib/data/queries";
import {
  ROTULO_STATUS_ENTREGA,
  ROTULO_STATUS_TCC,
  formatarData,
  formatarDataHora,
} from "@/components/layout/status";
import type { StatusEntrega } from "@/types";

const VARIANTE: Record<StatusEntrega, "default" | "secondary" | "destructive" | "outline"> = {
  AGUARDANDO_ENVIO: "outline",
  PRONTA_PARA_REVISAO: "secondary",
  EM_REVISAO: "secondary",
  SOLICITADA_CORRECAO: "destructive",
  CONCLUIDA: "default",
  ATRASADA: "destructive",
};

async function Painel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessao = await requireSessao();
  const painel = await getPainelTcc(sessao, id);
  // US01 AC3: Bloqueio de acesso indevido (Erro 403)
  if (!painel) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 max-w-md mx-auto">
        <Badge variant="destructive" className="px-3 py-1 text-xs">
          Erro 403 &bull; Acesso Negado
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight">Acesso Não Autorizado</h1>
        <p className="text-sm text-muted-foreground">
          Você não possui vínculo acadêmico com este Trabalho de Conclusão de Curso. O acesso ao documento e histórico é restrito aos envolvidos (Aluno, Orientador e Banca associada).
        </p>
        <Link
          href={homeDoPerfil(sessao.perfil)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Meu Dashboard
        </Link>
      </div>
    );
  }
  const { tcc, itens } = painel;

  return (
    <div className="space-y-6">
      <Link
        href={homeDoPerfil(sessao.perfil)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{tcc.titulo}</h1>
          <Badge variant="secondary">{ROTULO_STATUS_TCC[tcc.statusGeral] ?? tcc.statusGeral}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Aluno: {tcc.alunoNome} · Orientador: {tcc.orientadorNome}
        </p>
      </header>

      <ol className="grid gap-4">
        {itens.map(({ marco, entrega, statusEfetivo, versoes, feedbacks }) => (
          <li key={marco.id}>
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>{marco.titulo}</CardTitle>
                  <p className="text-xs text-muted-foreground">Prazo: {formatarData(marco.dataLimite)}</p>
                </div>
                <Badge variant={VARIANTE[statusEfetivo]}>{ROTULO_STATUS_ENTREGA[statusEfetivo]}</Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h3 className="mb-1 font-medium">Versões enviadas</h3>
                  {versoes.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum arquivo enviado.</p>
                  ) : (
                    <ul className="space-y-1">
                      {versoes.map((v) => (
                        <li key={v.id} className="flex items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">
                            v{v.numeroVersao} — {v.arquivoUrl.split("/").pop()}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatarDataHora(v.dataUpload)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {entrega && (
                  <div>
                    <h3 className="mb-1 font-medium">Feedbacks</h3>
                    {feedbacks.length === 0 ? (
                      <p className="text-muted-foreground">Nenhum feedback ainda.</p>
                    ) : (
                      <ul className="space-y-2">
                        {feedbacks.map((f) => (
                          <li key={f.id} className="rounded-md bg-muted/50 p-3">
                            <p>{f.comentario}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {f.autorNome} · {formatarDataHora(f.data)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function TccPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <Painel params={params} />
    </Suspense>
  );
}
