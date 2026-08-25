# Documentação - Gestão Administrativa de Encaminhamentos

Esta documentação descreve as regras de negócio, permissões e fluxos para a criação, edição e exclusão de encaminhamentos por usuários com perfil administrativo (`ADMINISTRATIVO`) no sistema `ciso-plataforma-web`.

---

## 0. Status do Encaminhamento

### Valores de `ReferralStatus`

| Status        | Significado                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| `Bloqueado`   | Registro salvo sem liberar para a clínica (ex.: paciente ainda não confirmou horário). |
| `Encaminhado` | Status inicial padrão; visível no fluxo operacional (ainda não agendado).              |
| `Agendado`    | Triagem administrativa concluída (data + médico).                                      |
| `Atendido`    | Atendimento concluído (“finalizado”).                                                  |

Ciclo operacional padrão: **`Encaminhado` → `Agendado` → `Atendido`**.

`Bloqueado` é um estado paralelo de rascunho operacional: o encaminhamento existe, mas **não entra no fluxo da clínica** até alguém (consultório vinculado ou administrativo) alterar o status para um estado liberado (em geral `Encaminhado`).

### Status “não finalizado”

Consideram-se **não finalizados**: `Bloqueado`, `Encaminhado` e `Agendado`.  
`Atendido` é o status concluído.

---

## 0.1 Status `Bloqueado` (especificação)

### Razão de existência

Muitas vezes o consultório ou o administrador só quer registrar o encaminhamento sem “fechar” o envio, porque ainda faltam decisões com o paciente (ex.: horário). O status `Bloqueado` permite salvar o registro e retomá-lo depois, sem expor o caso à clínica.

### Quem pode criar / definir

- **PROFISSIONAL (consultório)** e **ADMINISTRATIVO** podem:
  - criar um encaminhamento já com status `Bloqueado` (opcional); ou
  - editar um encaminhamento **não finalizado** e alterá-lo para `Bloqueado`.
- Perfil de **clínica / médico (`MEDICO`)** **não** cria nem altera para `Bloqueado`.

### Campo `justificativaBloqueio` (obrigatório quando `Bloqueado`)

- Ao selecionar status `Bloqueado` (criação ou edição), a UI abre um campo obrigatório **Justificativa**.
- Exemplos esperados: `"Cliente ainda não decidiu horário"`.
- Validação: string não vazia; teto técnico sugerido de **500 caracteres** (mensagens curtas).
- Quando o status deixa de ser `Bloqueado`, a justificativa atual pode permanecer no registro para consulta, mas novas mudanças de status devem ser registradas na auditoria (ver abaixo).

### Visibilidade

| Perfil                                                                                  | Vê encaminhamentos `Bloqueado`?                                       | Pode editar / desbloquear?                                                                                    |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Clínica / Médico (`MEDICO`)                                                             | **Não** — não listar, não detalhar, não contar em métricas da clínica | Não                                                                                                           |
| Consultório vinculado (`PROFISSIONAL` do mesmo office / criador conforme regras atuais) | **Sim**                                                               | **Sim** — editar dados permitidos e alterar status (ex.: para `Encaminhado`) para a clínica passar a enxergar |
| Administrativo (`ADMINISTRATIVO`)                                                       | **Sim**                                                               | **Sim**                                                                                                       |

A filtragem de visibilidade deve ser aplicada na **API** (não só na UI).

### UI sugerida

- Nas telas de listagem de **consultório** (`/profissional`) e **administrativo** (`/admin`): aba (ou filtro dedicado) **Bloqueados**, separada dos demais status.
- A clínica **não** ganha aba de bloqueados.

### Transições relevantes

- `Bloqueado` → `Encaminhado` (ou outro status permitido pelo papel): libera o encaminhamento para o fluxo normal; a clínica passa a poder vê-lo quando aplicável às regras atuais de listagem da clínica.
- Não é permitido mover um encaminhamento `Atendido` para `Bloqueado`.
- Agendamento (`PATCH .../schedule`) e conclusão de atendimento (`complete` → `Atendido`) **não** se aplicam enquanto o status for `Bloqueado`.

### Atraso (data do agendamento)

Um encaminhamento é **atrasado** quando:

