# Estrutura do Banco de Dados

Fonte de verdade atual: `prisma/schema.prisma`.

Este documento descreve a estrutura das tabelas do banco da aplicação, com foco no fluxo real da plataforma: autenticação, núcleos de atendimento e encaminhamentos.

## Visão Geral

### Domínios principais

- Autenticação e perfis: `User`, `Account`, `Session`, `VerificationToken`
- Organizações: `Organization`
- Controle de acesso: `ProfessionalAccess`
- Catálogo clínico: `CareNucleus`, `CareNucleusService` (global)
- Operação do fluxo: `Referral`, `ReferralDocument`, `ReferralAttachment`

### Regras gerais

- Os IDs atuais são `String` com `@default(cuid())`.
- O banco usa PostgreSQL via Prisma.
- Campos monetários usam `Decimal(10, 2)`.
- O fluxo de encaminhamento é controlado por `ReferralStatus`.

## Tabela: User

Armazena as contas de acesso do sistema.

| Campo          | Tipo     | Obrigatório | Regras                                                 |
| -------------- | -------- | ----------- | ------------------------------------------------------ |
| id             | String   | Sim         | Chave primária                                         |
| email          | String   | Sim         | Único                                                  |
| emailVerified  | DateTime | Não         | Usado por fluxos de confirmação                        |
| name           | String   | Sim         | Nome exibido na interface                              |
| image          | String   | Não         | Avatar/foto de perfil                                  |
| passwordHash   | String   | Não         | Senha criptografada para login por credenciais         |
| role           | UserRole | Sim         | Default `PROFISSIONAL`                                 |
| organizationId | String   | Não         | FK para `Organization.id`; null se role=ADMINISTRATIVO |
| isAdmin        | Boolean  | Não         | Default `false`; permite gerenciar usuários se true    |
| createdAt      | DateTime | Sim         | Default `now()`                                        |

### Relações

- 1 User tem várias Account
- 1 User tem várias Session
- 1 User pertence a 1 Organization (se organizationId != null)

## Tabela: Account

Representa contas externas ou credenciais vinculadas ao NextAuth.

| Campo             | Tipo   | Obrigatório | Regras                   |
| ----------------- | ------ | ----------- | ------------------------ |
| id                | String | Sim         | Chave primária           |
| userId            | String | Sim         | FK para `User.id`        |
| type              | String | Sim         | Tipo do provider         |
| provider          | String | Sim         | Nome do provider         |
| providerAccountId | String | Sim         | Id da conta no provider  |
| refresh_token     | String | Não         | Texto longo              |
| access_token      | String | Não         | Texto longo              |
| expires_at        | Int    | Não         | Expiração em timestamp   |
| token_type        | String | Não         | Tipo do token            |
| scope             | String | Não         | Escopos concedidos       |
| id_token          | String | Não         | Texto longo              |
| session_state     | String | Não         | Estado da sessão externa |

### Restrições

- `provider + providerAccountId` é único.
- Ao remover o usuário, as contas são removidas em cascade.

## Tabela: Session

Guarda sessões ativas do usuário.

| Campo        | Tipo     | Obrigatório | Regras            |
| ------------ | -------- | ----------- | ----------------- |
| id           | String   | Sim         | Chave primária    |
| sessionToken | String   | Sim         | Único             |
| userId       | String   | Sim         | FK para `User.id` |
| expires      | DateTime | Sim         | Data de expiração |

### Restrições

- `sessionToken` é único.
- Ao remover o usuário, as sessões são removidas em cascade.

## Tabela: VerificationToken

Suporte para fluxos de verificação, redefinição e confirmação.

| Campo      | Tipo     | Obrigatório | Regras                 |
| ---------- | -------- | ----------- | ---------------------- |
| identifier | String   | Sim         | Identificador do fluxo |
| token      | String   | Sim         | Único                  |
| expires    | DateTime | Sim         | Expiração do token     |

### Restrições

- `token` é único.
- `identifier + token` também é único.

## Tabela: Organization

Agrupa usuários em entidades de negócio (clínicas e grupos de profissionais).

