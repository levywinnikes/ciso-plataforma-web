# Documentação de Integração: Gestão de Convênios

Este documento descreve detalhadamente os requisitos, especificações técnicas e as alterações necessárias no banco de dados, APIs e telas para implementar o fluxo de convênios na plataforma.

---

## 1. Alterações no Banco de Dados (Prisma Schema)

Para suportar o cadastro de convênios, a associação com clínicas e a atribuição no encaminhamento (Referral), o arquivo [schema.prisma](file:///c:/Users/kifit/OneDrive/Documentos/GitHub/ciso-plataforma-web/prisma/schema.prisma) precisará das seguintes atualizações:

### Novo Modelo: `Agreement`

Representa um convênio de saúde cadastrado no sistema.

- **id**: String (`@id`, `@default(cuid())`)
- **name**: String (Único, obrigatório)
- **active**: Boolean (`@default(true)`)
- **createdAt**: DateTime (`@default(now())`)
- **updatedAt**: DateTime (`@updatedAt`)
- **clinics**: Relação bidirecional com a tabela intermediária `OrganizationAgreement`
- **referrals**: Relação bidirecional com `Referral`

### Novo Modelo: `OrganizationAgreement` (M-N entre Clínica e Convênio)

Associa uma clínica (`Organization` do tipo `CLINICA`) a um ou mais convênios.

- **id**: String (`@id`, `@default(cuid())`)
- **clinicId**: String (FK para `Organization.id`)
- **agreementId**: String (FK para `Agreement.id`)
- **createdAt**: DateTime (`@default(now())`)
- Restrição: Par `[clinicId, agreementId]` deve ser único (`@@unique`).

### Alteração no Modelo: `Organization`

Adicionar a relação com os convênios associados:

```prisma
agreements OrganizationAgreement[]
```

### Alteração no Modelo: `Referral`

Adicionar o campo e a relação opcional com o convênio selecionado no momento do encaminhamento:

```prisma
agreementId String?
agreement   Agreement? @relation(fields: [agreementId], references: [id])
```

---

## 2. API Endpoints a serem criados/alterados

De acordo com as regras de autorização em [api-routes.md](file:///c:/Users/kifit/OneDrive/Documentos/GitHub/ciso-plataforma-web/docs/ai/api-routes.md) e o checklist de segurança:

### `/api/agreements`

- **GET /api/agreements**: Retorna todos os convênios (ou apenas os ativos com query param `?active=true`).
  - _Acesso_: Qualquer usuário autenticado (ADMINISTRATIVO para gerenciar, PROFISSIONAL para selecionar, MEDICO para visualizar).
- **POST /api/agreements**: Cria um novo convênio.
  - _Acesso_: Apenas ADMINISTRATIVO.
  - _Validação_: Zod schema exigindo `name`. Nome deve ser único no banco.

### `/api/agreements/[id]`

- **PATCH /api/agreements/[id]**: Atualiza dados de um convênio (nome, status ativo/inativo).
  - _Acesso_: Apenas ADMINISTRATIVO.
- **DELETE /api/agreements/[id]**: Remove um convênio.
  - _Acesso_: Apenas ADMINISTRATIVO.

### Alteração em `/api/organizations/[id]` (Clínica)

- **PATCH /api/organizations/[id]**: Permitir receber uma lista de IDs de convênios (`agreementIds: string[]`) no payload para associar à clínica.
  - _Implementação_: Deletar associações antigas no `OrganizationAgreement` e inserir as novas relações de forma atômica utilizando Prisma `$transaction`.

### Alteração em `/api/referrals/clinics` (Filtro de Convênios por Clínica)

- Garantir que as clínicas retornadas para o profissional incluam seus convênios ativos associados via `include: { agreements: { include: { agreement: true } } }` para permitir ao frontend preencher o select de convênios.

### Alteração em `/api/referrals`

- **GET /api/referrals** e **GET /api/referrals/[id]**: Incluir o convênio no retorno dos dados do encaminhamento:
  - `include: { agreement: true }`
- **POST /api/referrals**: Aceitar `agreementId` opcional no payload e validar se, caso enviado, o convênio está ativo e de fato associado à clínica selecionada (`clinicId`).

---

## 3. Interfaces de Usuário (Frontend)

As telas devem ser criadas e estendidas seguindo estritamente a cláusula de formulários, i18n e floating labels do projeto.

### 3.1. Tela de Cadastro de Convênio (Painel Admin)

Criar a página no caminho `src/app/(dashboard)/admin/convenios`:

- **Página principal**: Exibe uma tabela (utilizando `<TableCard>` e `<TableShell>`) com os convênios cadastrados (Nome, Status ativo/inativo, Ações).
- **Formulário de cadastro**: Seguir o padrão de `<CardSection>` com `<Field>` e `<FloatingInput>` contendo `required` apenas no campo Nome.
- **Formulário de edição**: Utilizar um `<Modal>` contendo o formulário de edição de convênio.
- Mapeamento de arquivos:
  - `src/app/(dashboard)/admin/convenios/schema.ts` (validação com Zod).
  - `src/app/(dashboard)/admin/convenios/hooks.ts` (estados e fetchs).
  - `src/app/(dashboard)/admin/convenios/view.tsx` (componente cliente).
  - `src/app/(dashboard)/admin/convenios/page.tsx` (server component que renderiza a view).

### 3.2. Associação de Convênios na Clínica (Painel Admin)

No modal/formulário de edição de clínica (`src/features/admin/components/organization-management-page.tsx`):

- Adicionar um componente de multiseleção (ou uma lista de checkboxes elegantes) contendo todos os convênios ativos cadastrados no sistema.
- Permitir ao administrador associar um ou mais convênios a essa clínica.
- Ao salvar a clínica, enviar a lista de `agreementIds` selecionados no payload da requisição PATCH.

### 3.3. Seleção de Convênio no Encaminhamento (Consultório/Profissional)

Na página de novo encaminhamento (`src/app/(dashboard)/profissional/novo/view.tsx` e `src/app/(dashboard)/profissional/novo/hooks.ts`):

- Adicionar um select logo abaixo do select de Clínica para escolher o convênio.
- Opções disponíveis no select de convênios:
  - `"sem convênio"` (valor vazio ou id nulo).
  - Lista de convênios ativos que estão associados à clínica selecionada no select acima.
- **Logica de reatividade**: Quando o select da clínica for alterado, atualizar as opções do select de convênios. Se a nova clínica não aceitar o convênio selecionado anteriormente (ou não tiver nenhum), resetar o valor do select de convênios para "sem convênio".

### 3.4. Exibição do Convênio no Prontuário/Encaminhamento (Clínica)

No componente de exibição do encaminhamento utilizado pela clínica (`src/features/referrals/components/patient-record.tsx`):

- Adicionar um campo na seção de Informações do Encaminhamento/Paciente para exibir o convênio selecionado.
- Se o encaminhamento tiver `agreementName` (ou `agreement.name`), exibir o nome do convênio. Caso contrário, exibir "Sem convênio".

---

## 4. Chaves de Tradução (i18n)

Adicionar as novas chaves nos arquivos `src/i18n/messages/pt-BR.json` e `src/i18n/messages/en-US.json`:

```json
{
  "adminGlobal": {
    "agreements": {
      "title": "Convênios",
      "subtitle": "Gerencie os convênios parceiros aceitos pelas clínicas",
      "createTitle": "Cadastrar Novo Convênio",
      "listTitle": "Convênios Cadastrados",
      "namePlaceholder": "Nome do Convênio",
      "activeLabel": "Ativo",
      "colName": "Nome",
      "colStatus": "Status",
      "colActions": "Ações",
      "createAction": "Cadastrar Convênio",
      "editAction": "Editar",
      "deleteAction": "Excluir",
      "confirmDelete": "Tem certeza que deseja excluir este convênio?",
      "agreementCreatedSuccess": "Convênio cadastrado com sucesso!",
      "agreementUpdatedSuccess": "Convênio atualizado com sucesso!",
      "agreementDeletedSuccess": "Convênio excluído com sucesso!"
    }
  },
  "newReferral": {
    "selectAgreement": "Selecione o Convênio",
    "noAgreement": "Sem convênio"
  },
  "patientRecord": {
    "agreementLabel": "Convênio"
  },
  "errors": {
    "agreementNameRequired": "O nome do convênio é obrigatório",
    "agreementNameUnique": "Já existe um convênio cadastrado com este nome"
  }
}
```
