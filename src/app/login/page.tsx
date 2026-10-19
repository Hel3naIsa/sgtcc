import { destinoSeguro } from "@/lib/auth/perfis";
import { LoginForm } from "./login-form";

export const metadata = { title: "Acesse sua conta — SGTCC" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tab?: string }>;
}) {
  const { next, tab } = await searchParams;
  const destino = destinoSeguro(next) ?? "/dashboard";

  return <LoginForm destino={destino} initialTab={tab === "cadastro" ? "cadastro" : "login"} />;
}
