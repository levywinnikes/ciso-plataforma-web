# Padroes de Desenvolvimento

Este documento descreve os padroes recorrentes do projeto. A IA deve consultar este arquivo antes de criar qualquer feature nova ou modificar existente.

---

## 1. Cláusula de Formulários Amigáveis (OBRIGATÓRIO)

**REGRA ABSOLUTA**: É expressamente proibido construir formulários de criação/edição usando estados crus (`useState`) ou agrupar validações no backend de forma genérica (ex: `errors.invalidData`).
Todo formulário deve OBRIGATORIAMENTE utilizar:

- **Zod** para validação (no arquivo `schema.ts`).
- **React Hook Form** (no arquivo `hooks.ts`).
- **Componente `<Field>`** que mostra o erro traduzido embaixo do campo.
- **Backend:** O backend deve sempre responder com chaves de erro granulares (ex: `errors.passwordTooShort`, `errors.nameRequired`).
- **Validação de Duplicatas (P2002):** É estritamente proibido deixar o Prisma falhar com "Unique constraint failed" resultando em erro 500. Sempre faça uma busca prévia (ex: `findUnique`) para campos únicos como E-mail, Documentos, etc. Se existir, retorne um erro mapeado como `errors.emailAlreadyExists`.

---

## 2. Modulo de feature (pagina de dashboard)

Cada pagina de dashboard segue a estrutura:

```
src/app/(dashboard)/<dominio>/
  schema.ts       — Zod schema de validacao do formulario
  hooks.ts        — useForm() com zodResolver, logica de submit
  view.tsx        — Componente cliente com JSX do formulario
  page.tsx        — Server component que importa a view
  __tests__/
    schema.test.ts
    hooks.test.ts
```

### schema.ts

```ts
import { z } from "zod";

export const mySchema = z.object({
  field: z.string().min(1, { message: "errors.required" }),
});

export type MyFormData = z.infer<typeof mySchema>;
```

- Mensagens de erro devem ser chaves de traducao (ex: `"errors.required"`), nunca strings literais em portugues.
- Usar `.refine()` para validacoes cruzadas ou regras de negocio.
- Transformacoes (ex: remover mascara do telefone) via `.transform()`.

### hooks.ts

```ts
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { mySchema, type MyFormData } from "./schema";

export function useMyForm() {
  const form = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
    defaultValues: { field: "" },
  });

  function onSubmit(data: MyFormData) {
    // logica de submit
  }

  return { form, onSubmit };
}
```

### view.tsx

```tsx
"use client";

import { useTranslations } from "next-intl";

import { FormField } from "@/components/forms/field";
import { Button, Input } from "@/components/ui";

import { useMyForm } from "./hooks";

export function MyView() {
  const t = useTranslations("myDomain");
  const { form, onSubmit } = useMyForm();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        label={t("fieldLabel")}
        error={form.formState.errors.field?.message}
      >
        <Input {...form.register("field")} />
      </FormField>
      <Button type="submit">{t("submit")}</Button>
    </form>
  );
}
```

### page.tsx

```tsx
import { MyView } from "./view";

export default function MyPage() {
  return <MyView />;
}
```

---

## 2. Internacionalizacao (i18n)

### Regra absoluta (Responsabilidade da IA)

**Nunca colocar texto de interface diretamente no JSX.** Sempre usar chave de traducao.
**Atualização Proativa:** É OBRIGAÇÃO DA IA atualizar AUTOMATICAMENTE os arquivos `src/i18n/messages/pt-BR.json` e `src/i18n/messages/en-US.json` sempre que introduzir novas chaves de tradução (seja em views, erros de Zod ou retornos da API). O usuário NÃO deve precisar pedir ou lembrar de atualizar as traduções.
**Linguagem Focada no Cliente (Anti-Jargão):** É ESTRITAMENTE PROIBIDO escrever termos técnicos na interface ou nos arquivos de tradução (ex: "CRUD", "JSON", "Endpoint", "Payload"). Use SEMPRE termos de negócio: "Gestão", "Cadastro", "Gerenciamento", "Sistema", etc. A interface não é para programadores.

**Datas na interface (Brasil):** NUNCA exiba data em formato ISO (`YYYY-MM-DD`) ou americano na UI. Sempre use `DD/MM/YYYY` (e hora quando fizer sentido) via `formatDate` / `formatDateTime` (`pt-BR`). ISO pode existir só em API, `type="date"` e banco — nunca como texto visível ao usuário.

### Adicionar nova chave

