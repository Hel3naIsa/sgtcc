"use client";

import {
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithRedirect,
  type AuthProvider,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getClientSsoConfig } from "@/lib/auth/config";

export class InstitutionalSsoNotConfiguredError extends Error {
  constructor() {
    super("O SSO institucional ainda não foi configurado.");
    this.name = "InstitutionalSsoNotConfiguredError";
  }
}

function createProvider(providerId: string): AuthProvider {
  if (providerId === "google.com") {
    return new GoogleAuthProvider();
  }

  return new OAuthProvider(providerId);
}

export function hasInstitutionalSsoProvider(): boolean {
  return getClientSsoConfig() !== null;
}

export async function signInWithInstitutionalSso(): Promise<void> {
  const config = getClientSsoConfig();
  if (!config) {
    throw new InstitutionalSsoNotConfiguredError();
  }

  await signInWithRedirect(auth, createProvider(config.providerId));
}

export async function getInstitutionalSsoResult(): Promise<UserCredential | null> {
  return getRedirectResult(auth);
}

export async function createServerSession(credential: UserCredential): Promise<void> {
  const csrfResponse = await fetch("/api/auth/csrf", {
    credentials: "same-origin",
  });
  const csrfPayload = (await csrfResponse.json()) as { csrfToken?: string };

  if (!csrfResponse.ok || !csrfPayload.csrfToken) {
    throw new Error("Não foi possível preparar a sessão segura.");
  }

  const idToken = await credential.user.getIdToken();
  const sessionResponse = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfPayload.csrfToken,
    },
    body: JSON.stringify({ idToken }),
  });

  if (!sessionResponse.ok) {
    throw new Error("Não foi possível criar a sessão institucional.");
  }
}
