"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getClientSsoConfig } from "@/lib/auth/config";

/**
 * Fluxo SSO (US01/RF01): o botão redireciona ao provedor institucional; ao voltar,
 * `getRedirectResult` devolve a credencial, que é trocada por sessão no servidor.
 * O SDK do Firebase é importado dinamicamente para só rodar no navegador.
 */
export function LoginSso({ destino }: { destino: string }) {
  const router = useRouter();
  const configurado = getClientSsoConfig() !== null;
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const rodou = useRef(false);

  useEffect(() => {
    if (!configurado || rodou.current) return;
    rodou.current = true;
    (async () => {
      try {
        const { getInstitutionalSsoResult, createServerSession } = await import("@/lib/firebase/auth-client");
        const credencial = await getInstitutionalSsoResult();
        if (!credencial) return; // abriu /login normalmente, sem voltar de um redirect
        setProcessando(true);
        await createServerSession(credencial);
        router.replace(destino);
        router.refresh();
      } catch (e) {
        setProcessando(false);
        setErro(
          e instanceof Error
            ? `${e.message} Se o problema persistir, confirme com a coordenação se o seu perfil está cadastrado.`
            : "Não foi possível entrar.",
        );
      }
    })();
  }, [configurado, destino, router]);

  async function entrar() {
    setErro(null);
    setProcessando(true);
    try {
      const { signInWithInstitutionalSso } = await import("@/lib/firebase/auth-client");
      await signInWithInstitutionalSso(); // redireciona para o provedor
    } catch (e) {
      setProcessando(false);
      setErro(e instanceof Error ? e.message : "Não foi possível iniciar o login.");
    }
  }

  if (!configurado) {
    return (
      <p role="status" className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        O SSO institucional ainda não foi configurado. Defina{" "}
        <code className="font-mono">NEXT_PUBLIC_FIREBASE_AUTH_PROVIDER_ID</code> no <code className="font-mono">.env.local</code>{" "}
        (veja <code className="font-mono">docs/auth-integration.md</code>).
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={entrar} disabled={processando}>
        {processando ? "Entrando…" : "Entrar com SSO institucional"}
      </Button>
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
