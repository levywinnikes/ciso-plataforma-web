# CISO Plataforma Web

Plataforma para fluxo completo de encaminhamentos oftalmologicos com perfis separados por tipo de conta:

- Administrativo
- Clinica (triagem)
- Medico especialista
- Profissional

## Tech Stack

| Camada              | Tecnologia                              |
| ------------------- | --------------------------------------- |
| Framework           | Next.js 13.5.6 (App Router)             |
| Linguagem           | TypeScript 5                            |
| Estilo              | Tailwind CSS                            |
| Formularios         | React Hook Form + Zod                   |
| Internacionalizacao | next-intl (pt-BR / en-US)               |
| ORM                 | Prisma + PostgreSQL                     |
| Testes              | Jest + React Testing Library            |
| Pre-commit          | Husky + lint-staged (ESLint + Prettier) |
| Pre-push            | Husky (npm run build)                   |
| Env vars            | Zod (src/env.ts)                        |

## Desenvolvimento

```bash
npm run dev          # servidor local
npm run lint         # checar erros de lint
npm run lint:fix     # corrigir automaticamente
npm run test         # rodar testes
npm run build        # build de producao (roda automaticamente no git push)
```

## Documentacao para IA

Antes de codar, leia:

1. `docs/ai/doc-index.md` — indice de todos os documentos e checklists
2. `docs/ai/patterns.md` — padroes recorrentes (feature module, i18n, componentes, testes)

## O que foi reorganizado

- Arquitetura por dominio em src/features
- Login sem selecao de perfil (perfil vem da conta)
- Home removida e redirecionada para login
- Rotas novas:
  - /admin
  - /admin/financeiro
  - /clinica
  - /medico
  - /profissional
  - /profissional/novo
- Rotas legadas mantidas com redirecionamento:
  - /optometrista -> /profissional
  - /optometrista/novo -> /profissional/novo
  - /centro -> /clinica

## Regras de negocio aplicadas

- Nome do paciente: obrigatorio
- Data de nascimento: obrigatorio
- Telefone: obrigatorio
- CPF/Documento: opcional
- Doencas sistemicas: campo livre opcional
- Suspeita clinica atualizada: Necessidade Refrativa -> Cirurgia Refrativa
- Renomeacao para Nucleos de Atendimento
- Inclusao de Consulta Simples como nucleo
- Exibicao de composicao, valor bruto, desconto e valor final do nucleo
- Novo encaminhamento com area para incluir documentos
- Status do encaminhamento:
  - Encaminhado
  - Agendado
  - Atendido
- Painel da clinica com triagem contendo:
  - status
  - data de agendamento
  - medico
- Painel do medico com ficha completa e edicao de:
  - consideracoes
  - conduta
  - anexos
- Ajuste textual para Profissional no lugar de optometria/optometrista na navegacao principal

## Estrutura principal

```text
src/
  app/
    api/
      health/route.ts
      referrals/route.ts
    login/page.tsx
    page.tsx
    (dashboard)/
      admin/
      clinica/
      medico/
      profissional/
  components/
    forms/field.tsx
    layout/
    ui/
  features/
    auth/
    referrals/
  lib/
    prisma.ts
prisma/
  schema.prisma
.env.example
```

## Padroes de organizacao de arquivos

- `src/app`: paginas e rotas. Arquivos de pagina devem orquestrar fluxo e composicao, evitando concentrar markup estrutural repetido.
- `src/components/ui`: primitives e building blocks reutilizaveis. O arquivo `index.tsx` deve funcionar apenas como barrel de export.
- `src/components/forms`: wrappers de formulario compartilhados entre dominios.
- `src/features`: componentes, tipos, dados e servicos orientados por dominio. Sempre que um bloco visual depender de regra de negocio, ele deve morar aqui e nao em `ui`.
- `src/lib`: integracoes, helpers de infraestrutura e singletons.

Regras praticas adotadas:

- componente de `ui` em arquivo proprio;
- barrel apenas para exportar, nunca para implementar varios componentes grandes;
- pagina principal com foco em estado, handlers e composicao;
- blocos repetidos de negocio extraidos para `features/.../components`;
- estilos repetidos extraidos para classes semanticas globais apenas quando o padrao aparece em mais de um lugar.

## Padroes de CSS e Tailwind

- Tokens visuais centralizados em `src/app/globals.css` via CSS custom properties.
- Classes globais limitadas a padroes transversais como `ui-field`, `ui-table`, `ui-upload-dropzone` e `ui-record-panel`.
- Tailwind continua sendo a camada principal de composicao local; CSS global entra apenas para reduzir repeticao real.
- Evitar classes utilitarias longas repetidas em varias telas. Quando houver recorrencia, promover para componente ou classe semantica.
- Evitar CSS por pagina quando o problema for estrutural; preferir componente reutilizavel.

## Qualidade e automacao

Comandos disponiveis:

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

Ferramentas adicionadas para sustentar o padrao:

- ESLint com ordenacao de imports
- remocao de imports nao usados
- Prettier com ordenacao automatica de classes Tailwind

## Banco de dados (Prisma + PostgreSQL)

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

1. Ajuste se necessario e confirme os dados:

```env
DB_USER=postgres
DB_PASSWORD=otica123
```

1. Instale dependencias e gere client Prisma:

```bash
npm install
npm run prisma:generate
```

1. Rode migracao inicial:

```bash
npm run prisma:migrate -- --name init
```

## Desenvolvimento

```bash
npm run dev
```

Acesse: <http://localhost:3000>

## Guia operacional para IA

Para manter consistencia tecnica e evitar implementacoes fora do padrao:

- Instrucoes operacionais da IA: .github/copilot-instructions.md
- Indice de documentacao por assunto: docs/ai/doc-index.md

Regra obrigatoria: toda implementacao deve consultar primeiro o indice em docs/ai/doc-index.md e a documentacao do dominio impactado antes de editar codigo.

## Contas de demonstracao

- `admin@ciso.com.br` / `123456`
- `clinica@ciso.com.br` / `123456`
- `medico@ciso.com.br` / `123456`
- `profissional@ciso.com.br` / `123456`
