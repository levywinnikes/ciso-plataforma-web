# API Routes Documentação

Mapa completo de todos os endpoints da API REST, por domínio e role.

---

## Convenções

- **Base URL:** `http://localhost:3000/api`
- **Autenticação:** sessao via NextAuth/JWT. Todo handler em `src/app/api/**` deve, na primeira instrucao, chamar um helper de `src/lib/api-auth.ts` (`requireSession`, `requireAdministrativo`, `canManageOrg`, `canManageUser`). Ver `docs/ai/security-checklist.md`.
- **Content-Type:** `application/json`
- **Respostas de erro:** HTTP status apropriado + JSON `{ "error": "errors.<chave>" }` onde `<chave>` esta registrada em `src/i18n/messages/{pt-BR,en-US}.json` no namespace `errors`. Use o helper `apiError("errors.<chave>", status)`. Nunca retornar string em portugues hardcoded.
- **Codigos comuns:** `errors.unauthorized` (401), `errors.forbidden` (403), `errors.organizationNotFound` (404), `errors.invalidNucleusData` / `errors.invalidServiceData` / `errors.invalidUserData` (400), `errors.atLeastOneService` (400), `errors.invalidRoleForOrganization` (400), `errors.passwordTooShort` (400), `errors.genericRequestFailed` (500).

---

## Organização (ADMINISTRATIVO)

### Listar todas as organizações

```
GET /organizations
Authorization: Bearer <admin_token>
```

**Resposta (200):**

```json
[
  {
    "id": "org_123",
    "name": "Clínica Vision",
    "type": "CLINICA",
    "cnpj": "12.345.678/0001-90",
    "createdAt": "2025-01-01T10:00:00Z"
  },
  {
    "id": "org_456",
    "name": "Grupo Optomtria Ltda",
    "type": "PROFISSIONAL_GROUP",
    "cnpj": "98.765.432/0001-10",
    "createdAt": "2025-01-02T10:00:00Z"
  }
]
```

**Acesso:** Apenas ADMINISTRATIVO
**Filtros (query params):** `?type=CLINICA` ou `?type=PROFISSIONAL_GROUP`

### Criar organização

```
POST /organizations
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Payload:**

```json
{
  "name": "Clínica Nova",
  "type": "CLINICA",
  "cnpj": "12.345.678/0001-91",
  "address": "Rua A, 100",
  "phone": "(11) 98765-4321"
}
```

**Resposta (201):**

```json
{
  "id": "org_789",
  "name": "Clínica Nova",
  "type": "CLINICA",
  "cnpj": "12.345.678/0001-91",
  "createdAt": "2025-01-03T10:00:00Z"
}
```

**Validações:**

- `name` obrigatório
- `type` deve ser CLINICA ou PROFISSIONAL_GROUP
- Ao criar, um usuário MEDICO (ou PROFISSIONAL) com `isAdmin=true` é gerado automaticamente

### Editar organização

```
PATCH /organizations/:orgId
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Payload:** (qualquer campo, opcional)

```json
{
  "name": "Clínica Nova Revisada",
  "phone": "(11) 99999-9999"
}
```

**Resposta (200):** Organização atualizada

**Acesso:** Apenas ADMINISTRATIVO

### Deletar organização

```
DELETE /organizations/:orgId
Authorization: Bearer <admin_token>
```

**Resposta (204):** Sem corpo

**Efeito:** Marca como inativa (soft delete) ou remove em cascade:

- Todos os usuários vinculados
- Todos os referrals
- Acessos profissionais

---

## Usuários (ADMINISTRATIVO + organizações)

> **Questão em aberto:** `isAdmin` representa **admin local** no modelo, mas o contrato de quem pode gerenciar usuários ainda não está fechado. Abaixo descreve o **comportamento atual** das rotas, não a regra final desejada.

### Listar Gestores Globais (Administradores)

```
GET /users/globals
Authorization: Bearer <admin_token>
```

**Resposta (200):**

