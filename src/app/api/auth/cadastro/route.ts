import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { homeDoPerfil } from "@/lib/auth/perfis";
import type { PerfilEnum } from "@/types";

export async function POST(request: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json(
      { error: "CONFIG_ERROR", message: "Serviço Firebase Admin indisponível." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const { nome, email, password, perfil, matricula } =
    (body as {
      nome?: string;
      email?: string;
      password?: string;
      perfil?: PerfilEnum;
      matricula?: string;
    }) ?? {};

  if (!nome || !email || !password || !perfil) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", message: "Preencha todos os campos obrigatórios." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "WEAK_PASSWORD", message: "A senha deve conter no mínimo 6 caracteres." },
      { status: 400 },
    );
  }

  const perfisValidos = ["ALUNO", "ORIENTADOR", "COORDENACAO", "AVALIADOR", "ADMIN"];
  if (!perfisValidos.includes(perfil)) {
    return NextResponse.json(
      { error: "INVALID_ROLE", message: "Perfil institucional inválido." },
      { status: 400 },
    );
  }

  try {
    // 1. Cria usuário no Firebase Auth
    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({
        email: email.trim().toLowerCase(),
        password,
        displayName: nome.trim(),
        emailVerified: true,
      });
      uid = userRecord.uid;
    } catch (authError: unknown) {
      const err = authError as { code?: string; message?: string };
      if (err.code === "auth/email-already-exists") {
        return NextResponse.json(
          { error: "EMAIL_EXISTS", message: "Este e-mail institucional já está cadastrado." },
          { status: 409 },
        );
      }
      throw authError;
    }

    // 2. Define Custom Claims
    const matFinal = matricula?.trim() || (perfil === "ALUNO" ? `MAT-${Date.now().toString().slice(-6)}` : undefined);
    await adminAuth.setCustomUserClaims(uid, {
      perfil,
      ...(matFinal && { matricula: matFinal }),
    });

    // 3. Salva documento na coleção usuarios
    await adminDb.collection("usuarios").doc(uid).set({
      id: uid,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      perfil,
    });

    // 4. Salva registro na tabela do papel específico (conforme diagrama ER)
    if (perfil === "ALUNO" && matFinal) {
      await adminDb.collection("alunos").doc(matFinal).set({
        matricula: matFinal,
        usuario_id: uid,
      });
    } else if (perfil === "ORIENTADOR") {
      await adminDb.collection("professores_orientadores").doc(uid).set({
        id: uid,
        usuario_id: uid,
      });
    } else if (perfil === "AVALIADOR") {
      await adminDb.collection("professores_avaliadores").doc(uid).set({
        id: uid,
        usuario_id: uid,
      });
    } else if (perfil === "COORDENACAO") {
      await adminDb.collection("coordenadores").doc(uid).set({
        id: uid,
        usuario_id: uid,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cadastro institucional realizado com sucesso!",
      user: {
        uid,
        email: email.trim().toLowerCase(),
        nome: nome.trim(),
        perfil,
      },
      redirectTo: homeDoPerfil(perfil),
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Erro ao processar cadastro no banco de dados." },
      { status: 500 },
    );
  }
}
