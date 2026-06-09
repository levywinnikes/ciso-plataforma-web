# Setup e Deployment

Guia operacional para subir o projeto localmente e publicar no Vercel.

## 1. Pre-requisitos

- Node.js 20.x
- npm 10+
- PostgreSQL acessivel (Neon, Supabase, RDS ou local)
- Conta no Vercel com acesso ao projeto

## 2. Setup local rapido

1. Instalar dependencias:

```bash
npm install
```

2. Criar variaveis locais a partir de `.env.example`.

3. Gerar Prisma Client:

```bash
npm run prisma:generate
```

4. Aplicar migracoes locais:

```bash
npm run prisma:migrate -- --name init
```

5. Rodar aplicacao:

```bash
npm run dev
```

## 3. Variaveis de ambiente obrigatorias

Fonte de verdade: `src/env.ts`.

Obrigatorias para execucao:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

`NODE_ENV` e validada, mas em producao o Vercel ja define como `production`.

## 4. Deploy no Vercel (CLI)

No diretorio raiz do projeto:

```bash
npx vercel login
npx vercel --prod --yes
```

Observacoes:

- O comando publica os arquivos atuais do workspace para producao.
- Se o projeto ainda nao estiver vinculado, a CLI cria/vincula o projeto no primeiro deploy.
- Para inspecionar detalhes de build/deploy:

```bash
npx vercel inspect <deployment-url>
```

## 5. Migracoes de banco em producao

Apos deploy bem-sucedido, aplicar migracoes no banco de producao:

```bash
npx prisma migrate deploy
```

Seed em producao (somente quando necessario):

```bash
npm run prisma:seed
```

## 6. Troubleshooting

### 6.1 Token invalido na CLI

Erro comum:

- `The specified token is not valid. Use vercel login to generate a new token.`

Solucao:

1. Executar `npx vercel login`.
2. Repetir `npx vercel --prod --yes`.

### 6.2 Falha de build no deploy

Se o deploy falhar em `npm run build`, reproduzir localmente:

```bash
npm run build
```

Corrigir erro de TypeScript/lint e repetir deploy.

## 7. Checklist final de publicacao

- Build local ok (`npm run build`)
- Env de producao configurado no Vercel
- Deploy de producao concluido
- Migracoes aplicadas em producao
- Rota de saude validada (`/api/health`)
