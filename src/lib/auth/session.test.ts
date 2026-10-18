import { beforeEach, describe, expect, it } from "vitest";
import { PerfilEnum, type Usuario } from "@/types";
import { SsoNotConfiguredError, ForbiddenError } from "@/lib/auth/errors";
import {
  verifyInstitutionalIdToken,
  type SessionAuthGateway,
} from "@/lib/auth/session";

const usuario: Usuario = {
  id: "uid-aluno-001",
  nome: "Ana Souza",
  email: "ana.souza@instituicao.edu.br",
  perfil: PerfilEnum.ALUNO,
};

const decodedToken = {
  uid: "uid-aluno-001",
  email: usuario.email,
  email_verified: true,
  firebase: { sign_in_provider: "oidc.instituicao" },
};

const authGateway: SessionAuthGateway = {
  verifyIdToken: async () => decodedToken as never,
  verifySessionCookie: async () => decodedToken as never,
  createSessionCookie: async () => "session-cookie",
};

describe("autenticação institucional", () => {
  beforeEach(() => {
    process.env.FIREBASE_AUTH_PROVIDER_ID = "oidc.instituicao";
    process.env.FIREBASE_INSTITUTIONAL_EMAIL_DOMAIN = "instituicao.edu.br";
  });

  it("falha de forma segura sem provider SSO configurado", async () => {
    delete process.env.FIREBASE_AUTH_PROVIDER_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_PROVIDER_ID;

    await expect(
      verifyInstitutionalIdToken("id-token", {
        auth: authGateway,
        profileStore: { getByAuthUid: async () => usuario },
      }),
    ).rejects.toBeInstanceOf(SsoNotConfiguredError);
  });

  it("rejeita token de provider diferente do institucional", async () => {
    const wrongProviderAuth: SessionAuthGateway = {
      ...authGateway,
      verifyIdToken: async () => ({
        ...decodedToken,
        firebase: { sign_in_provider: "password" },
      }) as never,
    };

    await expect(
      verifyInstitutionalIdToken("id-token", {
        auth: wrongProviderAuth,
        profileStore: { getByAuthUid: async () => usuario },
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("valida identidade e resolve o perfil no servidor", async () => {
    const session = await verifyInstitutionalIdToken("id-token", {
      auth: authGateway,
      profileStore: { getByAuthUid: async () => usuario },
    });

    expect(session.uid).toBe("uid-aluno-001");
    expect(session.perfil).toBe(PerfilEnum.ALUNO);
  });
});
