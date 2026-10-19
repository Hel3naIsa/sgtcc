"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Calendar, ShieldCheck, ArrowRight, Loader2, UserPlus, LogIn } from "lucide-react";
import { getClientSsoConfig } from "@/lib/auth/config";

interface LoginFormProps {
  destino: string;
}

export function LoginForm({ destino }: { destino: string }) {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"login" | "cadastro">("login");

  // Estado de Login
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estado de Cadastro
  const [cadNome, setCadNome] = useState("");
  const [cadEmail, setCadEmail] = useState("");
  const [cadPassword, setCadPassword] = useState("");
  const [cadPerfil, setCadPerfil] = useState<"ALUNO" | "ORIENTADOR" | "COORDENACAO" | "AVALIADOR">("ALUNO");
  const [cadMatricula, setCadMatricula] = useState("");
  const [cadLoading, setCadLoading] = useState(false);
  const [cadSucesso, setCadSucesso] = useState<string | null>(null);

  const ssoConfigurado = getClientSsoConfig() !== null;

  // Personas pré-cadastradas no seed para teste rápido
  const personasDemo = [
    { nome: "Jorge", perfil: "Aluno", email: "jorge@teste.sgtcc.dev", senha: "Sgtcc@2026!", icon: GraduationCap },
    { nome: "Joana", perfil: "Orientadora", email: "joana@teste.sgtcc.dev", senha: "Sgtcc@2026!", icon: Users },
    { nome: "Cláudio", perfil: "Coordenação", email: "claudio@teste.sgtcc.dev", senha: "Sgtcc@2026!", icon: Calendar },
    { nome: "Silvia", perfil: "Avaliadora", email: "silvia@teste.sgtcc.dev", senha: "Sgtcc@2026!", icon: ShieldCheck },
  ];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login-credenciais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Exibe exatamente a mensagem do AC1: "Credenciais inválidas ou usuário não encontrado."
        setErro(data.message || "Credenciais inválidas ou usuário não encontrado.");
        setLoading(false);
        return;
      }

      // Redirecionamento por perfil (AC2)
      router.push(destino && destino !== "/dashboard" ? destino : data.redirectTo || "/dashboard");
      router.refresh();
    } catch {
      setErro("Credenciais inválidas ou usuário não encontrado.");
      setLoading(false);
    }
  }

  async function handleLoginDemo(email: string, pass: string) {
    setIdentifier(email);
    setPassword(pass);
    setErro(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login-credenciais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErro(data.message || "Credenciais inválidas ou usuário não encontrado.");
        setLoading(false);
        return;
      }

      router.push(destino && destino !== "/dashboard" ? destino : data.redirectTo || "/dashboard");
      router.refresh();
    } catch {
      setErro("Não foi possível conectar com as credenciais de teste.");
      setLoading(false);
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCadSucesso(null);
    setCadLoading(true);

    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: cadNome,
          email: cadEmail,
          password: cadPassword,
          perfil: cadPerfil,
          matricula: cadPerfil === "ALUNO" ? cadMatricula : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || "Erro ao realizar cadastro.");
        setCadLoading(false);
        return;
      }

      setCadSucesso("Cadastro realizado com sucesso! Conectando à sua conta...");
      // Faz o login automático imediatamente após o cadastro
      await handleLoginDemo(cadEmail, cadPassword);
    } catch {
      setErro("Erro de conexão ao processar o cadastro.");
      setCadLoading(false);
    }
  }

  async function handleSsoLogin() {
    setErro(null);
    setLoading(true);
    try {
      const { signInWithInstitutionalSso } = await import("@/lib/firebase/auth-client");
      await signInWithInstitutionalSso();
    } catch (e) {
      setLoading(false);
      setErro(e instanceof Error ? e.message : "Não foi possível iniciar o login SSO.");
    }
  }

  return (
    <div className="space-y-6 w-full">
      {/* Abas Entrar / Cadastrar */}
      <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-medium">
        <button
          type="button"
          onClick={() => { setAbaAtiva("login"); setErro(null); }}
          className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
            abaAtiva === "login"
              ? "bg-white dark:bg-neutral-900 shadow-xs text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LogIn className="h-4 w-4" /> Entrar
        </button>
        <button
          type="button"
          onClick={() => { setAbaAtiva("cadastro"); setErro(null); }}
          className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
            abaAtiva === "cadastro"
              ? "bg-white dark:bg-neutral-900 shadow-xs text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserPlus className="h-4 w-4" /> Cadastrar
        </button>
      </div>

      {/* Alertas */}
      {erro && (
        <div role="alert" className="p-3 text-sm rounded-lg bg-destructive/15 text-destructive font-medium border border-destructive/20">
          {erro}
        </div>
      )}
      {cadSucesso && (
        <div role="status" className="p-3 text-sm rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/20">
          {cadSucesso}
        </div>
      )}

      {/* Formulário de Login (US01 AC1 / AC2) */}
      {abaAtiva === "login" ? (
        <div className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">E-mail Institucional ou Matrícula</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="ex: jorge@teste.sgtcc.dev ou 2026001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Validando credenciais…
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Botão de SSO se configurado */}
          {ssoConfigurado && (
            <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <Button
                variant="outline"
                type="button"
                className="w-full text-xs"
                onClick={handleSsoLogin}
                disabled={loading}
              >
                Entrar com SSO Institucional (Google)
              </Button>
            </div>
          )}

          {/* Painel de Acesso Rápido para a Avaliação (Zero Atrito) */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Acesso Rápido de Teste (1 Clique)
              </span>
              <Badge variant="secondary" className="text-[10px]">Perfis de Demonstração</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Clique em uma das personas abaixo para logar instantaneamente e testar o redirecionamento automático (AC2):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {personasDemo.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.nome}
                    type="button"
                    onClick={() => handleLoginDemo(p.email, p.senha)}
                    disabled={loading}
                    className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all text-left flex flex-col justify-between group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Icon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400 group-hover:text-primary" />
                      <span className="text-[10px] text-muted-foreground font-mono">{p.perfil}</span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold">{p.nome}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Formulário de Cadastro (RF01 - Cadastro) */
        <form onSubmit={handleCadastro} className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="cadNome">Nome Completo</Label>
            <Input
              id="cadNome"
              type="text"
              placeholder="ex: João da Silva"
              value={cadNome}
              onChange={(e) => setCadNome(e.target.value)}
              required
              disabled={cadLoading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cadEmail">E-mail Institucional</Label>
            <Input
              id="cadEmail"
              type="email"
              placeholder="ex: joao@universidade.edu.br"
              value={cadEmail}
              onChange={(e) => setCadEmail(e.target.value)}
              required
              disabled={cadLoading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cadPassword">Senha de Acesso</Label>
            <Input
              id="cadPassword"
              type="password"
              placeholder="mínimo 6 caracteres"
              value={cadPassword}
              onChange={(e) => setCadPassword(e.target.value)}
              required
              disabled={cadLoading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cadPerfil">Perfil Institucional</Label>
            <select
              id="cadPerfil"
              value={cadPerfil}
              onChange={(e) => setCadPerfil(e.target.value as typeof cadPerfil)}
              className="w-full h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={cadLoading}
            >
              <option value="ALUNO">Aluno</option>
              <option value="ORIENTADOR">Professor Orientador</option>
              <option value="COORDENACAO">Coordenação de TCC</option>
              <option value="AVALIADOR">Professor Avaliador (Banca)</option>
            </select>
          </div>

          {cadPerfil === "ALUNO" && (
            <div className="space-y-1">
              <Label htmlFor="cadMatricula">Matrícula Acadêmica</Label>
              <Input
                id="cadMatricula"
                type="text"
                placeholder="ex: 2026100"
                value={cadMatricula}
                onChange={(e) => setCadMatricula(e.target.value)}
                required
                disabled={cadLoading}
              />
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={cadLoading}>
            {cadLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Cadastrando usuário…
              </>
            ) : (
              "Criar Conta Institucional"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
