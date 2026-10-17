import type { Firestore } from "firebase-admin/firestore";
import { PerfilEnum, type Usuario } from "@/types";

export interface UsuarioProfileStore {
  getByAuthUid(authUid: string): Promise<Usuario | null>;
}

export interface AuthenticatedPrincipal {
  uid: string;
  email?: string;
  nome?: string;
  perfil: PerfilEnum;
  usuario: PublicUsuario;
}

export type PublicUsuario = Omit<Usuario, "senhaHash">;

function parsePerfil(value: unknown): PerfilEnum | null {
  return Object.values(PerfilEnum).includes(value as PerfilEnum)
    ? (value as PerfilEnum)
    : null;
}

export function toPublicUsuario(usuario: Usuario): PublicUsuario {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    criadoEm: usuario.criadoEm,
  };
}

export function createFirestoreUsuarioProfileStore(
  db: Firestore,
): UsuarioProfileStore {
  return {
    async getByAuthUid(authUid) {
      // A associação documentada temporariamente é usuarios/{Firebase UID}.
      // Se o banco usar outra chave, somente este adaptador precisa ser alterado.
      const snapshot = await db.collection("usuarios").doc(authUid).get();

      if (!snapshot.exists) {
        return null;
      }

      const data = snapshot.data() ?? {};
      const perfil = parsePerfil(data.perfil);

      if (
        typeof data.nome !== "string" ||
        typeof data.email !== "string" ||
        !perfil
      ) {
        return null;
      }

      return {
        id: typeof data.id === "string" ? data.id : snapshot.id,
        nome: data.nome,
        email: data.email,
        perfil,
        criadoEm: data.criadoEm,
      };
    },
  };
}

export async function resolveAuthenticatedPrincipal(
  uid: string,
  email: string | undefined,
  profileStore: UsuarioProfileStore,
): Promise<AuthenticatedPrincipal | null> {
  const usuario = await profileStore.getByAuthUid(uid);

  if (!usuario) {
    return null;
  }

  return {
    uid,
    email,
    nome: usuario.nome,
    perfil: usuario.perfil,
    usuario: toPublicUsuario(usuario),
  };
}
