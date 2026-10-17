import { assertTccAccess } from "@/lib/auth/authorization";
import { toAuthErrorResponse } from "@/lib/auth/errors";
import { getTccAccessRecord, type TccAccessRecord } from "@/lib/auth/firestore-repository";
import { getAuthenticatedSession, type AuthenticatedSession } from "@/lib/auth/session";

export type TccRouteContext = { params: Promise<{ tccId: string }> };

export interface TccRouteDependencies {
  getSession(request: Request): Promise<AuthenticatedSession>;
  getTcc(tccId: string, session: AuthenticatedSession): Promise<TccAccessRecord | null>;
}

const defaultDependencies: TccRouteDependencies = {
  getSession: getAuthenticatedSession,
  getTcc: (tccId, session) => getTccAccessRecord(tccId, session),
};

export function createTccGetHandler(
  dependencies: TccRouteDependencies = defaultDependencies,
) {
  return async function handle(request: Request, context: TccRouteContext) {
    try {
      const { tccId } = await context.params;
      if (!tccId) {
        return Response.json(
          { error: "INVALID_REQUEST", message: "O identificador do TCC é obrigatório." },
          { status: 400 },
        );
      }

      const session = await dependencies.getSession(request);
      const record = await dependencies.getTcc(tccId, session);

      if (!record) {
        return Response.json(
          { error: "NOT_FOUND", message: "TCC não encontrado." },
          { status: 404 },
        );
      }

      assertTccAccess(session, record.tcc, record.context);
      return Response.json({ tcc: record.tcc });
    } catch (error) {
      return toAuthErrorResponse(error);
    }
  };
}
