import { ListaTccs } from "../_components/lista-tccs";
import { PerfilEnum } from "@/types";

export const metadata = { title: "Meu TCC — SGTCC" };

export default function Page() {
  return (
    <ListaTccs
      perfis={[PerfilEnum.ALUNO]}
      titulo="Meu TCC"
      descricao="Acompanhe marcos, prazos, versões enviadas e feedbacks."
    />
  );
}
