import { describe, expect, it } from "vitest";
import { PerfilEnum, type TCC } from "@/types";
import { assertTccAccess } from "@/lib/auth/authorization";
import { ForbiddenError } from "@/lib/auth/errors";

const tcc: TCC = {
  id: "tcc-001",
  titulo: "TCC de teste",
  statusGeral: "EM_ANDAMENTO",
  aluno_id: "20260001",
  orientador_id: "orientador-001",
};

const session = (perfil: PerfilEnum) => ({ perfil });

describe("autorização de TCC", () => {
  it("permite que o aluno acesse o próprio TCC", () => {
    expect(() =>
      assertTccAccess(session(PerfilEnum.ALUNO), tcc, {
        aluno: { matricula: "20260001", usuario_id: "uid-aluno" },
      }),
    ).not.toThrow();
  });

  it("bloqueia aluno sem vínculo com HTTP 403 na camada de domínio", () => {
    expect(() =>
      assertTccAccess(session(PerfilEnum.ALUNO), tcc, {
        aluno: { matricula: "99999999", usuario_id: "uid-outro" },
      }),
    ).toThrowError(ForbiddenError);
  });

  it("permite orientador vinculado e avaliador da banca", () => {
    expect(() =>
      assertTccAccess(session(PerfilEnum.ORIENTADOR), tcc, {
        orientador: { id: "orientador-001", usuario_id: "uid-orientador" },
      }),
    ).not.toThrow();

    expect(() =>
      assertTccAccess(session(PerfilEnum.AVALIADOR), tcc, {
        avaliadorVinculado: true,
      }),
    ).not.toThrow();
  });

  it("permite acesso administrativo e bloqueia avaliador sem banca", () => {
    expect(() => assertTccAccess(session(PerfilEnum.ADMIN), tcc, {})).not.toThrow();
    expect(() => assertTccAccess(session(PerfilEnum.COORDENACAO), tcc, {})).not.toThrow();
    expect(() =>
      assertTccAccess(session(PerfilEnum.AVALIADOR), tcc, {
        avaliadorVinculado: false,
      }),
    ).toThrowError(ForbiddenError);
  });
});
