# Roadmap de Documentação

Estado: Audit realizado em 17/05/2026

## 📊 Resumo Executivo

| Aspecto                              | Status                                         | Prioridade | Ação        |
| ------------------------------------ | ---------------------------------------------- | ---------- | ----------- |
| **Padrões de desenvolvimento**       | ✅ Documentado                                 | —          | Manter      |
| **Modelo de acesso (roles + perms)** | ⚠️ Documentado, mas **desalinhado com código** | 🔴 CRÍTICO | Sincronizar |
| **Estrutura de banco de dados**      | ✅ Documentado                                 | —          | Manter      |
| **API Routes**                       | ❌ Não documentado                             | 🔴 CRÍTICO | Criar doc   |
| **Autenticação e JWT**               | ❌ Não documentado                             | 🔴 CRÍTICO | Criar doc   |
| **Setup local e deployment**         | ⚠️ Mínimo no README                            | 🟡 ALTO    | Expandir    |
| **Testes (E2E)**                     | ❌ Não documentado                             | 🟡 ALTO    | Criar doc   |
| **Segurança e middlewares**          | ❌ Implícito no código                         | 🟡 ALTO    | Criar doc   |
| **Fluxos de negócio**                | ⚠️ Superficial no README                       | 🟡 ALTO    | Detalhar    |
| **Decisões arquiteturais**           | ❌ Não documentado                             | 🟠 MÉDIO   | Criar doc   |

---

## 🚨 BLOQUEADOR CRÍTICO: Alinhamento Código ↔ Documentação

### Problema

`docs/ai/access-and-permissions.md` descreve um modelo de **Organization multi-tenant** com:

- Tabela `Organization`
- Tabela `OrganizationMember`
- `organizationId` em `User` e `Referral`

**Mas o código (`prisma/schema.prisma`) não tem essas tabelas.**

### Impacto

- ❌ A matriz de permissões é teórica, não implementada
- ❌ Não há como saber qual médico pertence a qual organização
- ❌ Rotas `/medico` não validam `organizationId` (não existe)
- ❌ Qualquer feature nova baseada nesse doc falhará

### Solução Necessária

**Escolha 1:** Atualizar `access-and-permissions.md` para descrever o estado ATUAL (sem Organization)

- ✅ Mais rápido
- ❌ Limita roadmap futuro

**Escolha 2:** Implementar o Organization model agora

- ✅ Alinha visão futura
- ✅ Documenta + codifica juntos
- ❌ Maior esforço inicial

---

## ✅ Documentação Existente (Mantém)

| Arquivo                           | Cobertura                                  | Qualidade        |
| --------------------------------- | ------------------------------------------ | ---------------- |
| `docs/ai/patterns.md`             | Feature modules, i18n, componentes, testes | ✅ Ótima         |
| `docs/ai/database-structure.md`   | Tabelas Prisma, relações, negócio          | ✅ Ótima         |
| `docs/ai/doc-index.md`            | Índice e checklist                         | ✅ Ótima         |
| `.github/copilot-instructions.md` | Regras de execução e qualidade             | ✅ Ótima         |
| `README.md`                       | Tech stack, rotas, regras de negócio       | ⚠️ Desatualizado |

---

## ❌ Documentação Faltante (Priorizada)

### 🔴 CRÍTICO (Bloqueia outras features)

#### 1. `docs/ai/authentication.md` (Não existe)

**O que documentar:**

- Como NextAuth.js é configurado (CredentialsProvider, JWT strategy)
- O que vai no JWT (userId, email, role, organizationId)
- Fluxo de login → token → cookies → middlewares
- Como o middleware protege rotas
- Onde `resolveRolePath` e `canAccessPath` são usados

**Tamanho estimado:** 8-10 seções

#### 2. `docs/ai/api-routes.md` (Não existe)

**O que documentar:**

- Todos os endpoints existentes:
  - `GET /api/health` → o quê?
  - `GET /api/referrals` → listar, filtrar, paginação?
  - `GET /api/nuclei` → novo, retorna cores + serviços
  - Faltam: POST /referral (criar), PATCH /referral/:id (atualizar), etc.
- Autenticação em cada rota
- Inputs e outputs esperados
- Erros possíveis

