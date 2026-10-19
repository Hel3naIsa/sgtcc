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
      const [{ signOut }, { auth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/config"),
      ]);
      await signOut(auth);
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={sair}
      disabled={saindo}
      className="w-full text-xs border-[#243558] text-white/90 bg-transparent hover:bg-[#1a2a4a] hover:text-white flex items-center justify-center gap-1.5"
    >
      <LogOut className="h-3.5 w-3.5" /> Sair da Conta
    </Button>
  );
}
