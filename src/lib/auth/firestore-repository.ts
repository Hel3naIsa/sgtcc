import type { Firestore, QuerySnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type {
  Aluno,
  Entrega,
  ProfessorAvaliador,
  ProfessorOrientador,
  TCC,
  VersaoArquivo,
} from "@/types";
import type { AuthenticatedSession } from "@/lib/auth/session";
import type { TccAccessContext } from "@/lib/auth/authorization";

export interface TccAccessRecord {
  tcc: TCC;
  context: TccAccessContext;
}

export interface DocumentAccessRecord extends TccAccessRecord {
  arquivo: VersaoArquivo;
  entrega: Entrega;
}

function requireDb(db: Firestore | null = adminDb): Firestore {
  if (!db) {
    throw new Error("Firestore Admin não está configurado.");
  }
  return db;
}

function firstData<T>(snapshot: QuerySnapshot): T | undefined {
  const document = snapshot.docs[0];
  return document ? ({ id: document.id, ...document.data() } as T) : undefined;
}

async function findByUsuarioId<T>(
  db: Firestore,
  collection: string,
  usuarioId: string,
): Promise<T | undefined> {
  const snapshot = await db
    .collection(collection)
    .where("usuario_id", "==", usuarioId)
    .limit(1)
    .get();

  return firstData<T>(snapshot);
}

async function createAccessContext(
  db: Firestore,
  session: AuthenticatedSession,
  tcc: TCC,
): Promise<TccAccessContext> {
  const aluno = await findByUsuarioId<Aluno>(db, "alunos", session.usuario.id);
  const orientador = await findByUsuarioId<ProfessorOrientador>(
    db,
    "professores_orientadores",
    session.usuario.id,
  );
  const avaliador = await findByUsuarioId<ProfessorAvaliador>(
    db,
    "professores_avaliadores",
    session.usuario.id,
  );

  let avaliadorVinculado = false;
  if (avaliador) {
    const banca = await db
      .collection("bancas_avaliacao")
      .where("tcc_id", "==", tcc.id)
      .where("avaliador_id", "==", avaliador.id)
      .limit(1)
      .get();
    avaliadorVinculado = !banca.empty;
  }

  return { aluno, orientador, avaliadorVinculado };
}

export async function getTccAccessRecord(
  tccId: string,
  session: AuthenticatedSession,
  db: Firestore | null = adminDb,
): Promise<TccAccessRecord | null> {
  const firestore = requireDb(db);
  const snapshot = await firestore.collection("tccs").doc(tccId).get();

  if (!snapshot.exists) {
    return null;
  }

  const tcc = { id: snapshot.id, ...snapshot.data() } as TCC;
  const context = await createAccessContext(firestore, session, tcc);
  return { tcc, context };
}

export async function getDocumentAccessRecord(
  documentId: string,
  session: AuthenticatedSession,
  db: Firestore | null = adminDb,
): Promise<DocumentAccessRecord | null> {
  const firestore = requireDb(db);
  const arquivoSnapshot = await firestore
    .collection("versoes_arquivo")
    .doc(documentId)
    .get();

  if (!arquivoSnapshot.exists) {
    return null;
  }

  const arquivo = { id: arquivoSnapshot.id, ...arquivoSnapshot.data() } as VersaoArquivo;
  const entregaSnapshot = await firestore.collection("entregas").doc(arquivo.entrega_id).get();

  if (!entregaSnapshot.exists) {
    return null;
  }

  const entrega = { id: entregaSnapshot.id, ...entregaSnapshot.data() } as Entrega;
  const tccRecord = await getTccAccessRecord(entrega.tcc_id, session, firestore);

  if (!tccRecord) {
    return null;
  }

  return { ...tccRecord, arquivo, entrega };
}
