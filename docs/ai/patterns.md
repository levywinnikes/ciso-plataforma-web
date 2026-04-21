# Padroes de Desenvolvimento

Este documento descreve os padroes recorrentes do projeto. A IA deve consultar este arquivo antes de criar qualquer feature nova ou modificar existente.

---

## 1. Modulo de feature (pagina de dashboard)

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

### Regra absoluta

**Nunca colocar texto de interface diretamente no JSX.** Sempre usar chave de traducao.

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

## 4. Componente FormField

Wrapper padrao para campos de formulario com label e mensagem de erro:

```tsx
import { FormField } from "@/components/forms/field";

<FormField label={t("label")} error={form.formState.errors.campo?.message}>
  <Input {...form.register("campo")} />
</FormField>;
```

- `label`: string visivel acima do campo
- `error`: mensagem de erro (string | undefined); renderiza em vermelho se presente
- Children: qualquer componente de input com `forwardRef`

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

---

## 7. Prisma / banco de dados

- Schema em `prisma/schema.prisma`
- Client singleton em `src/lib/prisma.ts` — nunca instanciar `PrismaClient` fora deste arquivo
- Servicos de dados ficam em `src/features/<dominio>/service.ts`
- Tipos de dominio em `src/features/<dominio>/types.ts`

---

## 8. Regras de qualidade (resumo)

- Nenhum texto de UI hardcoded — sempre chave de traducao
- Nenhuma duplicacao de regra de negocio — reutilizar schema existente se aplicavel
- Novos componentes com `forwardRef` quando forem inputs de formulario
- Importacoes ordenadas por `simple-import-sort` (ESLint vai rejeitar se fora de ordem)
- Todo arquivo novo deve ser exportado pelo barrel correspondente (`index.tsx`)
- Rodar `npm run lint` antes de commitar manualmente
