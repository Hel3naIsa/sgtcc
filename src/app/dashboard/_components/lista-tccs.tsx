import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireSessao } from "@/lib/auth/server-session";
import { listarTccsVisiveis } from "@/lib/data/queries";
import { ROTULO_STATUS_TCC } from "@/components/layout/status";
import type { PerfilEnum } from "@/types";

interface Props {
  /** Perfis autorizados nesta página; outros são redirecionados para a própria home. */
  perfis: PerfilEnum[];
  titulo: string;
  descricao: string;
}

async function Conteudo({ perfis, titulo, descricao }: Props) {
  const sessao = await requireSessao(...perfis);
  const tccs = await listarTccsVisiveis(sessao);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>

      {tccs.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum TCC encontrado para o seu perfil.
        </p>
      ) : (
        <ul className="grid gap-3">
          {tccs.map((t) => (
            <li key={t.id}>
              <Link href={`/dashboard/tcc/${t.id}`} className="block">
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="truncate font-medium">{t.titulo}</div>
                      <div className="text-xs text-muted-foreground">
                        Aluno: {t.alunoNome} · Orientador: {t.orientadorNome}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{ROTULO_STATUS_TCC[t.statusGeral] ?? t.statusGeral}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Página padrão por perfil: lista os TCCs que a sessão pode ver. */
export function ListaTccs(props: Props) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
      <Conteudo {...props} />
    </Suspense>
  );
}