| Campo     | Tipo             | Obrigatório | Regras                                |
| --------- | ---------------- | ----------- | ------------------------------------- |
| id        | String           | Sim         | Chave primária                        |
| name      | String           | Sim         | Nome da clínica ou grupo profissional |
| type      | OrganizationType | Sim         | CLINICA ou PROFISSIONAL_GROUP         |
| cnpj      | String           | Não         | CNPJ/CPF opcional                     |
| address   | String           | Não         | Endereço                              |
| phone     | String           | Não         | Telefone                              |
| createdAt | DateTime         | Sim         | Default `now()`                       |

### Relações

- 1 Organization tem vários User
- 1 Organization (CLINICA) tem vários Referral (recebidos)
- 1 Organization (PROFISSIONAL_GROUP) tem vários Referral (enviados)
- 1 Organization (PROFISSIONAL_GROUP) pode ter vários ProfessionalAccess (outgoing)
- 1 Organization (CLINICA) pode ter vários ProfessionalAccess (incoming)

### Regras de negócio

- Criada apenas por ADMINISTRATIVO
- Cada usuário MEDICO ou PROFISSIONAL é vinculado a exatamente 1 organização
- ADMINISTRATIVO não tem organizationId

## Tabela: ProfessionalAccess

Designa quais grupos de profissionais podem encaminhar para quais clínicas.

| Campo               | Tipo     | Obrigatório | Regras                                              |
| ------------------- | -------- | ----------- | --------------------------------------------------- |
| id                  | String   | Sim         | Chave primária                                      |
| professionalGroupId | String   | Sim         | FK para `Organization.id` (tipo PROFISSIONAL_GROUP) |
| clinicId            | String   | Sim         | FK para `Organization.id` (tipo CLINICA)            |
| createdAt           | DateTime | Sim         | Default `now()`                                     |

### Restrições

- `professionalGroupId + clinicId` é único (1 acesso por par)
- Ao remover organização, os acessos são removidos em cascade

### Regras de negócio

- Criada apenas por ADMINISTRATIVO
- Permite que PROFISSIONAL (grupo) veja a clínica destino no formulário de novo referral
- Sem entrada em `ProfessionalAccess`, PROFISSIONAL não pode encaminhar para aquela clínica

## Tabela: CareNucleus

Define os núcleos de atendimento disponíveis no sistema (global, criado por ADMINISTRATIVO).

| Campo        | Tipo          | Obrigatório | Regras                      |
| ------------ | ------------- | ----------- | --------------------------- |
| id           | String        | Sim         | Chave primária              |
| name         | String        | Sim         | Nome do núcleo              |
| description  | String        | Sim         | Descrição comercial/clínica |
| chargedPrice | Decimal(10,2) | Sim         | Valor cobrado pelo núcleo   |
| createdAt    | DateTime      | Sim         | Default `now()`             |

### Relações

- 1 CareNucleus tem vários CareNucleusService
- 1 CareNucleus tem vários Referral

### Regras de negócio

- Criado apenas por ADMINISTRATIVO
- Visível para MEDICO e PROFISSIONAL (leitura apenas)
- Não é vinculado a organização (global)

## Tabela: CareNucleusService

Lista os serviços que compõem cada núcleo.

| Campo     | Tipo          | Obrigatório | Regras                   |
| --------- | ------------- | ----------- | ------------------------ |
| id        | String        | Sim         | Chave primária           |
| nucleusId | String        | Sim         | FK para `CareNucleus.id` |
| name      | String        | Sim         | Nome do serviço          |
| basePrice | Decimal(10,2) | Sim         | Preço-base do serviço    |

### Restrições

- Ao remover o núcleo, os serviços são removidos em cascade.

## Tabela: Referral

É a tabela central do fluxo operacional da plataforma.

