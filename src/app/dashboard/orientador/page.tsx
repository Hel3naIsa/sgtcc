import { ListaTccs } from "../_components/lista-tccs";
import { PerfilEnum } from "@/types";

export const metadata = { title: "Orientandos — SGTCC" };

export default function Page() {
  return (
    <ListaTccs
      perfis={[PerfilEnum.ORIENTADOR]}
      titulo="Meus orientandos"
      descricao="TCCs sob a sua orientação."
    />
  );
}
