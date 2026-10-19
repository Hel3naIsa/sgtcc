import { redirect } from "next/navigation";
import { getSessaoServidor } from "@/lib/auth/server-session";
import { destinoSeguro, homeDoPerfil } from "@/lib/auth/perfis";
import { LoginForm } from "./login-form";

export const metadata = { title: "Acesse sua conta — SGTCC" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tab?: string }>;
}) {
  const { next, tab } = await searchParams;
  let sessao = null;
  try {
    sessao = await getSessaoServidor();
  } catch {
    sessao = null;
  }
  const destino = destinoSeguro(next);
  if (sessao) redirect(destino ?? homeDoPerfil(sessao.perfil));

  return <LoginForm destino={destino ?? "/dashboard"} initialTab={tab === "cadastro" ? "cadastro" : "login"} />;
}
