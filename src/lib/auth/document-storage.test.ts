import { describe, expect, it } from "vitest";
import { getFirebaseStoragePath } from "@/lib/auth/document-storage";

describe("armazenamento protegido de documentos", () => {
  it("extrai o caminho de um URI gs://", () => {
    expect(
      getFirebaseStoragePath("gs://sgtcc-projeto/documentos/tcc-001/v1.pdf", "sgtcc-projeto"),
    ).toBe("documentos/tcc-001/v1.pdf");
  });

  it("extrai o caminho de uma URL Firebase Storage", () => {
    expect(
      getFirebaseStoragePath(
        "https://firebasestorage.googleapis.com/v0/b/sgtcc-projeto/o/documentos%2Ftcc-001%2Fv1.pdf?alt=media",
        "sgtcc-projeto",
      ),
    ).toBe("documentos/tcc-001/v1.pdf");
  });

  it("rejeita URL que não pertence ao Storage Firebase configurado", () => {
    expect(() =>
      getFirebaseStoragePath("https://example.com/documento.pdf", "sgtcc-projeto"),
    ).toThrow();
  });
});
