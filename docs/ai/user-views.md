# Telas e Views por Role

Mapa de quais telas cada role pode acessar e o que faz em cada uma.

---

## ADMINISTRATIVO (Global)

### Dashboard Admin

**Rota:** `/admin`

Visão geral do sistema com:

- Total de organizações (clínicas + grupos profissionais)
- Total de usuários por tipo
- Últimas atividades
- Cards de métricas gerais

### Gerenciar Organizações

**Rota:** `/admin/organizacoes` (não implementado ainda)

CRUD de organizações:

- Listar todas
- Criar nova (escolhe tipo: CLINICA ou PROFISSIONAL_GROUP)
- Editar dados (nome, CNPJ, etc.)
- Deletar
- Ao criar, gera 1 MEDICO (se CLINICA) ou 1 PROFISSIONAL (se PROFISSIONAL_GROUP) com `isAdmin=true`

### Gerenciar Usuários

**Rota:** `/admin/usuarios` (não implementado ainda)

CRUD de todos os usuários:

- Listar por organização ou tipo de role
- Criar novo usuário
- Editar perfil
- Deletar
- Filtrar por organização, role, status

### Designar Acessos (Profissionais → Clínicas)

**Rota:** `/admin/acessos` (não implementado ainda)

Matriz de permissões:

- Selecionar grupo profissional
- Selecionar clínicas que podem receber referrals desse grupo
- Salvar permissão (cria/remove de `ProfessionalAccess`)

### Relatórios Globais

**Rota:** `/admin/relatorios` (não implementado ainda)

Visualizações:

- Referrals por clínica (últimos 30 dias)
- Atividade por organização
- Distribuição de referrals (origem vs. destino)
- Métricas financeiras globais

---

## MEDICO (Clínica)

### Dashboard Médico

**Rota:** `/medico`

Listagem de referrals:

- Referrals da clínica (filtrados por status)
- Busca por paciente
- Ordenação por data
- Cards de métricas (total atendido hoje, pendentes, etc.)

### Detalhe de Referral

**Rota:** `/medico/referral/:id`

Ficha completa do paciente:

- Dados do paciente (nome, DOB, telefone, CPF, doenças sistêmicas)
- Histórico do encaminhamento
- Status atual
- Data de agendamento
- ✏️ **Edição permitida:**
  - Considerações clínicas
  - Conduta recomendada
  - Anexar documentos/exames
- Salvar e atualizar status (Encaminhado → Agendado → Atendido)

### Gerenciar Usuários (apenas se isAdmin=true)

**Rota:** `/medico/usuarios` (novo, condicional)

CRUD de usuários da clínica:

- Listar médicos da clínica
- Adicionar novo médico (cria usuário MEDICO com isAdmin=false)
- Editar perfil de outro médico
- Remover médico da clínica
- Reset de senha

### Dados da Clínica (apenas se isAdmin=true)

**Rota:** `/medico/configuracoes` (novo, condicional)

Edição de informações básicas:

- Nome da clínica
- CNPJ/CPF
- Endereço
- Contato
- ❌ Não pode alterar tipo

### Relatórios da Clínica (apenas se isAdmin=true)

**Rota:** `/medico/relatorios` (novo, condicional)

Visualizações:

- Referrals recebidos (últimos 30 dias)
- Agendamentos e atendimentos
- Médicos mais ativos
- Distribuição por status

---

## PROFISSIONAL (Grupo Profissional)

### Dashboard Profissional

**Rota:** `/profissional`

Listagem de referrals enviados:

- Meus referrals (filtrados por status)
- Busca por paciente
- Status do encaminhamento (Encaminhado, Agendado, Atendido)
- Cards de métricas (total encaminhado mês, taxa de agendamento)

### Novo Referral

**Rota:** `/profissional/novo`

Formulário de encaminhamento:

- Dados do paciente (obrigatório)
- Seleção de clínica destino:
  - ✅ Dropdown com apenas clínicas designadas por ADMIN_GLOBAL
  - Busca e filtro
- Hipótese diagnóstica (suspeita clínica)
- Seleção de núcleo de atendimento
- Upload de documentos
- Enviar

### Listar Meus Referrals

**Rota:** `/profissional` (dashboard já listar)

Visualização com:

- ID do referral
- Paciente
- Clínica destino
- Status atual (Encaminhado, Agendado, Atendido)
- Data de envio
- Ação: Clicar para ver detalhes

### Detalhe de Referral (Pós-Encaminhamento)

**Rota:** `/profissional/referral/:id`

Informações limitadas:

- Status atualizado
- Data de agendamento (se agendado)
- ❌ Sem acesso a considerações/conduta do médico
- ❌ Sem acesso a outros documentos que médico anexou

### Gerenciar Usuários (apenas se isAdmin=true)

**Rota:** `/profissional/usuarios` (novo, condicional)

CRUD de usuários do grupo profissional:

- Listar profissionais do grupo
- Adicionar novo profissional (cria usuário PROFISSIONAL com isAdmin=false)
- Editar perfil de outro profissional
- Remover profissional do grupo
- Reset de senha

### Dados do Grupo (apenas se isAdmin=true)

**Rota:** `/profissional/configuracoes` (novo, condicional)

Edição de informações básicas:

- Nome do grupo
- CNPJ/CPF
- Endereço
- Contato
- ❌ Não pode alterar tipo

### Relatórios do Grupo (apenas se isAdmin=true)

**Rota:** `/profissional/relatorios` (novo, condicional)

Visualizações:

- Referrals enviados (últimos 30 dias)
- Distribuição por clínica destino
- Profissionais mais ativos
- Taxa de agendamento

---

## Rotas Não Implementadas (Legado)

- ❌ `/clinica` — **DEPRECATED**, roles redefinidos
- ❌ `/centro` — **DEPRECATED**, redirecionado para `/admin`
- ✅ `/optometrista` → redirecionado para `/profissional` (mantém compatibilidade)

---

## Resumo de Rotas

| Rota                          | Role/Condição               | Função                            |
| ----------------------------- | --------------------------- | --------------------------------- |
| `/admin`                      | ADMINISTRATIVO              | Dashboard global                  |
| `/admin/organizacoes`         | ADMINISTRATIVO              | CRUD de organizações              |
| `/admin/usuarios`             | ADMINISTRATIVO              | CRUD de todos os usuários         |
| `/admin/acessos`              | ADMINISTRATIVO              | Designar profissionais → clínicas |
| `/admin/relatorios`           | ADMINISTRATIVO              | Relatórios globais                |
| `/medico`                     | MEDICO                      | Dashboard + listar referrals      |
| `/medico/referral/:id`        | MEDICO                      | Detalhe + edição de referral      |
| `/medico/usuarios`            | MEDICO + isAdmin=true       | CRUD de médicos da clínica        |
| `/medico/configuracoes`       | MEDICO + isAdmin=true       | Editar dados da clínica           |
| `/medico/relatorios`          | MEDICO + isAdmin=true       | Relatórios da clínica             |
| `/profissional`               | PROFISSIONAL                | Dashboard + listar meus referrals |
| `/profissional/novo`          | PROFISSIONAL                | Criar novo referral               |
| `/profissional/referral/:id`  | PROFISSIONAL                | Detalhe de meu referral           |
| `/profissional/usuarios`      | PROFISSIONAL + isAdmin=true | CRUD de profissionais do grupo    |
| `/profissional/configuracoes` | PROFISSIONAL + isAdmin=true | Editar dados do grupo             |
| `/profissional/relatorios`    | PROFISSIONAL + isAdmin=true | Relatórios do grupo               |
