import { NextResponse } from "next/server";
import { createCsrfToken, csrfCookieOptions, CSRF_COOKIE_NAME } from "@/lib/auth/csrf";

export async function GET() {
  const token = createCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(CSRF_COOKIE_NAME, token, csrfCookieOptions());
  return response;
}