```json
[
  {
    "id": "user_admin_1",
    "email": "admin@integravisao.com.br",
    "name": "Admin Principal",
    "role": "ADMINISTRATIVO",
    "isAdmin": false,
    "createdAt": "2025-01-01T10:00:00Z"
  }
]
```

**Acesso:** Apenas ADMINISTRATIVO

### Criar Gestor Global (Administrador)

```
POST /users/globals
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Payload:**

```json
{
  "email": "novo_admin@integravisao.com.br",
  "name": "Novo Admin",
  "password": "senha_segura_123"
}
```

**Resposta (201):** Usuário criado com `role=ADMINISTRATIVO` e `organizationId=null`.

**Acesso:** Apenas ADMINISTRATIVO

### Listar usuários de uma organização

```
GET /organizations/:orgId/users
Authorization: Bearer <token>
```

**Resposta (200):**

```json
[
  {
    "id": "user_123",
    "email": "medico@clinica.com",
    "name": "Dr. Silva",
    "role": "MEDICO",
    "isAdmin": true,
    "createdAt": "2025-01-01T10:00:00Z"
  },
  {
    "id": "user_124",
    "email": "medico2@clinica.com",
    "name": "Dra. Santos",
    "role": "MEDICO",
    "isAdmin": false,
    "createdAt": "2025-01-02T10:00:00Z"
  }
]
```

**Acesso (comportamento atual):**

- ADMINISTRATIVO → qualquer org, via `canManageOrg`
- MEDICO/PROFISSIONAL com `isAdmin=true` → própria org, via `canManageOrg`
- MEDICO/PROFISSIONAL sem `isAdmin` → 403 nesta rota

### Listar/criar usuários (rota alternativa da org)

```
GET /users/organization?organizationId=...
POST /users/organization
PATCH /users/organization/:id
DELETE /users/organization/:id
```

**Acesso (comportamento atual):**

- qualquer `MEDICO` ou `PROFISSIONAL` autenticado da org pode listar, criar, editar e remover usuários da própria org
- `ADMINISTRATIVO` pode informar `organizationId` na query

> Enforcement de `isAdmin` **não está uniforme** entre `/organizations/:id/users` e `/users/organization`. Tratar como dívida técnica até fechar o contrato de admin local.

### Criar usuário em organização (via `/organizations/:id/users`)

```
POST /organizations/:orgId/users
Authorization: Bearer <token>
Content-Type: application/json
```

**Payload:**

```json
{
  "email": "novo_medico@clinica.com",
  "name": "Dr. Novo",
  "password": "senha_temporaria_123",
  "role": "MEDICO"
}
```

**Resposta (201):**

```json
{
  "id": "user_125",
  "email": "novo_medico@clinica.com",
  "name": "Dr. Novo",
  "role": "MEDICO",
  "isAdmin": false,
  "organizationId": "org_123",
  "createdAt": "2025-01-03T10:00:00Z"
}
```

**Validações:**

- Email único no sistema
- Password min 8 caracteres
- Role deve corresponder ao tipo de org (CLINICA → MEDICO, PROFISSIONAL_GROUP → PROFISSIONAL)

**Acesso (comportamento atual):**

- ADMINISTRATIVO → criar em qualquer org (`canManageOrg`)
- MEDICO/PROFISSIONAL com `isAdmin=true` → criar na própria org
- MEDICO/PROFISSIONAL sem `isAdmin` → 403 nesta rota
- via `/users/organization`: qualquer membro da org (ver rota alternativa acima)

### Editar usuário

```
PATCH /users/:userId
Authorization: Bearer <token>
Content-Type: application/json
```

**Payload:**

```json
{
  "name": "Dr. Novo Atualizado",
  "isAdmin": false
}
```

**Resposta (200):** Usuário atualizado

**Acesso (comportamento atual):**

- ADMINISTRATIVO → editar qualquer usuário
- MEDICO/PROFISSIONAL com `isAdmin=true` → editar usuários da própria org (`canManageUser`)
- demais casos → variam conforme a rota usada (ver inconsistência acima)

### Deletar usuário

```
DELETE /users/:userId
Authorization: Bearer <token>
```

**Resposta (204):** Sem corpo

**Acesso (comportamento atual):**

- ADMINISTRATIVO → deletar qualquer usuário
- MEDICO/PROFISSIONAL com `isAdmin=true` → deletar usuários da própria org
- demais casos → variam conforme a rota usada (ver inconsistência acima)

---

## Acessos Profissionais (ADMINISTRATIVO)

### Listar acessos (todas as ligações)

```
GET /professional-access
Authorization: Bearer <admin_token>
```

**Resposta (200):**

```json
[
  {
    "id": "pa_1",
    "professionalGroupId": "org_456",
    "professionalGroupName": "Grupo Optometria Ltda",
    "clinicId": "org_123",
    "clinicName": "Clínica Vision",
    "createdAt": "2025-01-01T10:00:00Z"
  }
]
```

**Acesso:** Apenas ADMINISTRATIVO

### Criar acesso (designar profissional → clínica)

```
POST /professional-access
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Payload:**

