import { Suspense } from "react";
import { requireSessao } from "@/lib/auth/server-session";
import { CalendarioClient } from "./calendario-client";

export const metadata = { title: "Calendário Acadêmico — SGTCC" };
export const dynamic = "force-dynamic";

async function ConteudoCalendario() {
  await requireSessao();
  return <CalendarioClient />;
}

export default function CalendarioPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[#f4f5f7]" />}>
      <ConteudoCalendario />
    </Suspense>
  );
}