| Campo               | Tipo           | Obrigatório | Regras                                      |
| ------------------- | -------------- | ----------- | ------------------------------------------- |
| id                  | String         | Sim         | Chave primária                              |
| patientName         | String         | Sim         | Nome do paciente                            |
| patientBirthDate    | DateTime       | Sim         | Data de nascimento                          |
| patientPhone        | String         | Sim         | Telefone normalizado                        |
| patientDocument     | String         | Não         | CPF/documento opcional                      |
| systemicDiseases    | String         | Não         | Campo livre                                 |
| clinicalNotes       | String         | Não         | Observações do encaminhamento               |
| clinicalSuspicion   | String         | Não         | Hipótese diagnóstica (suspeita clínica)     |
| status              | ReferralStatus | Sim         | Default `Encaminhado`                       |
| doctor              | String         | Não         | Médico responsável, quando agendado         |
| appointmentDate     | DateTime       | Não         | Data do agendamento                         |
| specialistNotes     | String         | Não         | Considerações do especialista               |
| specialistConduct   | String         | Não         | Conduta médica                              |
| nucleusId           | String         | Sim         | FK para `CareNucleus.id`                    |
| organizationId      | String         | Sim         | FK para `Organization.id` (clínica destino) |
| professionalGroupId | String         | Sim         | FK para `Organization.id` (grupo origem)    |
| createdByUserId     | String         | Sim         | FK para `User.id` (PROFISSIONAL que enviou) |
| createdAt           | DateTime       | Sim         | Default `now()`                             |
| updatedAt           | DateTime       | Sim         | Atualizado automaticamente                  |

### Relações

- 1 Referral pertence a 1 CareNucleus
- 1 Referral pertence a 1 Organization (clínica destino)
- 1 Referral pertence a 1 Organization (grupo profissional de origem)
- 1 Referral foi criado por 1 User (PROFISSIONAL)
- 1 Referral tem vários ReferralDocument
- 1 Referral tem vários ReferralAttachment

### Regras de negócio

- O encaminhamento é criado por PROFISSIONAL (createdByUserId)
- Sempre aponta para 1 organização de clínica (organizationId)
- PROFISSIONAL só pode criar se houver `ProfessionalAccess` para aquela clínica
- O encaminhamento nasce como `Encaminhado`
- `appointmentDate` e `doctor` passam a fazer sentido quando a clínica agenda
- `specialistNotes` e `specialistConduct` são preenchidos por MEDICO na etapa de atendimento

## Tabela: ReferralDocument

Documentos enviados junto com o encaminhamento inicial.

| Campo      | Tipo     | Obrigatório | Regras                   |
| ---------- | -------- | ----------- | ------------------------ |
| id         | String   | Sim         | Chave primária           |
| referralId | String   | Sim         | FK para `Referral.id`    |
| fileName   | String   | Sim         | Nome original do arquivo |
| url        | String   | Não         | Localização do arquivo   |
| createdAt  | DateTime | Sim         | Default `now()`          |

### Restrições

- Ao remover o encaminhamento, os documentos são removidos em cascade.

## Tabela: ReferralAttachment

Arquivos anexados na etapa de atendimento do especialista.

| Campo      | Tipo     | Obrigatório | Regras                   |
| ---------- | -------- | ----------- | ------------------------ |
| id         | String   | Sim         | Chave primária           |
| referralId | String   | Sim         | FK para `Referral.id`    |
| fileName   | String   | Sim         | Nome original do arquivo |
| url        | String   | Não         | Localização do arquivo   |
| createdAt  | DateTime | Sim         | Default `now()`          |

### Restrições

- Ao remover o encaminhamento, os anexos são removidos em cascade.

## Enums

### UserRole

- `ADMINISTRATIVO` — Gestor global do sistema
- `MEDICO` — Profissional que atende em clínica
- `PROFISSIONAL` — Profissional que encaminha (optometrista)

### OrganizationType

- `CLINICA` — Organização que recebe referrals e atende
- `PROFISSIONAL_GROUP` — Organização que encaminha referrals

### ReferralStatus

- `Encaminhado`
- `Agendado`
- `Atendido`

## Pontos para evoluir depois

- Snapshot de preço no `Referral` para preservar histórico financeiro
- Unificação de `ReferralDocument` e `ReferralAttachment` em tabela única com coluna `kind`
- Um médico pertencer a múltiplas clínicas (requer refatoração de organizationId em User)
- Roles customizáveis por organização (não apenas MEDICO/PROFISSIONAL global)
- Auditoria: tabela de logs para rastrear mudanças críticas