```json
{
  "professionalGroupId": "org_456",
  "clinicId": "org_123"
}
```

**Resposta (201):**

```json
{
  "id": "pa_1",
  "professionalGroupId": "org_456",
  "clinicId": "org_123",
  "createdAt": "2025-01-01T10:00:00Z"
}
```

**Validações:**

- `professionalGroupId` deve ser Organization com type=PROFISSIONAL_GROUP
- `clinicId` deve ser Organization com type=CLINICA
- Dupla não pode existir (constraint unique)

**Acesso:** Apenas ADMINISTRATIVO

### Deletar acesso

```
DELETE /professional-access/:accessId
Authorization: Bearer <admin_token>
```

**Resposta (204):** Sem corpo

**Acesso:** Apenas ADMINISTRATIVO

---

## Núcleos de Atendimento (ADMINISTRATIVO cria, todos leem)

### Listar núcleos

```
GET /nuclei
Authorization: Bearer <token>
```

**Resposta (200):**

```json
[
  {
    "id": "nucleus_1",
    "name": "Consulta Simples",
    "description": "Consulta oftalmológica básica",
    "chargedPrice": "150.00",
    "services": [
      { "id": "svc_1", "name": "Exame de refração", "basePrice": "100.00" },
      { "id": "svc_2", "name": "Tonometria", "basePrice": "50.00" }
    ],
    "createdAt": "2025-01-01T10:00:00Z"
  }
]
```

**Acesso:** Todos (ADMINISTRATIVO, MEDICO, PROFISSIONAL)

### Criar núcleo

```
POST /nuclei
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Payload:**

```json
{
  "name": "Cirurgia Refrativa",
  "description": "Cirurgia de correção refrativa",
  "chargedPrice": "5000.00",
  "services": [
    { "name": "Avaliação pré-operatória", "basePrice": "500.00" },
    { "name": "Cirurgia", "basePrice": "4000.00" },
    { "name": "Acompanhamento pós-operatório", "basePrice": "500.00" }
  ]
}
```

**Resposta (201):** Núcleo criado com services

**Acesso:** Apenas ADMINISTRATIVO

### Editar núcleo

```
PATCH /nuclei/:nucleusId
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Payload:**

```json
{
  "name": "Cirurgia Refrativa Atualizada",
  "chargedPrice": "5500.00"
}
```

**Resposta (200):** Núcleo atualizado

**Acesso:** Apenas ADMINISTRATIVO

### Deletar núcleo

```
DELETE /nuclei/:nucleusId
Authorization: Bearer <admin_token>
```

**Resposta (204):** Sem corpo

**Acesso:** Apenas ADMINISTRATIVO

---

## Referrals (PROFISSIONAL cria, MEDICO edita)

### Listar clínicas disponíveis para encaminhamento

```
GET /referrals/clinics
Authorization: Bearer <token>
```

