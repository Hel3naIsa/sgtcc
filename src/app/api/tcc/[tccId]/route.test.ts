import { describe, expect, it } from "vitest";
import { PerfilEnum } from "@/types";
import { UnauthorizedError } from "@/lib/auth/errors";
import { createTccGetHandler } from "@/lib/auth/tcc-route-handler";

const context = { params: Promise.resolve({ tccId: "tcc-001" }) };
const tcc = {
  id: "tcc-001",
  titulo: "TCC de teste",
  statusGeral: "EM_ANDAMENTO" as const,
  aluno_id: "20260001",
  orientador_id: "orientador-001",
};

describe("GET /api/tcc/[tccId]", () => {
  it("retorna HTTP 401 quando não há sessão", async () => {
    const handler = createTccGetHandler({
      getSession: async () => {
        throw new UnauthorizedError();
      },
      getTcc: async () => null,
    });

    const response = await handler(new Request("http://localhost/api/tcc/tcc-001"), context);
    expect(response.status).toBe(401);
  });

  it("retorna HTTP 403 quando há sessão sem vínculo", async () => {
    const handler = createTccGetHandler({
      getSession: async () => ({
        uid: "uid-outro",
        perfil: PerfilEnum.ALUNO,
        usuario: { id: "uid-outro", nome: "Outro", email: "outro@instituicao.edu.br", perfil: PerfilEnum.ALUNO },
        token: {} as never,
      }),
      getTcc: async () => ({
        tcc,
        context: { aluno: { matricula: "99999999", usuario_id: "uid-outro" } },
      }),
    });

    const response = await handler(new Request("http://localhost/api/tcc/tcc-001"), context);
    expect(response.status).toBe(403);
  });
});
