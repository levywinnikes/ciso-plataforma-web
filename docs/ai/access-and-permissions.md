# Modelo de Acesso e Permissões

## Visão geral

O `Integra Visão` usa RBAC com três papéis principais e vínculo organizacional simples:

- `ADMINISTRATIVO`: acesso global
- `MEDICO`: vinculado a uma organização do tipo `CLINICA`
- `PROFISSIONAL`: vinculado a uma organização do tipo `PROFISSIONAL_GROUP`

Usuários de organização possuem o campo `isAdmin` no modelo, pensado como **admin local**, mas o contrato completo dessa flag ainda **não está fechado** (ver seção abaixo e `decision-log.md`).

> Fonte de verdade técnica: `prisma/schema.prisma`, `src/lib/auth.ts` e `src/lib/api-auth.ts`.

---

## Estrutura organizacional vigente

```text
ADMINISTRATIVO (global)
├─ Organization (CLINICA)
│  ├─ MEDICO (isAdmin=true)
│  └─ MEDICO (isAdmin=false)
└─ Organization (PROFISSIONAL_GROUP)
   ├─ PROFISSIONAL (isAdmin=true)
   └─ PROFISSIONAL (isAdmin=false)
```

### Regras de vinculação

- `ADMINISTRATIVO`: não possui `organizationId`
- `MEDICO`: pertence a uma única clínica
- `PROFISSIONAL`: pertence a um único grupo profissional
- `isAdmin`: flag de **admin local** no modelo; efeitos completos ainda não fechados como regra de produto

---

## `isAdmin` (admin local) — questão em aberto

**Intenção do campo:** marcar um usuário como administrador dentro da própria organização.

**Não é regra vigente fechada.** Por enquanto:

- **não** implementar nem documentar como contrato rígido quem pode ou não gerenciar usuários com base em `isAdmin`
- **não** alterar código de permissões até decisão formal

**Comportamento parcial já presente no código:**

| Contexto                                     | Com `isAdmin=true`                        | Sem `isAdmin`         |
| -------------------------------------------- | ----------------------------------------- | --------------------- |
| Listagem de encaminhamentos (`PROFISSIONAL`) | vê encaminhamentos de todo o consultório  | vê apenas os próprios |
| Gestão de usuários                           | enforcement **inconsistente** entre rotas | idem                  |

**Direção provável (não adotada):** admin local geriria colaboradores da org; usuário comum faria o resto do sistema sem CRUD de usuários.

---

## Matriz de permissões vigente

### ADMINISTRATIVO

| Recurso                          | Criar | Ler | Editar | Deletar              | Notas                                   |
| -------------------------------- | ----- | --- | ------ | -------------------- | --------------------------------------- |
| Organizações                     | ✅    | ✅  | ✅     | ✅                   | Escopo global                           |
| Usuários globais                 | ✅    | ✅  | ✅     | ✅                   | Escopo global                           |
| Usuários de qualquer organização | ✅    | ✅  | ✅     | ✅                   | Escopo global                           |
| Encaminhamentos                  | ✅    | ✅  | ✅     | ✅ exceto `Atendido` | Inclui `Bloqueado`                      |
| Assistente (orientação)          | ❌    | ✅  | ❌     | ❌                   | Widget em `/admin/**`; não altera dados |
| Financeiro / relatórios globais  | ❌    | ✅  | ❌     | ❌                   | `Bloqueado` fora por padrão             |

### MEDICO

| Recurso                    | Criar | Ler | Editar          | Deletar | Notas                                                                   |
| -------------------------- | ----- | --- | --------------- | ------- | ----------------------------------------------------------------------- |
| Encaminhamentos da clínica | ❌    | ✅  | ✅ parcialmente | ❌      | Atua em fluxo clínico (`Agendado` / `Atendido`)                         |
| Usuários da organização    | ⚠️    | ⚠️  | ⚠️              | ⚠️      | Comportamento atual não uniforme; ver questão em aberto sobre `isAdmin` |
| Dados da própria clínica   | ❌    | ✅  | ❌              | ❌      | Somente leitura                                                         |

### PROFISSIONAL