**Resposta (200):** lista de organizações `CLINICA`, com convênios ativos quando existirem.

**Regra vigente:**

- `PROFISSIONAL` pode visualizar todas as clínicas
- `ProfessionalAccess` não governa o fluxo atual desta rota
- se essa regra mudar, o contrato de acesso deve ser atualizado antes da implementação

### Listar referrals (com filtro por organização)

```
GET /referrals
Authorization: Bearer <token>
```

**Resposta varia por role:**

- **PROFISSIONAL:** Seus referrals (`createdByUserId = id`) ou todos do consultório se `isAdmin`; inclui `Bloqueado`
- **ADMINISTRATIVO:** Todos os referrals; inclui `Bloqueado`
- **MEDICO:** Referrals da clínica (`organizationId = sua org`) nos status `Agendado` e `Atendido` apenas — **nunca** retorna `Bloqueado` (nem `Encaminhado` no filtro atual da clínica)

**Response (200) — modo legado (sem `page`):**

```json
[
  {
    "id": "ref_1",
    "patientName": "João Silva",
    "status": "Encaminhado"
  }
]
```

**Response (200) — modo paginado (`?page=1`):**

```json
{
  "items": [
    { "id": "ref_1", "patientName": "João Silva", "status": "Encaminhado" }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 42,
  "totalPages": 5,
  "counts": {
    "encaminhado": 10,
    "agendado": 7,
    "atendido": 15,
    "bloqueado": 6,
    "overdue": 5,
    "active": 32
  }
}
```

`counts` só aparece com `includeCounts=1` (calculado no escopo do papel, sem o filtro `tab` da página).

**Query params:**

- `?page=1&pageSize=10` — paginação server-side (sem `page` = lista completa, legado)
- `?tab=active|blocked|overdue` — abas da lista
- `?status=Bloqueado|Encaminhado|Agendado|Atendido` — filtro de situação
- `?includeCounts=1` — inclui totais para cards/badges
- `?appointmentFrom=AAAA-MM-DD` e/ou `?appointmentTo=AAAA-MM-DD` — restringe a encaminhamentos **com** `appointmentDate` no intervalo (calendário de agendamentos)
- Relatórios/financeiro: por padrão excluir `Bloqueado`; só incluir com flag/filtro explícito (ex.: `?includeBlocked=true`)

### Criar referral

```
POST /referrals
Authorization: Bearer <profissional_token>
Content-Type: application/json
```

**Payload:**

```json
{
  "patientName": "Maria Santos",
  "patientBirthDate": "1990-05-15",
  "patientPhone": "(11) 98765-4321",
  "patientDocument": "123.456.789-00",
  "systemicDiseases": "Hipertensão",
  "clinicalNotes": "Paciente com queixa de miopia",
  "clinicalSuspicion": "Miopia progressiva",
  "nucleusId": "nucleus_1",
  "clinicId": "org_123",
  "documents": ["file_id_1", "file_id_2"],
  "status": "Bloqueado",
  "justificativaBloqueio": "Cliente ainda não decidiu horário"
}
```

`status` e `justificativaBloqueio` são opcionais na criação. Se `status` for omitido, default = `Encaminhado`. Se `status = Bloqueado`, `justificativaBloqueio` é obrigatória (string não vazia, máx. 500).

**Resposta (201):**

```json
{
  "id": "ref_2",
  "patientName": "Maria Santos",
  "status": "Encaminhado",
  "justificativaBloqueio": null,
  "organizationId": "org_123",
  "createdByUserId": "user_10",
  "createdAt": "2025-01-03T10:00:00Z"
}
```

**Validações:**

- A clínica de destino deve ser uma organização do tipo `CLINICA`
- Todos os campos obrigatórios
- `status` na criação: apenas `Encaminhado` (default) ou `Bloqueado`
- Se `Bloqueado`, exigir `justificativaBloqueio`

**Acesso:** PROFISSIONAL e ADMINISTRATIVO (admin cria em nome de um profissional/consultório)

### Atualizar referral (médico preenchendo ficha)

