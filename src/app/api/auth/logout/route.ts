import { NextResponse } from "next/server";
import { hasValidCsrfToken, isSameOriginRequest } from "@/lib/auth/csrf";
import { CSRF_COOKIE_NAME } from "@/lib/auth/csrf";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request) || !hasValidCsrfToken(request)) {
    return new Response(
      JSON.stringify({ error: "CSRF_INVALID", message: "Requisição não autorizada." }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
