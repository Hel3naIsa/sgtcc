import { randomBytes, timingSafeEqual } from "node:crypto";

export const CSRF_COOKIE_NAME = "sgtcc_csrf";

function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    if (separator === -1) continue;

    const key = cookie.slice(0, separator);
    if (key === name) {
      return decodeURIComponent(cookie.slice(separator + 1));
    }
  }

  return undefined;
}

export function createCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (origin !== new URL(request.url).origin) {
        return false;
      }
    } catch {
      return false;
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin" || fetchSite === "same-site";
}

export function hasValidCsrfToken(request: Request): boolean {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieToken = getCookie(request, CSRF_COOKIE_NAME);

  if (!headerToken || !cookieToken || headerToken.length !== cookieToken.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken));
}

export function csrfCookieOptions() {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 15,
  };
}
