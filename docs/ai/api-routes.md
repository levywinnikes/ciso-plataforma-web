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

## Usuários (ADMINISTRATIVO + Admin Local)

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

**Acesso:**

- ADMINISTRATIVO → todos os usuários de qualquer org
- MEDICO/PROFISSIONAL com isAdmin=true → apenas usuários de sua org

### Criar usuário em organização

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

**Acesso:**

- ADMINISTRATIVO → criar em qualquer org
- MEDICO/PROFISSIONAL com isAdmin=true → criar em sua própria org

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

**Acesso:**

- ADMINISTRATIVO → editar qualquer usuário
- MEDICO/PROFISSIONAL com isAdmin=true → editar usuários da própria org (não pode alterar role)

### Deletar usuário

```
DELETE /users/:userId
Authorization: Bearer <token>
```

**Resposta (204):** Sem corpo

**Acesso:**

- ADMINISTRATIVO → deletar qualquer usuário
- MEDICO/PROFISSIONAL com isAdmin=true → deletar usuários da própria org

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

### Listar referrals (com filtro por organização)

```
GET /referrals
Authorization: Bearer <token>
```

**Resposta varia por role:**

- **PROFISSIONAL:** Apenas seus próprios referrals (`createdByUserId = id`)
- **MEDICO:** Referrals da clínica (`organizationId = sua org`)

**Response (200):**

```json
[
  {
    "id": "ref_1",
    "patientName": "João Silva",
    "patientPhone": "(11) 98765-4321",
    "status": "Encaminhado",
    "nucleusId": "nucleus_1",
    "nucleusName": "Consulta Simples",
    "organizationId": "org_123",
    "createdByUserId": "user_10",
    "createdAt": "2025-01-03T10:00:00Z"
  }
]
```

**Query params:**

- `?status=Encaminhado` ou `?status=Agendado` ou `?status=Atendido`
- `?page=1&limit=10` (paginação)

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
  "organizationId": "org_123",
  "documents": ["file_id_1", "file_id_2"]
}
```

**Resposta (201):**

```json
{
  "id": "ref_2",
  "patientName": "Maria Santos",
  "status": "Encaminhado",
  "organizationId": "org_123",
  "createdByUserId": "user_10",
  "createdAt": "2025-01-03T10:00:00Z"
}
```

**Validações:**

- PROFISSIONAL só pode criar para organizações que aparecem em `ProfessionalAccess`
- Todos os campos obrigatórios
- `organizationId` deve ser Organization com type=CLINICA

**Acesso:** Apenas PROFISSIONAL

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
- PROFISSIONAL não pode atualizar após envio (status ≥ Agendado)

**Acesso:** Principalmente MEDICO (seu próprio fluxo)

### Deletar referral

```
DELETE /referrals/:referralId
Authorization: Bearer <token>
```

**Resposta (204):** Sem corpo

**Acesso:**

- ADMINISTRATIVO → qualquer referral
- PROFISSIONAL → apenas os que criou (status Encaminhado)
- MEDICO → não pode deletar

---

## Documentos (Upload)

### Upload de documento

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
| `/professional-access`     | Admin         | Admin         | —             | Admin            |
| `/health`                  | Público       | —             | —             | —                |