- tem `appointmentDate`
- o **dia civil** do agendamento (fuso local) é **anterior ao dia de hoje**
- o status **não** é `Atendido`

Atrasados **continuam na aba Ativos**. Há uma aba extra só com atrasados. O destaque visual (faixa à esquerda, fundo rosado, selo) aparece em qualquer lista onde o item esteja atrasado.

### Calendário de agendamentos (dashboards)

- Só entram encaminhamentos com **`appointmentDate` preenchido**
- Agrupamento por **dia civil** local (mesma base do atraso)
- Somente leitura no v1; remarcar/agendar continua pelo fluxo administrativo existente
- Presente em `/admin`, `/medico` e `/profissional`

### Marcar como atendido (administrativo)

Em `/admin`, o administrador pode concluir `Encaminhado` ou `Agendado` pelo ícone de concluir na coluna de ações (rótulo **Marcar como atendido** ao passar o mouse), com modal de confirmação dos dados. A API é `PATCH /api/referrals/:id/complete` (`requireAdministrativo`), com auditoria de status. Não vale para `Bloqueado` nem para quem já está `Atendido`.

### Relatórios e financeiro

- Por padrão, encaminhamentos `Bloqueado` **não entram** em relatórios/métricas/financeiro (não foram finalizados / não estão no fluxo operacional).
- Só devem aparecer se existir um **filtro explícito** do tipo “incluir bloqueados”.

### Auditoria

Quanto mais rastreabilidade, melhor. Toda mudança de status envolvendo `Bloqueado` (entrar ou sair), bem como a justificativa usada, deve gerar registro de auditoria com no mínimo:

- `referralId`
- status anterior → status novo
- `justificativaBloqueio` (quando aplicável)
- `userId` / papel
- `createdAt`

---

## 1. Regras de Exclusão (DELETE)

A exclusão de encaminhamentos possui comportamentos diferenciados dependendo do papel do usuário no sistema:

1. **Usuários com Perfil Profissional (Criadores ou Membros da Mesma Organização):**
   - Só podem excluir encaminhamentos cujo status seja **`Encaminhado`** ou **`Bloqueado`** (ainda não entraram no fluxo da clínica / não agendados).
   - Tentativas de exclusão de encaminhamentos nos estados `Agendado` ou `Atendido` retornarão código de erro `400 Bad Request` com a mensagem `"Apenas encaminhamentos com status inicial podem ser excluídos."`.

2. **Usuários com Perfil Administrativo (Administradores):**
   - Podem excluir encaminhamentos nos status **`Bloqueado`**, **`Encaminhado`** e **`Agendado`** (encaminhamentos não concluídos).
   - **Nenhum usuário**, incluindo administradores, pode excluir encaminhamentos com status **`Atendido`** (concluído). Tentativas de fazer isso retornarão código `400 Bad Request` com a mensagem `"Encaminhamentos concluídos não podem ser excluídos."`. Isso garante a integridade e rastreabilidade do histórico financeiro e clínico.

---

## 2. Regras de Edição (PUT)

Assim como na exclusão, os privilégios de edição variam por papel:

1. **Usuários com Perfil Profissional:**
   - Podem editar encaminhamentos nos status **`Encaminhado`** e **`Bloqueado`**.
   - Podem atualizar informações do paciente, núcleo/clínica de destino, status (`Encaminhado` ↔ `Bloqueado`) e `justificativaBloqueio` quando aplicável.
   - Não podem editar após `Agendado` / `Atendido`.

2. **Usuários com Perfil Administrativo:**
   - Podem editar encaminhamentos em **qualquer status** (`Bloqueado`, `Encaminhado`, `Agendado`, `Atendido`), respeitando a regra de não usar `Bloqueado` a partir de `Atendido`.
   - Têm permissão para editar **todos os campos** do registro, incluindo:
     - **Dados do Paciente:** Nome, Data de Nascimento, Telefone, Documento.
     - **Contexto de Destino:** Clínica, Convênio, Núcleo de Atendimento.
     - **Agendamento e Especialidade:** Status, Justificativa de Bloqueio, Data do Agendamento, Médico Responsável, Cirurgia Vinculada, Preço da Cirurgia, Conduta e Notas do Especialista.

---

