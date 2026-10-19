import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
        {/* Identidade Visual */}
        <div className="flex flex-col items-center space-y-3">
          <span className="p-3.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md">
            <GraduationCap className="h-10 w-10" />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">SGTCC</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sistema de Gestão de Trabalho de Conclusão de Curso
          </p>
        </div>

        {/* Ações Principais */}
        <div className="w-full space-y-3">
          <Link
            href="/login"
            className={buttonVariants({
              variant: "default",
              className: "w-full h-11 text-base font-semibold shadow-xs",
            })}
          >
            Entrar
          </Link>
          <Link
            href="/login?tab=cadastro"
            className={buttonVariants({
              variant: "outline",
              className: "w-full h-11 text-base font-semibold",
            })}
          >
            Cadastrar
          </Link>
        </div>

        {/* Rodapé Minimalista */}
        <p className="text-xs text-neutral-400 dark:text-neutral-600">
          Acesso institucional acadêmico
        </p>
      </div>
    </main>
  );
}
