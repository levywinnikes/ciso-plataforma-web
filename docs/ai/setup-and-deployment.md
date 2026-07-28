# Setup e Deployment

Guia operacional para subir o projeto localmente e publicar no Vercel.

## 1. Pre-requisitos

- Node.js 20.x
- npm 10+
- PostgreSQL acessivel (Neon, Supabase, RDS ou local)
- Conta no Vercel com acesso ao time **Andr Levy Scarpim Winnikes' projects**
  (`andr-levy-scarpim-winnikes-projects`)
- Projeto Vercel: `ciso-plataforma-web`
- Dominio de producao: `https://www.integravisao.com.br`

> O projeto nao fica mais na conta CronoGestor. Se a CLI estiver logada na conta
> errada, faca logout e login novamente na conta correta.

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

Fonte de verdade: `src/env.ts` e `.env.example`.

Obrigatorias para execucao:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (em producao: `https://www.integravisao.com.br`)
- `DO_SPACES_ENDPOINT`
- `DO_SPACES_REGION`
- `DO_SPACES_BUCKET`
- `DO_SPACES_KEY`
- `DO_SPACES_SECRET`
- `DO_SPACES_FOLDER` (padrao: `integravisao`)

`NODE_ENV` e validada, mas em producao o Vercel ja define como `production`.

### Valores corretos do DigitalOcean Spaces

| Variavel             | Valor correto                         |
| -------------------- | ------------------------------------- |
| `DO_SPACES_ENDPOINT` | `https://nyc3.digitaloceanspaces.com` |
| `DO_SPACES_REGION`   | `nyc3`                                |
| `DO_SPACES_BUCKET`   | `mitcho`                              |
| `DO_SPACES_FOLDER`   | `integravisao`                        |

**Errado (comum):** `https://mitcho.nyc3.digitaloceanspaces.com`  
**Certo:** `https://nyc3.digitaloceanspaces.com`

Nao coloque aspas no valor das variaveis no painel do Vercel.

## 4. Deploy no Vercel

Existem duas formas principais de publicar o projeto no Vercel: atraves da
**Integracao Automatica com o GitHub** ou manualmente via **Vercel CLI**.

Neste projeto o fluxo operacional atual e o **Metodo B (CLI)**.

### Metodo A: Integracao Automatica com GitHub

Cada push na branch `main` pode disparar um deploy automatico, se o
repositorio estiver conectado ao projeto no Vercel.

1. Acesse o painel do Vercel na conta/time corretos.
2. **Add New...** > **Project**.
3. Conecte o GitHub e selecione `ciso-plataforma-web`.
4. Configure as variaveis da secao 3.
5. Clique em **Deploy**.

### Metodo B: Deploy Manual via Vercel CLI (fluxo atual)

#### 1. Autenticar na conta correta

```bash
npx vercel whoami
```

Se nao estiver na conta certa:

```bash
npx vercel logout
npx vercel login
```

Abra o link do navegador e autentique com a conta do time
`andr-levy-scarpim-winnikes-projects`.

Confirme o time:

```bash
npx vercel teams ls
npx vercel project ls --scope andr-levy-scarpim-winnikes-projects
```

#### 2. Vincular o projeto local

Na raiz do repositorio:

```bash
npx vercel link --yes --project ciso-plataforma-web --scope andr-levy-scarpim-winnikes-projects
```

#### 3. Conferir variaveis no painel

Antes do deploy de producao, confira no dashboard:

**Project → Settings → Environment Variables**

Garanta Preview e Production para todas as chaves da secao 3, especialmente as
do Spaces com os valores corretos acima.

#### 4. Publicar para producao

```bash
npx vercel --prod --yes --scope andr-levy-scarpim-winnikes-projects
```

- `--prod` publica em producao
- `--yes` usa o projeto ja vinculado
- `--scope` evita publicar no time/conta errados

Apos o deploy, o alias de producao deve apontar para:

`https://www.integravisao.com.br`

---

## 5. Sincronizacao do Banco de Dados em Producao

Como as alteracoes de tabela do Prisma nao executam migracoes automaticas
durante o build no Vercel, aplique as alteracoes de banco manualmente:

### Prisma Migrate (recomendado)

```bash
npx prisma migrate deploy
```

### Desenvolvimento rapido (push direto)

```bash
npx prisma db push
```

---

## 6. Troubleshooting Comum no Vercel

### 6.1 Erro `PrismaClientInitializationError` ou timeout de API

- **Causa**: O Vercel nao consegue se comunicar com o banco Postgres.
- **Solucao**: Verifique `DATABASE_URL` e se o Neon aceita conexoes externas.

### 6.2 Erro `The specified token is not valid` ou `Not authorized` na CLI

- **Causa**: Token expirado ou login na conta/time errados.
- **Solucao**:

```bash
npx vercel logout
npx vercel login
npx vercel link --yes --project ciso-plataforma-web --scope andr-levy-scarpim-winnikes-projects
```

### 6.3 Erro `Prisma has not been initialized yet` durante o build

- **Causa**: Cliente Prisma nao gerado no build.
- **Solucao**: Build Command = `npx prisma generate && next build`
  (ja coberto por `npm run build` neste projeto).

### 6.4 Upload de arquivo falha em producao (500)

- Confirme `DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com`
  (nao use a URL do bucket `mitcho.nyc3...`).
- Confirme bucket `mitcho`, region `nyc3`, key/secret validos.
- Confirme pasta `integravisao`.
- Re-deploy apos alterar env vars (`npx vercel --prod --yes --scope ...`).

### 6.5 Projeto sumiu / "Your Project was either deleted..."

- **Causa**: `.vercel` apontando para projeto antigo (ex.: conta CronoGestor).
- **Solucao**: religar com o comando `vercel link` da secao 4.

---

## 7. Checklist Final de Publicacao

1. [ ] CLI autenticada na conta/time corretos (`npx vercel whoami` / `teams ls`).
2. [ ] Projeto vinculado: `ciso-plataforma-web` no scope
       `andr-levy-scarpim-winnikes-projects`.
3. [ ] Variaveis de ambiente configuradas (incluindo Spaces com endpoint correto).
4. [ ] Alteracoes do schema enviadas ao banco, se houver.
5. [ ] `npx vercel --prod --yes --scope andr-levy-scarpim-winnikes-projects`
6. [ ] Status Ready e dominio `https://www.integravisao.com.br` respondendo.
7. [ ] Rota `/api/health` retornando `{ "status": "ok" }`.
8. [ ] Teste de upload de documento em producao.