**Tamanho estimado:** 12-15 seções

#### 3. Sincronizar `docs/ai/access-and-permissions.md` com Código

**Opção A:** Descrever o modelo ATUAL (sem Organization)

- Role = ADMINISTRATIVO | MEDICO | PROFISSIONAL
- MEDICO não tem `organizationId` (por enquanto)
- Sem multi-tenant ainda

**Opção B:** Descrever modelo futuro + roadmap

- Manter como está (Organization model)
- Adicionar seção "Não implementado ainda, roadmap para v2"

**Recomendação:** Opção A agora, depois evoluir

---

### 🟡 ALTO (Ativa muitas features)

#### 4. `docs/ai/setup-and-deployment.md` (Não existe)

**O que documentar:**

- Pré-requisitos (Node.js version, npm)
- Setup local:
  - Clonar repo
  - `npm install`
  - `.env` setup (Neon, NextAuth secret)
  - `npx prisma migrate dev`
  - `npx prisma db seed`
  - `npm run dev`
- Troubleshooting comum
- Variáveis de ambiente (ver `src/env.ts`)
- Deploy no Vercel (indicações)

**Tamanho estimado:** 6-8 seções

#### 5. `docs/ai/testing-guide.md` (Não existe)

**O que documentar:**

- Estrutura de testes (jest + RTL)
- Como rodar testes: `npm run test`, `npm run test:watch`
- Padrão de schema tests
- Padrão de hook tests
- E2E com Playwright (não implementado, sugerir)
- Coverage target

**Tamanho estimado:** 8-10 seções

#### 6. `docs/ai/security.md` (Não existe)

**O que documentar:**

- Validação de inputs (Zod na origem)
- Proteção de rotas (middleware)
- JWT best practices
- Senhas com bcrypt (12 rounds)
- CORS (se aplicável)
- Rate limiting (não implementado, alertar)
- Audit e logs (não implementado, sugerir)

**Tamanho estimado:** 8-10 seções

---

### 🟠 MÉDIO (Melhora clareza, não bloqueia)

#### 7. `docs/ai/business-flows.md` (Não existe)

**O que documentar:**

- Fluxo completo de um referral:
  1. PROFISSIONAL cria referral
  2. Escolhe organização/médico
  3. Anexa documentos
  4. Médico recebe notificação
  5. Médico preenche ficha
  6. Status final
- Fluxo de gestão de usuários (ADMINISTRATIVO)
- Fluxo de triagem (era CLINICA, agora é?)

**Tamanho estimado:** 10-12 seções

#### 8. `docs/ai/decision-log.md` (Não existe)

**O que documentar:**

- Por que Next.js (não API separada)?
- Por que Prisma (em vez de raw SQL)?
- Por que Neon PostgreSQL?
- Por que NextAuth.js?
- Por que multi-tenant no futuro?
- Decisões pendentes (CLINICA role, Organization model)

**Tamanho estimado:** 6-8 seções

---

## 📅 Plano Proposto

### Fase 1: Sincronizar críticos (Esta semana)

1. ✅ Revisar / atualizar `access-and-permissions.md` (escolher opção A ou B)
2. ❌ Criar `authentication.md` (hoje)
3. ❌ Criar `api-routes.md` (hoje)
4. ❌ Atualizar `.env.example` e documentar todas as vars

### Fase 2: Completar altos (Próxima semana)

5. ❌ Criar `setup-and-deployment.md`
6. ❌ Criar `testing-guide.md`
7. ❌ Criar `security.md`

### Fase 3: Contexto (Semana seguinte)

8. ❌ Criar `business-flows.md`
9. ❌ Criar `decision-log.md`
10. ❌ Atualizar `README.md` para referenciar todos os docs

---

## 🎯 Próxima Ação

**PERGUNTA PARA O USUÁRIO:**

1. **Sobre Organization model:** Você quer que eu atualize `access-and-permissions.md` para refletir o estado ATUAL (sem Organization ainda), ou começar agora a implementar o Organization model no código?

2. **Documentação missing:** Qual fase você quer que eu comece? (Críticos, Altos, ou tudo junto?)

3. **Prioridade absoluta:** Deve eu começar pelos Críticos hoje?
