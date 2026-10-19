import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthHttpError } from "@/lib/auth/errors";
import { getAuthenticatedSession, type AuthenticatedSession } from "@/lib/auth/session";
import { homeDoPerfil } from "@/lib/auth/perfis";
import type { PerfilEnum } from "@/types";

/**
 * Sessão para Server Components. Reaproveita `getAuthenticatedSession` (que lê o
 * cookie `sgtcc_session` de um Request) montando um Request só com o cookie atual.
 * Retorna null se não há sessão válida; erros de infraestrutura (503) sobem.
 * `cache` evita validar o mesmo cookie várias vezes na mesma requisição.
 */
export const getSessaoServidor = cache(async (): Promise<AuthenticatedSession | null> => {
  const cookie = (await headers()).get("cookie") ?? "";
  try {
    return await getAuthenticatedSession(new Request("http://localhost/", { headers: { cookie } }));
  } catch {
    // Qualquer falha ao recuperar sessão em server component significa ausência de sessão válida.
    return null;
  }
});

/**
 * Exige sessão válida (e, opcionalmente, um dos perfis informados).
 * Sem sessão → /login. Perfil errado → home do perfil do usuário.
 */
export async function requireSessao(...perfisPermitidos: PerfilEnum[]): Promise<AuthenticatedSession> {
  const sessao = await getSessaoServidor();
  if (!sessao) redirect("/login");
  if (perfisPermitidos.length && !perfisPermitidos.includes(sessao.perfil)) {
    redirect(homeDoPerfil(sessao.perfil));
  }
  return sessao;
}