| Recurso                                   | Criar | Ler | Editar                                | Deletar                               | Notas                                                                   |
| ----------------------------------------- | ----- | --- | ------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| Encaminhamentos                           | ✅    | ✅  | ✅ enquanto `Encaminhado`/`Bloqueado` | ✅ enquanto `Encaminhado`/`Bloqueado` | Com `isAdmin=true`, listagem inclui todo o consultório                  |
| Usuários da organização                   | ⚠️    | ⚠️  | ⚠️                                    | ⚠️                                    | Comportamento atual não uniforme; ver questão em aberto sobre `isAdmin` |
| Dados do próprio grupo                    | ❌    | ✅  | ❌                                    | ❌                                    | Somente leitura                                                         |
| Seleção de clínica no novo encaminhamento | ✅    | ✅  | ✅                                    | ❌                                    | Regra vigente: todas as clínicas                                        |

---

## Encaminhamentos e visibilidade

### Status `Bloqueado`

O status `Bloqueado` está implementado e vigente.

- pode ser usado por `ADMINISTRATIVO` e `PROFISSIONAL`
- exige `justificativaBloqueio`
- não aparece para a clínica
- fica fora de relatórios e financeiro por padrão

Consulte `docs/ai/referral-management.md` para o contrato completo de criação, edição, exclusão e transições.

### Auditoria de status

A diretriz oficial do projeto é manter auditoria de **todas** as mudanças de status de encaminhamento.

Rotas que devem gravar `ReferralStatusAudit` na transição:

- criação com `Bloqueado`
- `PUT /api/referrals/:id` quando o status muda
- `PATCH /api/referrals/:id/schedule` (`Encaminhado` → `Agendado`)
- `PATCH /api/referrals/:id/complete` (admin → `Atendido`)
- `PATCH /api/referrals/:id/specialist` quando `complete` marca `Atendido`

Cada registro deve ter `fromStatus`, `toStatus`, `userId` e `createdAt`. Quando houver `Bloqueado`, incluir `justificativaBloqueio`.

---

## Usuários por organização

### Comportamento atual (não fechado como contrato)

A gestão de colaboradores em clínicas e consultórios **não tem regra de produto fechada** via `isAdmin` neste momento.

**Hoje no código:**

- `/organizacao/usuarios` aparece para todo `MEDICO` e `PROFISSIONAL` na sidebar
- `/api/users/organization` permite CRUD por qualquer membro autenticado da org
- `/api/organizations/:id/users` usa `canManageOrg` (exige `isAdmin=true` ou `ADMINISTRATIVO`)

Até a decisão sobre admin local ser formalizada, tratar gestão de usuários como **área instável**, não como contrato rígido.

### Restrições já implementadas

- clínica só cria usuários `MEDICO`
- grupo profissional só cria usuários `PROFISSIONAL`
- `ADMINISTRATIVO`: por enquanto qualquer usuário administrativo pode fazer tudo (questão em aberto)

---

## JWT e sessão

O token/sessão deve carregar:

- `id`
- `role`
- `organizationId`
- `organizationType`
- `organizationName`
- `isAdmin`

Esses campos já são preenchidos em `src/lib/auth.ts`.

---

## Proteção de rotas

Regras atuais:

- `/admin/**` → `ADMINISTRATIVO`
- `/medico/**` → `MEDICO`
- `/profissional/**` → `PROFISSIONAL`
- `/organizacao/usuarios` → `MEDICO` ou `PROFISSIONAL` (regras de admin local via `isAdmin` ainda em aberto)

No backend, usar sempre os helpers de `src/lib/api-auth.ts`.

---

## Regra vigente sobre clínicas disponíveis

Ao criar encaminhamento como `PROFISSIONAL`, a regra vigente é:

- o sistema pode listar **todas as clínicas**
- `ProfessionalAccess` **não governa** o fluxo operacional atual

Essa decisão foi formalizada em 18/08/2026 e deve permanecer assim até nova decisão de negócio.

---

## Roadmap e não-vigente

### `ProfessionalAccess`

`ProfessionalAccess` permanece no modelo e nas rotas como base técnica para evolução futura, mas **não é regra vigente** do produto neste momento.

Quando essa política mudar, este documento deve ser atualizado antes de qualquer alteração estrutural no fluxo de encaminhamento.

### Outros itens futuros

- fechar contrato de **admin local** (`isAdmin`) para gestão de usuários por organização
- restringir gestão de usuários `ADMINISTRATIVO` a um subconjunto de admins globais
- médico pertencer a múltiplas clínicas
- papéis customizados por organização
- delegação temporária de permissões
- logs de acesso por ação além das mudanças de status
- Assistente (chat): piloto vigente só `ADMINISTRATIVO`. Abrir para clínica/consultório exige **contrato por papel** — ver `docs/ai/admin-assistant.md`
