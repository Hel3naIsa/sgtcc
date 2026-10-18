import { describe, expect, it } from "vitest";
import { PerfilEnum, type Usuario } from "@/types";
import { resolveAuthenticatedPrincipal } from "@/lib/auth/profile";

const usuario: Usuario = {
  id: "uid-aluno-001",
  nome: "Ana Souza",
  email: "ana.souza@instituicao.edu.br",
  perfil: PerfilEnum.ALUNO,
  senhaHash: "não deve ser exposta",
};

describe("resolução de perfil", () => {
  it("resolve o perfil a partir do repositório confiável do servidor", async () => {
    const principal = await resolveAuthenticatedPrincipal(
      "uid-aluno-001",
      usuario.email,
      { getByAuthUid: async () => usuario },
    );

    expect(principal?.perfil).toBe(PerfilEnum.ALUNO);
    expect(principal?.usuario).not.toHaveProperty("senhaHash");
  });

  it("não cria um perfil quando o usuário não está cadastrado", async () => {
    const principal = await resolveAuthenticatedPrincipal(
      "uid-inexistente",
      undefined,
      { getByAuthUid: async () => null },
    );

    expect(principal).toBeNull();
  });
});
