import { ListaTccs } from "../_components/lista-tccs";
import { PerfilEnum } from "@/types";

export const metadata = { title: "Bancas — SGTCC" };

export default function Page() {
  return (
    <ListaTccs
      perfis={[PerfilEnum.AVALIADOR]}
      titulo="TCCs da minha banca"
      descricao="Trabalhos em que você participa como avaliador."
    />
  );
}
