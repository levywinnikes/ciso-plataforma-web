# Modelo de Acesso e Permissões

## Visão Geral

O sistema implementa controle de acesso baseado em roles (RBAC) com suporte a organizações multi-tipo:

- **Organizações de clínicas:** agrupam médicos
- **Organizações de profissionais:** agrupam optometristas/referradores

Dentro de cada organização, um usuário com `isAdmin=true` gerencia usuários internos.

---

## Roles do Sistema

| Role               | Tipo de Organização | isAdmin | Descrição                                                                                                         |
| ------------------ | ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| **ADMINISTRATIVO** | Nenhuma (Global)    | —       | Gestor geral do sistema. Cria organizações, designa acesso entre profissionais e clínicas, vê relatórios globais. |
| **MEDICO**         | Clínica             | false   | Profissional que atende pacientes. Acessa e preenche referrals.                                                   |
| **MEDICO**         | Clínica             | true    | Médico que também gerencia usuários (outros MEDICO) de sua clínica.                                               |
| **PROFISSIONAL**   | Grupo Profissional  | false   | Referenciador (optometrista). Encaminha para clínicas designadas.                                                 |
| **PROFISSIONAL**   | Grupo Profissional  | true    | Profissional que também gerencia usuários (outros PROFISSIONAL) de seu grupo.                                     |

---

## Estrutura Organizacional

```
ADMINISTRATIVO (Global)
├─ Organization (Clínica)
│  ├─ MEDICO (isAdmin=true)   ← gerencia usuários da clínica
│  ├─ MEDICO (isAdmin=false)
│  ├─ MEDICO (isAdmin=false)
│  └─ ...
├─ Organization (Grupo Profissional)
│  ├─ PROFISSIONAL (isAdmin=true)   ← gerencia usuários do grupo
│  ├─ PROFISSIONAL (isAdmin=false)
│  ├─ PROFISSIONAL (isAdmin=false)
│  └─ ...
└─ ...
```

### Regras de Vinculação

- **ADMINISTRATIVO:** Nenhuma organização. Pode criar e gerenciar todas as organizações.
- **MEDICO:** Vinculado a 1 organização de clínica. Se `isAdmin=true`, pode gerenciar outros MEDICO da clínica.
- **PROFISSIONAL:** Vinculado a 1 organização de profissionais. Se `isAdmin=true`, pode gerenciar outros PROFISSIONAL do grupo.

### Tipos de Organização

| Tipo                   | Usuários                                                           | Função                                               |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| **CLINICA**            | MEDICO(s) — 1 com `isAdmin=true`, outros com `isAdmin=false`       | Recebe referrals de profissionais, atende pacientes. |
| **PROFISSIONAL_GROUP** | PROFISSIONAL(s) — 1 com `isAdmin=true`, outros com `isAdmin=false` | Encaminha referrals para clínicas designadas.        |

---

## Matriz de Permissões

### ADMINISTRATIVO (Global)

| Recurso                  | Criar | Ler        | Editar        | Deletar    | Notas                                           |
| ------------------------ | ----- | ---------- | ------------- | ---------- | ----------------------------------------------- |
| **Organização**          | ✅    | ✅ (todas) | ✅ (todas)    | ✅ (todas) | Ao criar, gera 1 ADMIN_LOCAL                    |
| **ADMIN_LOCAL**          | ✅    | ✅ (todas) | ✅ (todas)    | ✅ (todas) | Designa admin para cada org                     |
| **MEDICO**               | ✅    | ✅ (todas) | ✅ (todas)    | ✅ (todas) | CRUD em qualquer clínica                        |
| **PROFISSIONAL**         | ✅    | ✅ (todas) | ✅ (todas)    | ✅ (todas) | CRUD em qualquer grupo profissional             |
| **Designação de acesso** | ✅    | ✅ (todas) | ✅            | ❌         | Designa quais profissionais veem quais clínicas |
| **Referral**             | ❌    | ✅ (todas) | ⚠️ financeiro | ❌         | Relatórios gerais apenas                        |
| **Relatório global**     | ❌    | ✅         | ❌            | ❌         | Dashboard geral do sistema                      |

### MEDICO (Clínica, isAdmin=false)

