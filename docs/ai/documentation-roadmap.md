# Roadmap de Documentação

**Estado em 19/08/2026.** Substitui o audit de 17/05/2026, que descrevia um código antigo (sem `Organization`) e documentos que hoje já existem.

Não usar este arquivo como evidência de que falta `api-routes.md`, `decision-log.md` ou o modelo de organização.

---

## O que está vigente e alinhado

| Documento                               | Papel                                                      |
| --------------------------------------- | ---------------------------------------------------------- |
| `docs/ai/patterns.md`                   | Padrões de código (formulários, i18n, UI, toasts)          |
| `docs/ai/access-and-permissions.md`     | Roles, JWT/sessão, matriz, `isAdmin` em aberto             |
| `docs/ai/user-views.md`                 | Telas vigentes por papel                                   |
| `docs/ai/api-routes.md`                 | Endpoints                                                  |
| `docs/ai/database-structure.md`         | Prisma                                                     |
| `docs/ai/decision-log.md`               | Decisões de produto                                        |
| `docs/ai/referral-management.md`        | Encaminhamentos, `Bloqueado`, atraso, marcar como atendido |
| `docs/ai/security-checklist.md`         | Obrigatório em rotas API                                   |
| `docs/ai/setup-and-deployment.md`       | Local e Vercel                                             |
| `docs/ai/convenios.md` / `cirurgias.md` | Módulos específicos                                        |
| `docs/ai/admin-assistant.md`            | Piloto do Assistente (vigente no admin)                    |
| `docs/ai/assistant-knowledge.md`        | Manual de consulta do chat (linguagem de negócio)          |
| `docs/ai/assistant-contract.md`         | Contrato do Assistente: pode / não pode                    |
| `docs/ai/assistant-autonomy.md`         | Autonomia extra (A2/A3) — **a fazer**, sem código          |
| `docs/RELATORIO_ENTREGAS.md`            | Entregas e horas                                           |

`Organization` **existe** no Prisma (`CLINICA` e `PROFISSIONAL_GROUP`). Usuários de clínica/consultório têm `organizationId`.

Autenticação NextAuth/JWT está descrita em `access-and-permissions.md` (campos da sessão) e no código `src/lib/auth.ts` + `middleware.ts`. Não há `authentication.md` separado; não é bloqueador.

---

## Aberto de propósito (não implementar agora)

1. **Admin local (`isAdmin`)** — intenção documentada; enforcement inconsistente; sem contrato fechado.
2. **Quem em `ADMINISTRATIVO` gerencia usuários** — hoje qualquer administrativo faz tudo.
3. **`ProfessionalAccess`** — no modelo/rotas; **não** governa a lista de clínicas do profissional.
4. **Assistente (chat)** — piloto vigente no admin. Expandir a outros papéis exige contrato próprio.
5. **Assistente A2 (destacar / ranking)** — planejado em `assistant-autonomy.md`; **a fazer**, não implementar agora.

---

## Dívida restante (baixa prioridade)

| Item                                     | Nota                                                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Modal de edição em `/admin`              | Ainda tem rótulos de campos em português no JSX (dívida de i18n antiga)                                         |
| `testing-guide.md` / `business-flows.md` | Opcionais; Jest já tem exemplos em `src/**/__tests__`; fluxo de encaminhamento está em `referral-management.md` |
| README                                   | Aponta para `doc-index`; regras de negócio resumidas; não reescrever por completo agora                         |

---

## Próximo produto (quando o restante estiver ok)

Piloto do Assistente no admin **já implementado**. Próximas evoluções: contratos por papel para clínica/consultório.
