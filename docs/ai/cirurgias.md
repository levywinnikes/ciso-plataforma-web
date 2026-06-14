# Documentação de Integração: Módulo de Cirurgias / Operações

Este documento descreve detalhadamente os requisitos, especificações técnicas e as alterações necessárias para implementar o cadastro de cirurgias e o vínculo destas com valor customizável aos encaminhamentos da clínica.

---

## 1. Alterações no Banco de Dados (Prisma Schema)

Para armazenar a tabela de cirurgias de referência e registrá-las nos encaminhamentos quando indicadas pelo médico, faremos as seguintes adições no arquivo [schema.prisma](file:///c:/Users/kifit/OneDrive/Documentos/GitHub/ciso-plataforma-web/prisma/schema.prisma):

### Novo Modelo: `Surgery` (Cirurgia / Operação)

Representa um procedimento cirúrgico cadastrado na plataforma global com seu valor padrão de referência.

- **id**: String (`@id`, `@default(cuid())`)
- **name**: String (Único, obrigatório)
- **defaultPrice**: Decimal (`@db.Decimal(10, 2)`, obrigatório)
- **active**: Boolean (`@default(true)`)
- **createdAt**: DateTime (`@default(now())`)
- **updatedAt**: DateTime (`@updatedAt`)
- **referrals**: Relação bidirecional com `Referral`

### Alterações no Modelo: `Referral`

Adicionar os campos opcionais para vincular uma cirurgia indicada e o valor final cobrado/acordado para aquele encaminhamento específico:

- **surgeryId**: String (FK opcional para `Surgery.id`)
- **surgery**: Surgery (Relação opcional)
- **surgeryPrice**: Decimal (`@db.Decimal(10, 2)`, opcional) — Permite gravar o preço final com ou sem alteração do valor padrão do cadastro.

---

## 2. API Endpoints a serem criados/alterados

### `/api/surgeries`

- **GET /api/surgeries**: Retorna a lista de todas as cirurgias cadastradas.
  - _Acesso_: Qualquer usuário autenticado (médicos para selecionar, administradores para gerenciar).
  - _Query Params_: `?active=true` para retornar apenas ativas.
- **POST /api/surgeries**: Cadastra uma nova cirurgia.
  - _Acesso_: Apenas ADMINISTRATIVO.
  - _Validação_: Exige `name` único e `defaultPrice` positivo.

### `/api/surgeries/[id]`

- **PATCH /api/surgeries/[id]**: Atualiza dados da cirurgia (nome, valor padrão, ativo).
  - _Acesso_: Apenas ADMINISTRATIVO.
- **DELETE /api/surgeries/[id]**: Exclui uma cirurgia.
  - _Acesso_: Apenas ADMINISTRATIVO.

### Alteração em `/api/referrals/[id]` (Fluxo de Atendimento do Médico)

- **PATCH /api/referrals/[id]**: Atualizado para suportar a gravação de `surgeryId` (opcional) e `surgeryPrice` (opcional) no banco de dados quando o médico preencher o laudo de atendimento.

---

## 3. Interfaces de Usuário (Frontend)

### 3.1. Tela de Cadastro de Cirurgias (Painel Admin)

Criar a página no caminho `src/app/(dashboard)/admin/cirurgias` contendo:

- **Tabela de listagem**: Exibe Nome, Preço Padrão, Status Ativo/Inativo e Ações.
- **Modais de Criação e Edição**: Formulário contendo Nome (FloatingInput required) e Preço Padrão (FloatingInput required, tipo numérico), e checkbox de Ativo.
- Mapeamento de arquivos:
  - `src/app/(dashboard)/admin/cirurgias/schema.ts` (Zod schema).
  - `src/app/(dashboard)/admin/cirurgias/hooks.ts` (hooks de CRUD).
  - `src/app/(dashboard)/admin/cirurgias/view.tsx` (componente visual da tabela/modal).
  - `src/app/(dashboard)/admin/cirurgias/page.tsx` (página Next.js).

### 3.2. Form de Laudo Médico / Triagem (Painel do Médico)

No formulário de conduta médica (`src/features/referrals/components/medical-conduct-form.tsx`):

- Buscar todas as cirurgias ativas (`/api/surgeries?active=true`) no hook e passá-las como opções para um novo campo Select: **"Indicação Cirúrgica (Opcional)"**.
- Adicionar um campo de entrada numérica ao lado ou abaixo: **"Valor da Cirurgia"**.
- **Comportamento reativo**:
  - Quando o médico selecionar uma cirurgia, o campo "Valor da Cirurgia" é automaticamente pré-preenchido com o `defaultPrice` daquela cirurgia.
  - O médico poderá alterar livremente o valor preenchido no input de preço.
  - Se a cirurgia for desmarcada (selecionando a opção vazia), limpar e desabilitar o input de preço.
- **Modo Somente Leitura**: Se o encaminhamento já estiver com status "Atendido", renderizar os campos bloqueados exibindo apenas a cirurgia selecionada e o valor final acordado.

### 3.3. Exibição no Prontuário / Dashboard

- Se o encaminhamento tiver cirurgia associada, exibir a informação **"Indicação Cirúrgica: [Nome da Cirurgia] - Valor: R$ [Valor final]"** na visualização de detalhes do encaminhamento.

---

## 4. Chaves de Tradução (i18n)

### `pt-BR.json`

```json
{
  "adminGlobal": {
    "surgeries": {
      "title": "Gestão de Cirurgias",
      "subtitle": "Cadastre procedimentos cirúrgicos e seus valores de referência",
      "newSurgery": "Nova Cirurgia",
      "listTitle": "Cirurgias Cadastradas",
      "namePlaceholder": "Nome da Cirurgia",
      "pricePlaceholder": "Valor Padrão",
      "colName": "Procedimento",
      "colPrice": "Preço Padrão",
      "colStatus": "Status",
      "colActions": "Ações",
      "createAction": "Cadastrar Cirurgia",
      "editTitle": "Editar Cirurgia",
      "deleteAction": "Excluir",
      "confirmDelete": "Deseja excluir esta cirurgia?",
      "surgeryCreatedSuccess": "Cirurgia cadastrada com sucesso!",
      "surgeryUpdatedSuccess": "Cirurgia atualizada com sucesso!",
      "surgeryDeletedSuccess": "Cirurgia excluída com sucesso!"
    }
  },
  "sidebar": {
    "nav": {
      "surgeries": "Gestão de Cirurgias"
    }
  },
  "medicalConduct": {
    "surgeryIndicationLabel": "Indicação Cirúrgica (Opcional)",
    "surgeryPriceLabel": "Valor do Procedimento",
    "selectSurgery": "Selecione a cirurgia..."
  },
  "errors": {
    "surgeryNameRequired": "O nome da cirurgia é obrigatório.",
    "surgeryPriceInvalid": "Insira um valor de cirurgia válido."
  }
}
```
