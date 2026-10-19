import { ListaTccs } from "../_components/lista-tccs";
import { PerfilEnum } from "@/types";

export const metadata = { title: "Coordenação — SGTCC" };

export default function Page() {
  return (
    <ListaTccs
      perfis={[PerfilEnum.COORDENACAO, PerfilEnum.ADMIN]}
      titulo="Todos os TCCs"
      descricao="Visão geral de todos os trabalhos do semestre."
    />
  );
}
