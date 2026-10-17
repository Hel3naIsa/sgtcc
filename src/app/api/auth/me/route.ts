import { getAuthenticatedSession } from "@/lib/auth/session";
import { toAuthErrorResponse } from "@/lib/auth/errors";

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession(request);
    return Response.json({
      user: {
        uid: session.uid,
        email: session.email,
        nome: session.nome,
        perfil: session.perfil,
        usuario: session.usuario,
      },
    });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
