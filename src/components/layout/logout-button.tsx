"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    try {
      // A rota de logout exige o token CSRF (double submit) emitido por /api/auth/csrf.
      const { csrfToken } = (await (await fetch("/api/auth/csrf", { credentials: "same-origin" })).json()) as {
        csrfToken: string;
      };
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "X-CSRF-Token": csrfToken },
      });
      // Encerra também a sessão local do SDK do Firebase (import dinâmico: só no navegador).
      const [{ signOut }, { auth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/config"),
      ]);
      await signOut(auth);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={sair} disabled={saindo}>
      <LogOut /> Sair
    </Button>
  );
}