```
PATCH /referrals/:referralId
Authorization: Bearer <medico_token>
Content-Type: application/json
```

**Payload:**

```json
{
  "status": "Agendado",
  "doctor": "Dr. Silva",
  "appointmentDate": "2025-01-15T14:30:00Z"
}
```

Ou:

```json
{
  "status": "Atendido",
  "specialistNotes": "Paciente apresenta miopia bilateral",
  "specialistConduct": "Prescrição de óculos corretivos"
}
```

**Resposta (200):** Referral atualizado

**Restrições:**

- MEDICO só pode atualizar se `organizationId = sua org`
- PROFISSIONAL pode editar em `Encaminhado` ou `Bloqueado` (incluindo troca entre esses status + justificativa); não pode atualizar após `Agendado`
- Não é permitido alterar status de `Atendido` para `Bloqueado`
- Mudanças envolvendo `Bloqueado` devem gerar registro de auditoria

**Acesso:** Principalmente MEDICO (seu próprio fluxo); PROFISSIONAL e ADMINISTRATIVO conforme regras de edição

### Marcar como atendido (administrativo)

```
PATCH /referrals/:referralId/complete
```

Sem corpo. Autorização: `requireAdministrativo`.

**Resposta (200):**

```json
{ "id": "ref_123", "status": "Atendido" }
```

**Erros:** `errors.referralNotFound`, `errors.referralAlreadyCompleted`, `errors.referralBlockedCannotComplete`, `errors.cannotCompleteReferral`.

**Regras:** somente `Encaminhado` ou `Agendado`. Gera `ReferralStatusAudit`.

### Assistente administrativo (piloto)

```
POST /admin/assistant/chat
```

Autorização: `requireAdministrativo`. Corpo: `{ "message": "...", "locale": "pt-BR", "history": [] }`.

**Resposta (200):** `{ "reply": "...", "remaining": 199, "dados?": { "linhas": [...] }, "visualizacao?": { "tipo", "titulo?" } }`

Quando houver consulta numérica, `dados.linhas` alimenta o gráfico no widget. `visualizacao` só aparece se o modelo pedir gráfico (`barras` | `linhas` | `pizza`); o JSON não é mostrado ao usuário.

**Erros:** `errors.invalidAssistantData`, `errors.assistantDailyLimit` (429), `errors.assistantUnavailable`, `errors.assistantNotConfigured`.

Limite: 200 perguntas por usuário por dia. Fallback só entre modelos Gemini.

O chat envia o **manual** e a **gramática da consulta**. Se a pergunta pedir número, o modelo pede um recorte; o servidor agrega; o modelo responde. Não anexa relatório pronto. Não envia lista de encaminhamentos.

### Consultas do Assistente

```
GET /admin/assistant/queries
POST /admin/assistant/queries
```

Autorização: `requireAdministrativo`. Só totais — **sem** paciente.

**GET:** catálogo versionado (`versao`, `dimensoes` por assunto, limites).

**POST:** `{ "consulta": { "versao": 2, "assunto", "medir", "dimensoes", "filtros", "limite?" } }` (Zod estrito). Financeiro exclui `Bloqueado` salvo `incluirBloqueados`. Gramática v1 (`quebrarPor`, etc.) é rejeitada.

**Erros:** `errors.invalidAssistantQuery`, `errors.assistantUnavailable`.

O Gemini **não** chama este endereço. O chat usa `runAssistantConsulta` no servidor.

### Agendar encaminhamento (administrativo)

```
PATCH /referrals/:referralId/schedule
```

**Payload:** `clinicId`, `doctorUserId`, `appointmentDate`. Só a partir de `Encaminhado`. Gera `ReferralStatusAudit` (`Encaminhado` → `Agendado`).

### Concluir atendimento (médico)

```
PATCH /referrals/:referralId/specialist
```

Notas, conduta, cirurgia e `complete`. Só `MEDICO` da clínica. Se `complete` for verdadeiro e o status ainda não for `Atendido`, gera `ReferralStatusAudit`.

