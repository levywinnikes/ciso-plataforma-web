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

## 4. Deploy no Vercel

Existem duas formas principais de publicar o projeto no Vercel: através da **Integração Automática com o GitHub** (Recomendado) ou manualmente via **Vercel CLI**.

### Método A: Integração Automática com GitHub (Recomendado)

Esta é a melhor prática para produção. Cada push na branch `main` disparará um deploy automático.

1. **Importar o Repositório**:
   - Acesse o painel do Vercel e clique em **Add New...** > **Project**.
   - Conecte sua conta do GitHub e selecione o repositório `ciso-plataforma-web`.

2. **Configurações de Build**:
   - O Vercel detectará automaticamente que é um projeto Next.js.
   - **Build Command**: Deixe o padrão (`next build`) ou altere para `prisma generate && next build` para garantir que o cliente do banco de dados seja gerado a cada compilação.
   - **Output Directory**: Padrão (`.next`).

3. **Configurar Variáveis de Ambiente**:
   - No campo **Environment Variables**, insira as chaves listadas na seção 3 (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).

4. **Deploy**:
   - Clique em **Deploy**. O Vercel clonará o repositório, instalará as dependências, gerará o cliente Prisma, compilará o Next.js e publicará a aplicação.

---

### Método B: Deploy Manual via Vercel CLI

Ideal para testes rápidos ou de pré-visualização (Preview) direto da máquina de desenvolvimento.

1. **Instalar/Autenticar**:

   ```bash
   npx vercel login
   ```

   Siga as instruções na tela para fazer login na sua conta do Vercel pelo navegador.

2. **Iniciar e Vincular o Projeto** (Executar na raiz do projeto):

   ```bash
   npx vercel
   ```

   - A CLI perguntará se deseja configurar o projeto: responda `Y`.
   - Selecione a organização e se deseja vincular a um projeto existente (ou criar um novo).
   - Defina o nome do projeto (ex: `ciso-plataforma-web`).
   - Insira o diretório raiz como `./`.

3. **Configurar as Variáveis no Painel**:
   - Antes de prosseguir com o deploy final, configure as variáveis de ambiente no dashboard web do Vercel para o respectivo projeto.

4. **Publicar para Produção**:
   ```bash
   npx vercel --prod --yes
   ```

   - O parâmetro `--prod` indica que o deploy deve ser enviado para produção.
   - O parâmetro `--yes` ignora perguntas adicionais na CLI usando os padrões vinculados.

---

## 5. Sincronização do Banco de Dados em Produção

Como as alterações de tabela do Prisma não executam migrações automáticas durante o build no Vercel (já que o build apenas compila o frontend e rotas de API), você deve aplicar as alterações de banco manualmente após ou antes do deploy:

### Para Bancos com Prisma Migrate (Recomendado em Produção)

```bash
npx prisma migrate deploy
```

### Para Bancos em Desenvolvimento Rápido (Push Direto)

Se você estiver utilizando Neon DB e a branch não possuir migrações completas criadas (comum em protótipos rápidos usando `db push`):

```bash
npx prisma db push
```

---

## 6. Troubleshooting Comum no Vercel

### 6.1 Erro `PrismaClientInitializationError` ou timeout de API

- **Causa**: O Vercel não consegue se comunicar com o banco Postgres.
- **Solução**: Verifique se a variável `DATABASE_URL` no painel do Vercel está correta e se o banco de dados (ex: Neon DB) está aceitando conexões externas. Se usar pooling, certifique-se de usar a URL correta de transações.

### 6.2 Erro `The specified token is not valid` na CLI

- **Causa**: Token da CLI expirado localmente.
- **Solução**: Execute `npx vercel login` novamente para revalidar a sessão.

### 6.3 Erro `Prisma has not been initialized yet` durante o build

- **Causa**: O cliente do Prisma não foi gerado antes do Next.js compilar as rotas que importam o Prisma.
- **Solução**: No painel do Vercel, altere o comando de Build para `npx prisma generate && next build`.

---

## 7. Checklist Final de Publicação

1. [ ] Build local executado com sucesso (`npm run build`).
2. [ ] Todas as variáveis de ambiente configuradas no painel do Vercel (Development, Preview e Production).
3. [ ] Alterações do schema enviadas ao banco (`npx prisma db push` ou `npx prisma migrate deploy`).
4. [ ] Deploy executado com sucesso e status "Ready".
5. [ ] Rota `/api/health` acessada no domínio do Vercel retornando JSON `{ status: "ok" }`.
