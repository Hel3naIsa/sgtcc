import { assertDocumentAccess } from "@/lib/auth/authorization";
import { createSignedDocumentUrl } from "@/lib/auth/document-storage";
import { toAuthErrorResponse } from "@/lib/auth/errors";
import {
  getDocumentAccessRecord,
  type DocumentAccessRecord,
} from "@/lib/auth/firestore-repository";
import { getAuthenticatedSession, type AuthenticatedSession } from "@/lib/auth/session";

export type DocumentRouteContext = { params: Promise<{ documentId: string }> };

export interface DocumentRouteDependencies {
  getSession(request: Request): Promise<AuthenticatedSession>;
  getDocument(
    documentId: string,
    session: AuthenticatedSession,
  ): Promise<DocumentAccessRecord | null>;
  createSignedUrl(fileUrl: string): Promise<{ url: string; expiresAt: string }>;
}

const defaultDependencies: DocumentRouteDependencies = {
  getSession: getAuthenticatedSession,
  getDocument: (documentId, session) => getDocumentAccessRecord(documentId, session),
  createSignedUrl: createSignedDocumentUrl,
};

export function createDocumentGetHandler(
  dependencies: DocumentRouteDependencies = defaultDependencies,
) {
  return async function handle(request: Request, context: DocumentRouteContext) {
    try {
      const { documentId } = await context.params;
      if (!documentId) {
        return Response.json(
          { error: "INVALID_REQUEST", message: "O identificador do documento é obrigatório." },
          { status: 400 },
        );
      }

      const session = await dependencies.getSession(request);
      const record = await dependencies.getDocument(documentId, session);

      if (!record) {
        return Response.json(
          { error: "NOT_FOUND", message: "Documento não encontrado." },
          { status: 404 },
        );
      }

      assertDocumentAccess(session, record.tcc, record.context);
      const signedDocument = await dependencies.createSignedUrl(record.arquivo.arquivoUrl);

      return Response.json({
        document: {
          id: record.arquivo.id,
          entrega_id: record.arquivo.entrega_id,
          url: signedDocument.url,
          expiresAt: signedDocument.expiresAt,
        },
      });
    } catch (error) {
      return toAuthErrorResponse(error);
    }
  };
}
