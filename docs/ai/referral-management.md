# Documentação - Gestão Administrativa de Encaminhamentos

Esta documentação descreve as regras de negócio, permissões e fluxos para a criação, edição e exclusão de encaminhamentos por usuários com perfil administrativo (`ADMINISTRATIVO`) no sistema `ciso-plataforma-web`.

---

## 1. Regras de Exclusão (DELETE)

A exclusão de encaminhamentos possui comportamentos diferenciados dependendo do papel do usuário no sistema:

1. **Usuários com Perfil Profissional (Criadores ou Membros da Mesma Organização):**
   - Só podem excluir encaminhamentos cujo status seja **`Encaminhado`** (status inicial).
   - Tentativas de exclusão de encaminhamentos nos estados `Agendado` ou `Atendido` retornarão código de erro `400 Bad Request` com a mensagem `"Apenas encaminhamentos com status inicial podem ser excluídos."`.

2. **Usuários com Perfil Administrativo (Administradores):**
   - Podem excluir encaminhamentos nos status **`Encaminhado`** e **`Agendado`** (encaminhamentos não concluídos).
   - **Nenhum usuário**, incluindo administradores, pode excluir encaminhamentos com status **`Atendido`** (concluído). Tentativas de fazer isso retornarão código `400 Bad Request` com a mensagem `"Encaminhamentos concluídos não podem ser excluídos."`. Isso garante a integridade e rastreabilidade do histórico financeiro e clínico.

---

## 2. Regras de Edição (PUT)

Assim como na exclusão, os privilégios de edição variam por papel:

1. **Usuários com Perfil Profissional:**
   - Só podem editar encaminhamentos no status **`Encaminhado`**.
   - Podem atualizar apenas informações do paciente e o núcleo/clínica de destino.

2. **Usuários com Perfil Administrativo:**
   - Podem editar encaminhamentos em **qualquer status** (`Encaminhado`, `Agendado`, `Atendido`).
   - Têm permissão para editar **todos os campos** do registro, incluindo:
     - **Dados do Paciente:** Nome, Data de Nascimento, Telefone, Documento.
     - **Contexto de Destino:** Clínica, Convênio, Núcleo de Atendimento.
     - **Agendamento e Especialidade:** Status, Data do Agendamento, Médico Responsável, Cirurgia Vinculada, Preço da Cirurgia, Conduta e Notas do Especialista.

---

## 3. Regras de Criação (POST)

A criação de encaminhamentos via `POST /api/referrals` possui fluxo distinto dependendo da role da sessão:

1. **Usuários com Perfil Profissional:**
   - O `officeId` (Consultório) e `createdByUserId` (Profissional criador) são inferidos implicitamente a partir dos dados do usuário logado na sessão (`session.user.organizationId` e `session.user.id`).
   - Não é permitido informar estes campos no payload da requisição.

2. **Usuários com Perfil Administrativo:**
   - O administrador **deve obrigatoriamente fornecer** no corpo do JSON da requisição os campos:
     - `officeId` (O ID da organização do tipo `PROFISSIONAL_GROUP` de origem).
     - `createdByUserId` (O ID do usuário do consultório com papel `PROFISSIONAL` sob o qual o encaminhamento será gerado).
   - A API validará se o profissional informado (`createdByUserId`) pertence ao consultório selecionado (`officeId`) e se a role dele é de fato `PROFISSIONAL` antes de salvar.

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

2. **Campos Exclusivos de Edição (Somente no Modal de Edição):**
   - **Status do Encaminhamento**, **Médico Responsável**, **Data de Agendamento**, **Notas do Especialista**, **Conduta** e **Cirurgia/Preço da Cirurgia**.
   - Esses campos são renderizados apenas pelo Modal de Edição do Administrador, pois dependem de privilégios de edição e do estado do atendimento.

3. **Campos Exclusivos de Criação por Administrador (Somente em `/admin/novo`):**
   - **Seleção de Consultório (`officeId`)** e **Seleção de Profissional do Consultório (`createdByUserId`)**.
   - Estes campos não aparecem no formulário do profissional comum (onde são deduzidos da sessão) nem no modal de edição.

Esta abordagem modular evita redundância, garante o cumprimento das regras de negócios específicas de cada perfil e simplifica os schemas Zod de cada view.
