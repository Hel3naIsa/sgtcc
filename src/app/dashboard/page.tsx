import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireSessao } from "@/lib/auth/server-session";
import { homeDoPerfil } from "@/lib/auth/perfis";

/** /dashboard → home do perfil logado (RF01). */
async function Redirecionar() {
  const sessao = await requireSessao();
  return redirect(homeDoPerfil(sessao.perfil));
}

export default function DashboardIndex() {
  return (
    <Suspense>
      <Redirecionar />
    </Suspense>
  );
}
