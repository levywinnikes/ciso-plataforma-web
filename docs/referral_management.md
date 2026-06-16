# Documentação - Gestão Administrativa de Encaminhamentos

Esta documentação descreve as regras de negócio, permissões e fluxos para a edição e exclusão de encaminhamentos por usuários com perfil administrativo (`ADMINISTRATIVO`) no sistema `ciso-plataforma-web`.

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

## 3. Fluxo de Atualização de Dados (API `/api/referrals/[id]`)

Quando um administrador atualiza o núcleo de atendimento (`nucleusId`), a API busca o núcleo correspondente e atualiza os campos de snapshot do encaminhamento para refletir os novos valores contratados:

- `nucleusSnapshotName`: Nome do núcleo.
- `nucleusSnapshotPrice`: Preço cobrado no núcleo.
- `nucleusSnapshotServices`: Lista de serviços pertencentes ao núcleo no momento da alteração.

Isso preserva a consistência do faturamento e garante que o histórico de preços não mude retroativamente caso o núcleo global seja alterado posteriormente.
