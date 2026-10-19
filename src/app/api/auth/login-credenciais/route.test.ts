import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

describe("POST /api/auth/login-credenciais (US01 AC1)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "mock-api-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna HTTP 401 com mensagem exata quando credenciais estão vazias", async () => {
    const request = new Request("http://localhost/api/auth/login-credenciais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "", password: "" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.message).toBe("Credenciais inválidas ou usuário não encontrado.");
  });

  it("retorna HTTP 401 com mensagem exata quando credenciais são inválidas", async () => {
    // Simula resposta de erro da API do Firebase Identity Toolkit
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: "EMAIL_NOT_FOUND" },
      }),
    } as Response);

    const request = new Request("http://localhost/api/auth/login-credenciais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "usuario.inexistente@teste.com", password: "senha-incorreta" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.message).toBe("Credenciais inválidas ou usuário não encontrado.");
  });
});