1. Abrir `src/i18n/messages/pt-BR.json` e `src/i18n/messages/en-US.json`.
2. Adicionar a chave no mesmo namespace em ambos os arquivos.
3. No componente: `const t = useTranslations("namespace")` e usar `t("chave")`.

### Arquivos de mensagens

```
src/i18n/messages/
  pt-BR.json    — Portugues Brasil (locale padrao)
  en-US.json    — Ingles americano
```

### Namespaces existentes

- `common` — textos globais (salvar, cancelar, confirmar, etc.)
- `layout` — header, breadcrumbs
- `sidebar` — itens de navegacao lateral
- `admin` — painel administrativo
- `clinic` — painel da clinica / triagem
- `professional` — painel do profissional
- `newReferral` — formulario de novo encaminhamento
- `financial` — painel financeiro
- `doctor` — painel do medico

---

## 3. Componentes UI

### Importacao

Sempre importar de `@/components/ui` (barrel export via `index.tsx`):

```ts
import { Button, Input, Select, Textarea, Card } from "@/components/ui";
```

### Componentes disponiveis

| Componente       | Arquivo                | Uso                                           |
| ---------------- | ---------------------- | --------------------------------------------- |
| `Button`         | `button.tsx`           | Botoes com variantes                          |
| `Input`          | `input.tsx`            | Campos de texto com forwardRef                |
| `Select`         | `select.tsx`           | Dropdown com forwardRef                       |
| `Textarea`       | `textarea.tsx`         | Area de texto com forwardRef                  |
| `DateInput`      | `date-input.tsx`       | Campo de data com mascara DD/MM/YYYY          |
| `PhoneInput`     | `phone-input.tsx`      | Campo de telefone com mascara (XX) XXXXX-XXXX |
| `Card`           | `card.tsx`             | Container de secao                            |
| `CardSection`    | `card-section.tsx`     | Sub-secao do card                             |
| `Modal`          | `modal.tsx`            | Dialog modal                                  |
| `ConfirmDialog`  | `confirm-dialog.tsx`   | Confirmacao simples (excluir, avisos)         |
| `PageHeader`     | `page-header.tsx`      | Cabecalho de pagina                           |
| `StatCard`       | `stat-card.tsx`        | Card de metrica                               |
| `TableCard`      | `table-card.tsx`       | Card de tabela                                |
| `FileUploadArea` | `file-upload-area.tsx` | Area de upload                                |

### Utilitario de classes

Usar `cn()` de `@/components/ui/utils` para mesclar classes Tailwind condicionalmente:

```ts
import { cn } from "@/components/ui/utils";

<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## 5. Notificações Flutuantes (Toasts)

**Regra Absoluta:** NUNCA crie caixas HTML de erro estáticas (`<div className="bg-red-50">`) para respostas de backend.
Utilize **sempre** o hook inteligente `useAppToast()` que já está integrado ao `next-intl`.

```tsx
import { useAppToast } from "@/hooks/use-app-toast";

export function MyComponent() {
  const toast = useAppToast();

  async function submit() {
    const res = await fetch("/api/endpoint");
    if (!res.ok) {
      toast.error(await extractErrorKey(res)); // Ex: "errors.emailAlreadyExists" (Traduz sozinho)
      return;
    }
    toast.success("Sucesso na operação!"); // String direta também funciona
  }
}
```

---

## 6. Componentes de Formulário (Floating Labels e Obrigatoriedade)

**Regra Absoluta:** O usuário definiu como padrão global de projeto a utilização de **Floating Labels** e **Feedback Visual de Obrigatoriedade**.
NUNCA crie formulários utilizando labels convencionais sobrepostos fora do input ou campos que dependam exclusivamente de `placeholder`.

Sempre utilize o componente `FloatingInput` (ou derivados) englobado no componente `Field` com o `label=""` (vazio) para que o `Field` apenas cuide das mensagens de erro do Zod. Todo campo que for obrigatório no Schema Zod DEVE obrigatoriamente ter a flag `required` no `FloatingInput`.

```tsx
import { Field } from "@/components/forms/field";
import { FloatingInput } from "@/components/ui/floating-input";

<Field label={""} error={tError(form.formState.errors.campo?.message)}>
  <FloatingInput
    required
    label={t("campoPlaceholder")}
    {...form.register("campo")}
  />