| Recurso                 | Criar | Ler | Editar                              | Deletar | Notas                                |
| ----------------------- | ----- | --- | ----------------------------------- | ------- | ------------------------------------ |
| **Referral da clínica** | ❌    | ✅  | ✅ (considerações, conduta, anexos) | ❌      | Atendimento e preenchimento de ficha |
| **Dados da clínica**    | ❌    | ✅  | ❌                                  | ❌      | Informações básicas apenas           |
| **Usuários da clínica** | ❌    | ❌  | ❌                                  | ❌      | Sem acesso                           |
| **Outras clínicas**     | ❌    | ❌  | ❌                                  | ❌      | Acesso bloqueado                     |

### MEDICO (Clínica, isAdmin=true)

| Recurso                  | Criar | Ler | Editar                              | Deletar | Notas                         |
| ------------------------ | ----- | --- | ----------------------------------- | ------- | ----------------------------- |
| **Referral da clínica**  | ❌    | ✅  | ✅ (considerações, conduta, anexos) | ❌      | Igual a MEDICO regular        |
| **Dados da clínica**     | ❌    | ✅  | ⚠️ info básica                      | ❌      | Informações, sem alterar tipo |
| **Usuários da clínica**  | ✅    | ✅  | ✅                                  | ✅      | Gerencia outros MEDICO        |
| **Relatório da clínica** | ❌    | ✅  | ❌                                  | ❌      | Dashboard de sua clínica      |
| **Outras clínicas**      | ❌    | ❌  | ❌                                  | ❌      | Sem acesso                    |

### PROFISSIONAL (Grupo Profissional, isAdmin=false)

| Recurso                         | Criar | Ler                 | Editar                | Deletar | Notas                                       |
| ------------------------------- | ----- | ------------------- | --------------------- | ------- | ------------------------------------------- |
| **Referral**                    | ✅    | ✅ (só os seus)     | ⚠️ pré-encaminhamento | ❌      | Encaminha para clínicas designadas          |
| **Seleção de clínica destino**  | ✅    | ✅                  | ✅                    | ❌      | Apenas clínicas designadas por ADMIN_GLOBAL |
| **Dados do grupo profissional** | ❌    | ✅                  | ❌                    | ❌      | Informações básicas apenas                  |
| **Usuários do grupo**           | ❌    | ❌                  | ❌                    | ❌      | Sem acesso                                  |
| **Referral pós-encaminhamento** | ❌    | ⚠️ leitura limitada | ❌                    | ❌      | Pode ver status apenas                      |
| **Outras orgs**                 | ❌    | ❌                  | ❌                    | ❌      | Sem acesso                                  |

### PROFISSIONAL (Grupo Profissional, isAdmin=true)

| Recurso                         | Criar | Ler                 | Editar                | Deletar | Notas                         |
| ------------------------------- | ----- | ------------------- | --------------------- | ------- | ----------------------------- |
| **Referral**                    | ✅    | ✅ (todos do grupo) | ⚠️ pré-encaminhamento | ❌      | Igual a PROFISSIONAL regular  |
| **Seleção de clínica destino**  | ✅    | ✅                  | ✅                    | ❌      | Apenas clínicas designadas    |
| **Dados do grupo profissional** | ❌    | ✅                  | ⚠️ info básica        | ❌      | Informações, sem alterar tipo |
| **Usuários do grupo**           | ✅    | ✅                  | ✅                    | ✅      | Gerencia outros PROFISSIONAL  |
| **Relatório do grupo**          | ❌    | ✅                  | ❌                    | ❌      | Dashboard de seu grupo        |
| **Outras orgs**                 | ❌    | ❌                  | ❌                    | ❌      | Sem acesso                    |

---

## Fluxos por Role

### ADMINISTRATIVO

```
Login → Dashboard Admin Global
├─ Listar todas as organizações (clínicas + grupos profissionais)
├─ Criar nova organização (gera 1 MEDICO ou PROFISSIONAL com isAdmin=true inicial)
├─ Editar dados de organização
├─ Gerenciar todos os usuários (create/update/delete)
├─ Designar acesso (ex: "Grupo Prof. X pode enviar para Clínica Y")
├─ Visualizar relatório financeiro global
├─ Dashboard com métricas gerais
└─ Logs de auditoria
```

### MEDICO (isAdmin=true)

```
Login → Dashboard Médico (Clínica)
├─ Listar referrals da clínica
├─ Ver detalhes de referral
├─ Preencher considerações, conduta, anexos
├─ Atualizar status do referral
├─ + Gerenciar usuários da clínica
│  ├─ Adicionar novo MEDICO
│  ├─ Editar perfil de outro médico
│  ├─ Remover médico
│  └─ Reset de senha
├─ + Ver dados da clínica
└─ + Visualizar relatório da clínica
```

### MEDICO (isAdmin=false)