### Deletar referral

```
DELETE /referrals/:referralId
Authorization: Bearer <token>
```

**Resposta (204):** Sem corpo

**Acesso:**

- ADMINISTRATIVO → `Bloqueado`, `Encaminhado` ou `Agendado` (nunca `Atendido`)
- PROFISSIONAL → apenas os que criou / do office, status `Encaminhado` ou `Bloqueado`
- MEDICO → não pode deletar

---

## Documentos (Upload)

### Upload generico (Spaces)

```
POST /api/uploads
Authorization: sessao NextAuth
Content-Type: multipart/form-data
```

**Form data:**

```
file: <arquivo.pdf|imagem|doc>
```

**Resposta (201):**

```json
{
  "id": "integravisao/2026/07/uuid-exame.pdf",
  "fileName": "exame.pdf",
  "key": "integravisao/2026/07/uuid-exame.pdf",
  "url": "https://...assinada...",
  "uploadedAt": "2026-07-27T10:00:00.000Z"
}
```

**Regras:**

- Tamanho maximo: 10 MB
- Tipos: PDF, JPEG, PNG, WEBP, GIF, DOC, DOCX
- Arquivos privados no Spaces, pasta `integravisao/`
- Roles: PROFISSIONAL, MEDICO, ADMINISTRATIVO

### Upload de documento (legado / por encaminhamento)

```
POST /referrals/:referralId/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form data:**

```
file: <arquivo.pdf>
```

**Resposta (201):**

```json
{
  "id": "doc_1",
  "fileName": "exame_olho.pdf",
  "url": "s3://bucket/exame_olho.pdf",
  "createdAt": "2025-01-03T10:00:00Z"
}
```

**Acesso:**

- PROFISSIONAL → documents pré-encaminhamento
- MEDICO → attachments pós-agendamento

---

## Health Check

```
GET /health
```

**Resposta (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-01-03T10:00:00Z"
}
```

**Acesso:** Público (sem autenticação)

---

## Códigos de Erro

| Status | Descrição             | Exemplo                 |
| ------ | --------------------- | ----------------------- |
| 200    | OK                    | Operação bem-sucedida   |
| 201    | Created               | Recurso criado          |
| 204    | No Content            | Deletado com sucesso    |
| 400    | Bad Request           | Validação falhou        |
| 401    | Unauthorized          | Token inválido/expirado |
| 403    | Forbidden             | Sem permissão para ação |
| 404    | Not Found             | Recurso não existe      |
| 409    | Conflict              | Duplicate entry         |
| 500    | Internal Server Error | Erro no servidor        |

---

## Fluxo de Autenticação

1. **Login:** POST `/auth/login` → retorna JWT
2. **JWT inclui:** `userId`, `email`, `role`, `organizationId`, `isAdmin`
3. **Middlewares validam:**
   - Token válido
   - Role apropriado para rota
   - Se organização restrita, validar `organizationId`

---

## Resumo de Permissões por Endpoint

| Endpoint                   | GET           | POST          | PATCH         | DELETE           |
| -------------------------- | ------------- | ------------- | ------------- | ---------------- |
| `/organizations`           | Admin         | Admin         | Admin         | Admin            |
| `/organizations/:id/users` | Admin/isAdmin | Admin/isAdmin | Admin/isAdmin | Admin/isAdmin    |
| `/users/globals`           | Admin         | Admin         | —             | —                |
| `/nuclei`                  | Todos         | Admin         | Admin         | Admin            |
| `/referrals`               | Prof/Med      | Prof          | Med           | Admin/Prof(novo) |
| `/referrals/:id/complete`  | —             | —             | Admin         | —                |
| `/admin/assistant/chat`    | —             | Admin         | —             | —                |
| `/admin/assistant/queries` | Admin         | Admin         | —             | —                |
| `/professional-access`     | Admin         | Admin         | —             | Admin            |
| `/health`                  | Público       | —             | —             | —                |
