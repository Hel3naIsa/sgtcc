import { NextResponse } from "next/server";
import { hasValidCsrfToken, isSameOriginRequest } from "@/lib/auth/csrf";
import { getServerSsoConfig } from "@/lib/auth/config";
import {
  AuthHttpError,
  ForbiddenError,
  toAuthErrorResponse,
} from "@/lib/auth/errors";
import {
  createSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifyInstitutionalIdToken,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request) || !hasValidCsrfToken(request)) {
    return new Response(
      JSON.stringify({ error: "CSRF_INVALID", message: "Requisição não autorizada." }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  }

  if (!getServerSsoConfig()) {
    return toAuthErrorResponse(new AuthHttpError(
      503,
      "SSO_NOT_CONFIGURED",
      "O SSO institucional ainda não foi configurado.",
    ));
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return toAuthErrorResponse(new AuthHttpError(
      400,
      "INVALID_REQUEST",
      "O corpo da requisição deve ser JSON válido.",
    ));
  }

  const idToken =
    typeof body === "object" && body !== null && "idToken" in body &&
    typeof body.idToken === "string"
      ? body.idToken
      : undefined;

  if (!idToken) {
    return toAuthErrorResponse(new AuthHttpError(
      400,
      "INVALID_REQUEST",
      "O ID token institucional é obrigatório.",
    ));
  }

  try {
    const authenticatedSession = await verifyInstitutionalIdToken(idToken);
    const sessionCookie = await createSessionCookie(idToken);
    const response = NextResponse.json({
      user: {
        uid: authenticatedSession.uid,
        email: authenticatedSession.email,
        nome: authenticatedSession.nome,
        perfil: authenticatedSession.perfil,
        usuario: authenticatedSession.usuario,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return toAuthErrorResponse(error);
    }
    return toAuthErrorResponse(error);
  }
}