</Field>;
```

- `required` no `<FloatingInput>`: Exibe um asterisco vermelho automaticamente na interface para avisar o usuário de antemão que aquele campo é obrigatório (Feedback visual preventivo).
- `label` no `<Field>`: Enviar string vazia `""` para suprimir o label externo.
- `error` no `<Field>`: Mensagem de erro traduzida (ex: Zod). Renderiza em vermelho embaixo do input.
- `label` no `<FloatingInput>`: Texto do label flutuante interno (flutua e diminui quando selecionado/preenchido).

---

## 5. Testes

### Estrutura

```
src/app/(dashboard)/<dominio>/__tests__/
  schema.test.ts   — testa casos validos e invalidos do Zod schema
  hooks.test.ts    — testa comportamento do hook (submit, reset, etc.)
```

### Padrao de schema test

```ts
import { mySchema } from "../schema";

describe("mySchema", () => {
  it("valida campos obrigatorios", () => {
    const result = mySchema.safeParse({ field: "" });
    expect(result.success).toBe(false);
  });

  it("aceita dados validos", () => {
    const result = mySchema.safeParse({ field: "valor" });
    expect(result.success).toBe(true);
  });
});
```

### Padrao de hook test

```ts
import { renderHook, act } from "@testing-library/react";
import { useMyForm } from "../hooks";

describe("useMyForm", () => {
  it("inicializa com valores padrao", () => {
    const { result } = renderHook(() => useMyForm());
    expect(result.current.form.getValues()).toEqual({ field: "" });
  });
});
```

---

## 6. Variaveis de ambiente

Todas as env vars sao validadas via Zod em `src/env.ts`. Nunca usar `process.env.VARIAVEL` diretamente nos modulos — importar sempre de `src/env.ts`:

```ts
import { env } from "@/env";

const db = new PrismaClient({ datasourceUrl: env.DATABASE_URL });
```

Adicionar nova env var: atualizar `src/env.ts` (schema Zod) e `.env.example`.

### DigitalOcean Spaces (arquivos)

Uploads de documentos usam Spaces (API compativel com S3):

- `DO_SPACES_ENDPOINT` — ex: `https://nyc3.digitaloceanspaces.com`
- `DO_SPACES_REGION` — ex: `nyc3`
- `DO_SPACES_BUCKET` — nome do bucket
- `DO_SPACES_KEY` / `DO_SPACES_SECRET` — credenciais
- `DO_SPACES_FOLDER` — prefixo dos objetos (padrao: `integravisao`)

Padrao de implementacao:

1. Cliente envia o arquivo para `POST /api/uploads` (`multipart/form-data`).
2. Servidor grava em `integravisao/YYYY/MM/{uuid}-{nome}` com ACL privada.
3. Banco persiste a **chave** do objeto no campo `url` de `ReferralDocument` / `ReferralAttachment`.
4. Na leitura, a API devolve URL assinada temporaria para download.
5. Reutilize `src/lib/storage.ts` e `src/lib/upload-client.ts` + componente `<FileUploadArea>`.

---

## 7. Prisma / banco de dados

- Schema em `prisma/schema.prisma`
- Client singleton em `src/lib/prisma.ts` — nunca instanciar `PrismaClient` fora deste arquivo
- Servicos de dados ficam em `src/features/<dominio>/service.ts`
- Tipos de dominio em `src/features/<dominio>/types.ts`

---

## 7. Padrão de UX Híbrido (Loadings e Transições)

Sempre garanta que ações assíncronas do usuário forneçam feedback visual elegante sem congelar a tela.

- **Loading Inicial (Skeleton):** Durante o `fetch` inicial das tabelas ou listagens da tela, utilize o `<Skeleton>` do Shadcn UI/Componentes customizados reproduzindo fielmente as linhas da tabela (nunca exiba "vazio" ou esconda a tabela).
- **Ações Individuais (Botões):** Botões de "Salvar", "Criar" ou "Avançar" devem implementar a flag `isLoading={true}` quando uma operação de banco de dados for disparada, acionando o Spinner nativo do botão.
- **Operações Globais/Página:** Utilize a `<OverlayLoader>` (Opacidade Full-Screen) apenas em processos que afetam o contexto global (como mudança de empresa ou relatórios complexos).
- **Barra de Progresso (TopLoader):** A navegação entre as páginas via Menu ou rotas do Next.js já está automaticamente coberta pelo `NextTopLoader`.

## 8. Componentes Inteligentes e Reutilizáveis (Sem Hardcode)

É estritamente proibido criar lógicas visuais ou formatações complexas diretamente na "raíz" da tela (`page.tsx` ou `view.tsx`).

