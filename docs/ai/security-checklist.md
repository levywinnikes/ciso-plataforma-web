# Checklist de Seguranca para APIs

Este documento e leitura **obrigatoria** antes de criar ou alterar qualquer arquivo em `src/app/api/**` ou qualquer codigo que envolva autenticacao, autorizacao ou validacao de entrada.

## Motivacao

Auditoria do projeto identificou rotas publicas que deveriam ser protegidas (ex: `/api/nuclei/*` permitia que qualquer usuario autenticado criasse/editasse/excluisse nucleos clinicos). Para evitar repeticao, todos os controles foram centralizados em `src/lib/api-auth.ts`.

## Regras absolutas

1. **Toda rota em `src/app/api/**`deve, na primeira instrucao do handler, autenticar e autorizar via helpers de`src/lib/api-auth.ts`.** Nunca chamar `getServerSession` diretamente nos handlers.
2. **Toda resposta de erro deve usar codigo de chave i18n**, no formato `{ error: "errors.<chave>" }`, com o helper `apiError(code, status)`. Nunca retornar string em portugues hardcoded.
3. **Toda entrada externa deve ser validada com Zod** antes de qualquer operacao em banco. Use `schema.safeParse()` e retorne `apiError("errors.invalidXxxData", 400)` em caso de falha.
4. **Nunca confiar no `organizationId` enviado pelo cliente.** Sempre usar `session.user.organizationId` ou validar via `canManageOrg(user, orgId)` antes de qualquer operacao multi-tenant.

## Helpers disponiveis (`src/lib/api-auth.ts`)

| Helper                          | Retorno                                        | Quando usar                                                                                                     |
| ------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `requireSession()`              | `{ error: NextResponse } \| { session, user }` | Qualquer endpoint que exige usuario autenticado                                                                 |
| `requireAdministrativo()`       | idem                                           | Endpoint exclusivo do super-admin global (role `ADMINISTRATIVO`): CRUD de organizacoes, nucleos, servicos, etc. |
| `canManageOrg(user, orgId)`     | `boolean`                                      | Endpoint multi-tenant: aceita ADMINISTRATIVO global OU isAdmin da propria organizacao                           |
| `canManageUser(user, targetId)` | `Promise<boolean>` (consulta Prisma)           | Endpoint que modifica usuarios: ADMINISTRATIVO sempre, isAdmin se alvo for da propria organizacao               |
| `apiError(code, status)`        | `NextResponse`                                 | Encapsular respostas de erro com codigo i18n                                                                    |
| `ApiSessionUser`                | tipo                                           | Tipar `session.user` com `role`, `isAdmin`, `organizationId`                                                    |

## Padrao de handler

```ts
import { NextRequest, NextResponse } from "next/server";

import { apiError, requireAdministrativo } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { mySchema } from "./schema";

export async function POST(request: NextRequest) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = mySchema.safeParse(body);
  if (!parsed.success) return apiError("errors.invalidMyData", 400);

  const created = await prisma.myEntity.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
```

## Matriz de codigos de erro padronizados

Codigos ja registrados nos JSONs de i18n (`src/i18n/messages/{pt-BR,en-US}.json`, namespace `errors`):

- `errors.unauthorized` (401) — sessao ausente
- `errors.forbidden` (403) — sessao valida mas sem permissao
- `errors.invalidNucleusData` / `errors.invalidServiceData` / `errors.invalidUserData` (400) — payload invalido
- `errors.atLeastOneService` (400) — regra de negocio especifica
- `errors.organizationNotFound` (404) — recurso multi-tenant nao encontrado
- `errors.invalidRoleForOrganization` (400) — role incompativel com tipo de organizacao
- `errors.passwordTooShort` (400) — politica de senha
- `errors.genericRequestFailed` (500) — fallback de erro inesperado

Antes de adicionar nova chave, verifique se ja existe equivalente. Se criar nova chave, adicione em **ambos** os JSONs no mesmo namespace.

## Checklist antes de mergear endpoint novo ou alterado

- [ ] Primeira instrucao chama `requireSession()`/`requireAdministrativo()`/`canManageX()`?
- [ ] Toda resposta de erro usa `apiError(code, status)`?
- [ ] Toda entrada externa passou por Zod `safeParse`?
- [ ] `organizationId` nunca vem direto do body sem validacao?
- [ ] Codigo `errors.*` existe nos dois JSONs de i18n?
- [ ] Endpoint documentado em `docs/ai/api-routes.md`?
- [ ] Permissao documentada em `docs/ai/access-and-permissions.md` se for nova regra?
