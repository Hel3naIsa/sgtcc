import { NextResponse } from "next/server";
import { adminDb, adminInitError } from "@/lib/firebase/admin";
import {
  createSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { homeDoPerfil } from "@/lib/auth/perfis";
import type { PerfilEnum } from "@/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const { identifier, password } = (body as { identifier?: string; password?: string }) ?? {};

  if (!identifier || !password) {
    return NextResponse.json(
      {
        error: "INVALID_CREDENTIALS",
        message: "Credenciais inválidas ou usuário não encontrado.",
      },
      { status: 401 },
    );
  }

  let email = identifier.trim();

  // Se o identificador for uma matrícula (sem @), busca o e-mail correspondente no Firestore
  if (!email.includes("@") && adminDb) {
    try {
      const alunoSnap = await adminDb.collection("alunos").doc(email).get();
      if (alunoSnap.exists) {
        const usuarioId = alunoSnap.data()?.usuario_id;
        if (usuarioId) {
          const userSnap = await adminDb.collection("usuarios").doc(usuarioId).get();
          if (userSnap.exists && userSnap.data()?.email) {
            email = userSnap.data()?.email;
          }
        }
      }
    } catch {
      // continua com o identificador original caso a busca falhe
    }
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "SERVER_CONFIG", message: "API Key do Firebase não configurada." },
      { status: 500 },
    );
  }

  try {
    // Autentica as credenciais na API segura do Firebase Auth
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    if (!authResponse.ok) {
      // AC1: mensagem de erro exata solicitada pelo critério de aceitação
      return NextResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Credenciais inválidas ou usuário não encontrado.",
        },
        { status: 401 },
      );
    }

    const authData = (await authResponse.json()) as {
      idToken: string;
      localId: string;
      email: string;
      displayName?: string;
    };

    // Busca o perfil do usuário no Firestore
    let perfil: PerfilEnum = "ALUNO" as PerfilEnum;
    let nome = authData.displayName ?? "Usuário";

    if (adminDb) {
      const userDoc = await adminDb.collection("usuarios").doc(authData.localId).get();
      if (userDoc.exists) {
        const dados = userDoc.data();
        if (dados?.perfil) perfil = dados.perfil;
        if (dados?.nome) nome = dados.nome;
      }
    }

    // Cria o cookie de sessão seguro do SGTCC
    const sessionCookie = await createSessionCookie(authData.idToken);
    const destino = homeDoPerfil(perfil);

    const response = NextResponse.json({
      success: true,
      user: {
        uid: authData.localId,
        email: authData.email,
        nome,
        perfil,
      },
      redirectTo: destino,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Erro no login por credenciais:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Ocorreu um erro ao processar o login institucional.",
      },
      { status: 500 },
    );
  }
}