- **Componentes de Input Genéricos:** Todo elemento de input, máscara ou layout que possa ser reaproveitado deve ficar encapsulado em `src/components/ui/` (ex: `FloatingInput`).
- **Máscaras Nativas:** Em vez de instalar pacotes de terceiros pesados para formatar strings, crie a inteligência no próprio componente reutilizável (ex: a prop `mask="cnpj"` ou `mask="phone"` no `FloatingInput`).
- **Não polua o código mestre:** Deixe o código mestre (o arquivo principal da tela) responsável apenas pela injeção do componente genérico através do React Hook Form. Isso garante uniformidade de UI/UX em todo o projeto.

---

## 9. Traducao de erros de Zod com `useFormError`

Schemas Zod sao executados fora do contexto React, entao nao podem chamar `useTranslations`. Padrao:

1. Em `schema.ts`, gravar **chaves** como mensagem: `z.string().min(1, { message: "errors.nameRequired" })`.
2. Em `view.tsx`, traduzir no momento da renderizacao com o hook `useFormError`:

```tsx
import { useFormError } from "@/i18n/use-form-error";

export function MyView() {
  const tError = useFormError();
  // ...
  return (
    <Field error={tError(form.formState.errors.name?.message)}>
      <Input {...form.register("name")} />
    </Field>
  );
}
```

`useFormError` retorna uma funcao tolerante: se a chave nao existir, devolve a string original (fallback seguro).

---

## 10. Handlers de API (resumo — ver checklist completo)

Toda rota em `src/app/api/**` segue obrigatoriamente:

```ts
import { apiError, requireAdministrativo } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdministrativo();
  if ("error" in auth) return auth.error;
  // ...
  if (!parsed.success) return apiError("errors.invalidXxxData", 400);
}
```

Detalhes obrigatorios em [`docs/ai/security-checklist.md`](./security-checklist.md).

---

## 11. Estado de loading e erro em paginas que consomem API

**REGRA ABSOLUTA**: "Erros tímidos" (silent failures) são terminantemente proibidos. Nunca faça um `if (!response.ok) return;` sem avisar o usuário. Tudo o que der erro no sistema deve exibir uma mensagem visual clara (alert box, toast) usando os arquivos de tradução.

Componentes que chamam `fetch` para `/api/**` devem expor erro ao usuario via mensagem i18n:

```tsx
const [errorMessage, setErrorMessage] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const tError = useFormError();

async function submit() {
  setErrorMessage(null);
  setIsSubmitting(true);
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setErrorMessage(body.error ?? "errors.genericRequestFailed");
      return;
    }
    // ...
  } finally {
    setIsSubmitting(false);
  }
}

return (
  <>
    {errorMessage ? (
      <div role="alert" className="...">
        {tError(errorMessage)}
      </div>
    ) : null}
    <Button disabled={isSubmitting}>
      {isSubmitting ? common("saving") : common("save")}
    </Button>
  </>
);
```

Mensagens de loading devem usar `common.loading` e `common.saving` (ja existentes em ambos os JSONs).

---

## 12. Assistente / chat com IA (vigente no piloto admin)

Padrão de projeto:

1. Chamada ao modelo **somente no servidor**; chave nunca no cliente (`src/lib/ai/gemini.ts`).
2. Autorização explícita por papel (`requireAdministrativo` no piloto).
3. Provedor: **Gemini**, com fallback **apenas entre modelos Gemini** (Flash → Flash 2.0 → flash-lite). **Proibido DeepSeek**.
4. UI: widget `AssistantWidget`, linguagem de negócio + i18n; erros visíveis (`patterns.md` §11).
5. Pergunta do chat: Zod + React Hook Form + `<Field>` (`src/features/assistant`).
6. Histórico só na sessão do navegador. Limite **200 perguntas/dia**, contado no servidor (`AssistantDailyUsage`).
7. Papel `ADMINISTRATIVO`: sem recusa/máscara do texto da pergunta. Outros papéis exigem contrato próprio **antes** de implementar.
8. Números: o modelo monta uma **consulta** (recorte/quebra); o servidor agrega (`consulta-engine.ts`). Não usar relatório fixo nem `GET /api/referrals` no modelo.

---

## 13. Confirmação de atendimento (admin)

Para concluir encaminhamento pela listagem administrativa, usar `MarkAttendedDialog` (`src/features/referrals/components/mark-attended-dialog.tsx`): modal com resumo dos dados + confirmação. Não substitui o `ConfirmDialog` genérico de exclusão.
