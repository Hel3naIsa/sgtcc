# Integração front-end ↔ backend ↔ Firestore

Telas autenticadas lendo dados do Firestore, sobre o fluxo de sessão de `docs/auth-integration.md`.

## Rotas

| Rota | Quem acessa | O que mostra |
|---|---|---|
| `/login` | público | botão de SSO institucional (RF01) |
| `/dashboard` | logado | redireciona para a home do perfil |
| `/dashboard/aluno` · `/orientador` · `/avaliador` · `/coordenacao` | o perfil correspondente (`coordenacao` também aceita ADMIN) | lista dos TCCs que o perfil pode ver |
| `/dashboard/tcc/[id]` | quem tem vínculo com o TCC | marcos, status, versões e feedbacks |

`src/proxy.ts` barra `/dashboard/*` sem cookie; cada página valida a sessão de verdade em
`requireSessao()` (`src/lib/auth/server-session.ts`). Perfil errado → redireciona para a home do próprio perfil.

## Onde está cada coisa

- `src/lib/data/queries.ts`: leituras do Firestore (Admin SDK). Segue o modelo do banco:
  aluno → `alunos.usuario_id` → matrícula; orientador → `professores_orientadores.usuario_id`;
  avaliador → `bancas_avaliacao`. Um TCC isolado passa por `canAccessTcc` (`lib/auth/authorization.ts`).
- `src/lib/auth/server-session.ts`: adapta `getAuthenticatedSession` para Server Components.
- `src/app/dashboard/*`: páginas. `src/app/login/*`: tela de login.

## Como testar localmente

O login é só SSO (não há e-mail/senha). Para testar com uma conta Google:

1. Firebase Console → Authentication → Método de login → ative **Google**.
2. No `.env.local`: `NEXT_PUBLIC_FIREBASE_AUTH_PROVIDER_ID=google.com` e `FIREBASE_AUTH_PROVIDER_ID=google.com`
   (deixe os `*_EMAIL_DOMAIN` vazios).
3. `npm run seed` (cria os dados de exemplo) e `npm run dev`.
4. Em `/login`, entre com sua conta Google. Na primeira vez aparece erro de perfil não cadastrado.
5. Firebase Console → Authentication → Users: copie o **UID** da sua conta. Em Firestore, crie
   `usuarios/<UID>` com `id` (= UID), `nome`, `email` e `perfil` (`COORDENACAO` vê todos os TCCs).
6. Entre de novo: deve abrir `/dashboard/coordenacao` com os 2 TCCs do seed.

Para testar outros perfis, mude o campo `perfil` e ligue a sua conta ao registro do seed:
- `ALUNO`: em `alunos/2026001` troque `usuario_id` pelo seu UID (vê o TCC do Jorge).
- `ORIENTADOR`: em `professores_orientadores/<uid da Joana>` troque `usuario_id` pelo seu UID.
- `AVALIADOR`: em `professores_avaliadores/<uid da Silvia>` troque `usuario_id` pelo seu UID.