```
Login → Dashboard Médico (Clínica)
├─ Listar referrals da clínica
├─ Ver detalhes de referral
├─ Preencher considerações, conduta, anexos
├─ Atualizar status do referral
└─ ❌ Sem acesso a gerenciamento de usuários
```

### PROFISSIONAL (isAdmin=true)

```
Login → Dashboard Profissional (Grupo)
├─ Novo referral
│  ├─ Preencher dados do paciente
│  ├─ Selecionar clínica destino (apenas as designadas)
│  ├─ Anexar documentos
│  └─ Enviar
├─ Listar referrals (próprios + do grupo)
├─ Ver status e relatório
├─ + Gerenciar usuários do grupo
│  ├─ Adicionar novo PROFISSIONAL
│  ├─ Editar perfil de outro profissional
│  ├─ Remover profissional
│  └─ Reset de senha
├─ + Ver dados do grupo
└─ + Visualizar relatório do grupo
```

### PROFISSIONAL (isAdmin=false)

```
Login → Dashboard Profissional (Grupo)
├─ Novo referral
│  ├─ Preencher dados do paciente
│  ├─ Selecionar clínica destino (apenas as designadas)
│  ├─ Anexar documentos
│  └─ Enviar
├─ Listar meus referrals
├─ Ver status do referral
└─ ❌ Sem acesso a gerenciamento de usuários
```

---

## Considerações Técnicas

### Schema Prisma (Planejado)

```prisma
enum UserRole {
  ADMINISTRATIVO
  MEDICO
  PROFISSIONAL
}

enum OrganizationType {
  CLINICA
  PROFISSIONAL_GROUP
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  type      OrganizationType
  cnpj      String?
  createdAt DateTime @default(now())
  users     User[]
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  password       String
  role           UserRole
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  isAdmin        Boolean  @default(false)
  createdAt      DateTime @default(now())
}

model ProfessionalAccess {
  id                    String   @id @default(cuid())
  professionalOrgId     String   // Organização de profissionais
  clinicOrgId           String   // Clínica destino
  createdAt             DateTime @default(now())

  @@unique([professionalOrgId, clinicOrgId])
}
```

### Regras

- **ADMINISTRATIVO:** `organizationId = null`, `isAdmin` não usado
- **MEDICO:** `organizationId = organizacaoId`, `isAdmin = true/false` (true → gerencia usuários)
- **PROFISSIONAL:** `organizationId = organizacaoId`, `isAdmin = true/false` (true → gerencia usuários)

### Armazenamento no JWT

O token JWT deve incluir:

- `userId`
- `email`
- `role` (ADMINISTRATIVO | MEDICO | PROFISSIONAL)
- `organizationId` (null se ADMINISTRATIVO; present se MEDICO ou PROFISSIONAL)
- `organizationType` (CLINICA | PROFISSIONAL_GROUP; null se ADMINISTRATIVO)
- `isAdmin` (boolean; false se ADMINISTRATIVO)

### Middleware de Proteção de Rotas

- `/admin` → requer `role=ADMINISTRATIVO`
- `/admin-local` → requer (`role=MEDICO` OR `role=PROFISSIONAL`) + `isAdmin=true` + `organizationId`
- `/medico` → requer `role=MEDICO` + `organizationType=CLINICA`
- `/profissional` → requer `role=PROFISSIONAL` + `organizationType=PROFISSIONAL_GROUP`

### Queries com Filtro por Organização

Sempre que MEDICO ou PROFISSIONAL consultarem dados, a query deve incluir:

```ts
where: {
  organizationId: user.organizationId;
}
```

ADMINISTRATIVO não precisa de filtro (acesso global).

### Designação de Acesso (ProfessionalAccess)

Admin global designa quais grupos de profissionais podem encaminhar para quais clínicas via tabela `ProfessionalAccess`.

PROFISSIONAL ao criar referral:

1. Consulta `ProfessionalAccess` filtrado por `professionalOrgId = user.organizationId`
2. Vê apenas as clínicas designadas
3. Escolhe 1 clínica destino
4. Referral é criado com `organizationId = clínicaId`

---

## Próximas Evoluções (Não Implementadas Agora)

- [ ] Um médico pertencer a múltiplas clínicas (requer mudança no modelo)
- [ ] Roles customizáveis por organização (TRIAGEM, ATENDIMENTO, GESTOR)
- [ ] Delegação temporária de permissões
- [ ] Auditoria e logs de acesso por ação
- [ ] UI para admin global designar acessos (atualmente via seed/sql)