## 3. Regras de Criação (POST)

A criação de encaminhamentos via `POST /api/referrals` possui fluxo distinto dependendo da role da sessão:

1. **Usuários com Perfil Profissional:**
   - O `officeId` (Consultório) e `createdByUserId` (Profissional criador) são inferidos implicitamente a partir dos dados do usuário logado na sessão (`session.user.organizationId` e `session.user.id`).
   - Não é permitido informar estes campos no payload da requisição.
   - Podem informar opcionalmente `status: "Bloqueado"` + `justificativaBloqueio` (obrigatória nesse caso). Se omitido, o default continua `Encaminhado`.

2. **Usuários com Perfil Administrativo:**
   - O administrador **deve obrigatoriamente fornecer** no corpo do JSON da requisição os campos:
     - `officeId` (O ID da organização do tipo `PROFISSIONAL_GROUP` de origem).
     - `createdByUserId` (O ID do usuário do consultório com papel `PROFISSIONAL` sob o qual o encaminhamento será gerado).
   - A API validará se o profissional informado (`createdByUserId`) pertence ao consultório selecionado (`officeId`) e se a role dele é de fato `PROFISSIONAL` antes de salvar.
   - Também podem criar já como `Bloqueado` com `justificativaBloqueio` obrigatória.

---

## 4. Fluxo de Atualização de Dados (API `/api/referrals/[id]`)

Quando um administrador ou profissional atualiza o núcleo de atendimento (`nucleusId`), a API busca o núcleo correspondente e atualiza os campos de snapshot do encaminhamento para refletir os novos valores contratados:

- `nucleusSnapshotName`: Nome do núcleo.
- `nucleusSnapshotPrice`: Preço cobrado no núcleo.
- `nucleusSnapshotServices`: Lista de serviços pertencentes ao núcleo no momento da alteração.

Isso preserva a consistência do faturamento e garante que o histórico de preços não mude retroativamente caso o núcleo global seja alterado posteriormente.

---

## 5. Arquitetura de Componentes de Formulários (Abordagem A)

Para garantir reutilização de código e facilidade de manutenção sem inflar os formulários com condicionais complexas, os fluxos de **Novo Encaminhamento** e **Editar Encaminhamento** compartilham componentes de seção específicos, em vez de unificar o formulário inteiro.

### Diretrizes de Separação de Responsabilidades:

1. **Campos Compartilhados (Componentizados individualmente em `/features/referrals/components/`):**
   - **`PatientFormFields`**: Agrupa nome, data de nascimento, telefone e documento do paciente. Recebe o objeto do `form` para registrar os inputs com `FloatingInput` e validar com `Field`.
   - **`ClinicalInfoFields`**: Agrupa doenças sistêmicas e observações/queixas clínicas.
   - **`NucleusSelectionFields`**: Agrupa a seleção de clínica, convênio (filtrado) e núcleo de atendimento, além do resumo de preços dinâmico do núcleo selecionado.

2. **Campos de Status Bloqueado (Criação e Edição — consultório e admin):**
   - Seleção opcional de status `Bloqueado` (default continua `Encaminhado` na criação).
   - Campo **Justificativa** (`justificativaBloqueio`) exibido e obrigatório somente quando o status selecionado for `Bloqueado`.

3. **Campos Exclusivos de Edição (Somente no Modal de Edição):**
   - **Status do Encaminhamento**, **Médico Responsável**, **Data de Agendamento**, **Notas do Especialista**, **Conduta** e **Cirurgia/Preço da Cirurgia**.
   - Esses campos são renderizados apenas pelo Modal de Edição do Administrador (exceto a troca `Encaminhado` ↔ `Bloqueado` + justificativa, também disponível ao profissional), pois dependem de privilégios de edição e do estado do atendimento.

4. **Campos Exclusivos de Criação por Administrador (Somente em `/admin/novo`):**
   - **Seleção de Consultório (`officeId`)** e **Seleção de Profissional do Consultório (`createdByUserId`)**.
   - Estes campos não aparecem no formulário do profissional comum (onde são deduzidos da sessão) nem no modal de edição.

Esta abordagem modular evita redundância, garante o cumprimento das regras de negócios específicas de cada perfil e simplifica os schemas Zod de cada view.
