import { describe, expect, it } from "vitest";
import { PerfilEnum } from "@/types";
import { UnauthorizedError } from "@/lib/auth/errors";
import { createDocumentGetHandler } from "@/lib/auth/document-route-handler";

const context = { params: Promise.resolve({ documentId: "arquivo-001" }) };
const session = {
  uid: "uid-aluno",
  perfil: PerfilEnum.ALUNO,
  usuario: { id: "uid-aluno", nome: "Ana", email: "ana@instituicao.edu.br", perfil: PerfilEnum.ALUNO },
  token: {} as never,
};
const record = {
  tcc: {
    id: "tcc-001",
    titulo: "TCC",
    statusGeral: "EM_ANDAMENTO" as const,
    aluno_id: "20260001",
    orientador_id: "orientador-001",
  },
  context: { aluno: { matricula: "99999999", usuario_id: "uid-outro" } },
  entrega: {
    id: "entrega-001",
    status: "CONCLUIDA" as const,
    marco_id: "marco-001",
    tcc_id: "tcc-001",
  },
  arquivo: {
    id: "arquivo-001",
    numeroVersao: 1,
    arquivoUrl: "gs://sgtcc-projeto/documento.pdf",
    dataUpload: "2026-09-28",
    entrega_id: "entrega-001",
  },
};

describe("GET /api/documentos/[documentId]", () => {
  it("retorna HTTP 401 sem sessão", async () => {
    const handler = createDocumentGetHandler({
      getSession: async () => { throw new UnauthorizedError(); },
      getDocument: async () => null,
      createSignedUrl: async () => ({ url: "signed", expiresAt: "later" }),
    });

    const response = await handler(new Request("http://localhost/api/documentos/arquivo-001"), context);
    expect(response.status).toBe(401);
  });

  it("retorna HTTP 403 antes de gerar uma URL pública", async () => {
    let signedUrlRequested = false;
    const handler = createDocumentGetHandler({
      getSession: async () => session,
      getDocument: async () => record,
      createSignedUrl: async () => {
        signedUrlRequested = true;
        return { url: "signed", expiresAt: "later" };
      },
    });

    const response = await handler(new Request("http://localhost/api/documentos/arquivo-001"), context);
    expect(response.status).toBe(403);
    expect(signedUrlRequested).toBe(false);
  });
});
