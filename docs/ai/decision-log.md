# Decision Log — Integra Visão

Registro canônico de decisões de produto e governança que afetam regras de negócio, permissões e documentação.

---

## 2026-08-25 — Financeiro = acompanhar e cobrar comissões pós-médico

**Decisão vigente:**

- `/admin/financeiro` é painel de **comissões** (taxa de encaminhamento + indicação cirúrgica), não fluxo de caixa bancário
- Duas faixas rotuladas; “a cobrar” = somente status `Atendido`
- Período default = mês corrente; atalhos Hoje / Este mês / Mês anterior / Últimos 30 dias
- Cirurgias entram via `surgeryId`/`surgeryPrice` já existentes no encaminhamento
- Marcação “já cobrado/pago” fora da Fase A

**Impacto:** `docs/ai/financeiro.md`, `cirurgias.md`, `referral-management.md`, `api-routes.md`, `user-views.md`; feature `src/features/financeiro/*`, `GET /api/admin/financeiro`

---

## 2026-08-25 — Calendário de agendamentos nos dashboards

**Decisão vigente:**

- Calendário **somente leitura** nos dashboards `/admin`, `/medico` e `/profissional` (aba própria, default)
- Eventos = encaminhamentos com `appointmentDate`; grade carrega **por mês** via `appointmentFrom`/`appointmentTo`
- Listas paginam no servidor (`page`/`pageSize`/`tab`/`includeCounts`); sem `page` permanece array legado
- Clique no item abre o fluxo já existente do papel
- Não usar `/clinica` órfão; médico = `/medico`

**Impacto:** `user-views.md`, `api-routes.md`; feature `appointment-calendar*`, `list-query`, `fetch-referrals`

---

## 2026-08-18 — Nome oficial do produto

**Decisão:** o nome oficial do produto passa a ser **Integra Visão**.

**Impacto:**

- documentação canônica deve usar `Integra Visão`
- o nome do repositório pode permanecer legado por enquanto
- materiais comerciais e técnicos devem evitar tratar `ciso-plataforma` como nome do sistema

---

## 2026-08-18 — Regra vigente para clínicas no fluxo do profissional

**Decisão:** no fluxo atual, o `PROFISSIONAL` pode visualizar **todas as clínicas** ao criar encaminhamento.

**Impacto:**

- `GET /api/referrals/clinics` segue retornando todas as clínicas
- `ProfessionalAccess` não é regra vigente do produto neste momento
- documentação de acesso, views e API deve refletir essa decisão

**Observação:** essa escolha pode ser revisitada no futuro, mas qualquer mudança deve ser formalizada primeiro no contrato de acesso.

---

## 2026-08-18 — `isAdmin` e admin local (questão em aberto)

**Contexto:** o campo `isAdmin` no modelo representa a intenção de **admin local** — um usuário com poderes administrativos dentro da própria organização (clínica ou consultório).

**Decisão por enquanto:** **não fechar nem implementar** o contrato completo de admin local neste momento.

**O que já existe no código hoje (comportamento parcial, não contrato fechado):**

- `PROFISSIONAL` com `isAdmin=true` enxerga encaminhamentos de todo o consultório; sem `isAdmin`, só os próprios
- helpers `canManageOrg` / `canManageUser` existem em `api-auth.ts`, mas o enforcement não está uniforme em todas as rotas de usuários
- `/api/users/organization` ainda permite gestão por qualquer membro da org (comportamento temporário)

**Direção provável (ainda não adotada):**

- admin local geriria usuários da própria organização
- usuário comum faria o resto do sistema, sem CRUD de colaboradores

**Impacto:**

- documentação canônica **não** deve tratar regras de `isAdmin` para gestão de usuários como vigentes
- **não alterar código** de permissões de `isAdmin` até nova decisão formal
- quando for fechado, atualizar `decision-log.md` antes de implementar

---

## 2026-08-18 — ADMINISTRATIVO e gestão de usuários (questão em aberto)

**Decisão vigente por enquanto:** qualquer usuário `ADMINISTRATIVO` pode fazer tudo no sistema, inclusive gestão de usuários globais e de qualquer organização.

**Questão em aberto:** no futuro, pode ser necessário restringir gestão de usuários administrativos a um subconjunto (ex.: apenas admins globais). Até essa decisão ser tomada, não aplicar restrição extra além de exigir role `ADMINISTRATIVO`.

**Impacto:**

- documentação deve registrar essa regra como vigente, com ressalva explícita de evolução futura
- não introduzir `isAdmin` como gate para `ADMINISTRATIVO` sem nova decisão formal

---

## 2026-08-18 — Auditoria de status de encaminhamento

**Decisão:** o sistema deve auditar **todas** as mudanças de status de encaminhamento.

**Impacto:**

- `ReferralStatusAudit` é parte do contrato vigente
- transições como `Encaminhado -> Agendado` e `Agendado -> Atendido` devem ser rastreáveis
- quando houver `Bloqueado`, a justificativa precisa acompanhar a auditoria

---

## 2026-08-18 — Onde ficam itens futuros

**Decisão:** documentos canônicos de domínio devem descrever apenas o que está **vigente**.

Itens futuros, opcionais, experimentais ou ainda não fechados devem ir para:

- roadmap separado
- decision log
- seção explícita de evolução futura, sem misturar com a regra atual

**Impacto:**

- `user-views.md` e `access-and-permissions.md` devem evitar vender rotas ou regras futuras como vigentes
- `ProfessionalAccess` fica como base técnica de roadmap, não como política ativa

---

## 2026-08-19 — Assistente administrativo (piloto, Gemini)

**Contexto:** interesse em um assistente (chat) no Integra Visão, reusando a experiência de Gemini gratuito do `facts-every-morning`, **sem DeepSeek**, e testando primeiro com administradores.

**Decisão vigente (piloto):**

- o piloto é **somente** para papel `ADMINISTRATIVO`
- provedor: **Gemini Flash** (`GEMINI_API_KEY` no servidor); **não** usar DeepSeek nem fallback DeepSeek
- formato: **chatbot** em **widget flutuante** nas telas `/admin/**`
- nome na interface: **Assistente**
- o assistente **não altera dados**; só orienta
- widget **sempre visível** para `ADMINISTRATIVO` (sem `ASSISTANT_ENABLED`)
- histórico só na sessão do navegador
- limite de **200 perguntas por usuário por dia**, contado no servidor
- fallback **somente entre modelos Gemini** se houver 429/cota; **sem DeepSeek**
- orientação: resumo de produto + trechos de `docs/ai` no servidor; **sem filtro de assunto** para administrador
- **sem recusa/máscara** de dado operacional ou de pessoa na pergunta do administrador (o texto pode ir ao Gemini). Isso **não** se estende a clínica/consultório
- para `MEDICO` / `PROFISSIONAL`: exigir **modelo de contrato por papel** antes de qualquer implementação
- as sete questões do plano original foram **fechadas** em 19/08/2026; ver `docs/ai/admin-assistant.md` §9

**Impacto:**

- documentação canônica vigente lista o widget nas telas `/admin` (piloto)
- detalhe: `docs/ai/admin-assistant.md`

---

## 2026-08-19 — Contrato do Assistente (documentado; código ainda não)

**Contexto:** o piloto responde com caminho técnico e sem números reais. Pedido: não decorar; ter documentação e fontes de pesquisa; decidir o que pode / não pode, inclusive consultas (ex. relatório/financeiro).

**Decisão vigente de produto:**

- o Assistente **orienta** e obtém números por **consulta genérica** (assunto + recorte + quebra), não por relatório fixo
- três totais pré-calculados foram **descartados** (prever a pergunta)
- sem dump técnico de `docs/ai`; sem lista das telas; sem lista nominal de pacientes
- atalho por nome de tela (`tela:atrasados` → `/admin?aba=atrasados`)

**Impacto:** `docs/ai/assistant-contract.md`, `api-routes.md`, `patterns.md` §12.

---

## 2026-08-19 — Autonomia de consulta do Assistente (planejamento inicial)

**Contexto:** o chat recusou perguntas operacionais criativas; o piloto ainda era estreito demais.

**Direção inicial (depois corrigida em 21/08/2026):** falava em camadas A2/A3 centradas em ranking/localizar. Isso **não** é o plano vigente.

---

## 2026-08-21 — Autonomia = relatórios criativos + cruzamento (direção vigente)

**Contexto:** “paciente mais recorrente” era só **exemplo**. O produto precisa de autonomia para o usuário pedir recortes criativos e o chat cruzar dados no banco — sem prever cada relatório.

**Direção vigente (ainda sem código novo):**

- não implementar “ranking de paciente” como marco
- primeiro passo: **API / motor de consulta mais genérico** (medidas, dimensões, filtros, ordenação, limite, cruzamento)
- o modelo monta o pedido; o servidor valida e agrega; sem SQL livre; sem alterar cadastro
- ampliar = novas dimensões/medidas no motor, não um relatório por frase

**Impacto:** `docs/ai/assistant-autonomy.md` (reescrito), `assistant-contract.md`, `documentation-roadmap.md`

---

## 2026-08-21 — Plano técnico do motor de consulta do Assistente

**Contexto:** alinhamento para implementar autonomia com boas práticas (allowlist, Zod, agregação no servidor, sem SQL livre).

**Plano documentado (ainda sem código):**

- pedido estruturado v2 (dimensões nomeadas, ordenação, limite, período por campo)
- catálogo expansível de medidas/dimensões; falha fechada se pedir o que não existe
- preferir agregação no Prisma; teto de linhas; sem PII por padrão
- fases 0→2: plano → motor+schema → chat só no v2
  **Defaults sugeridos:** até 3 dimensões, limite 20/50, período omitido = tudo, rota `/api/admin/assistant/queries` mantida.

**Linguagem:** pedido/resultado/resposta alinhados à UI — ver `docs/ai/assistant-language.md`.

**Visualização:** se o usuário pedir gráfico, o modelo só escolhe o tipo; o widget renderiza template pronto com os dados da consulta (sem gerar imagem no Gemini). Detalhe: `assistant-query-engine.md` §9.1.

**Freshness / cache:** se `MAX(updatedAt)` do assunto for mais novo que `dadosAte`, **ou** mudou o **dia civil** (`diaReferencia`) → **nova busca completa** do mesmo pedido. Fingerprint por assunto. §9.3.

**Histórico de conversas:** vários fios **no navegador**. Sem histórico compartilhado entre usuários. Servidor só se o mesmo admin pedir outro dispositivo.

**Timestamps:** padrão de projeto — tabelas de domínio com `createdAt` + `updatedAt` (`docs/ai/patterns.md` §12). Migration `20260821180000_domain_timestamps`. Exceções: Auth/NextAuth e tabelas só-append. Opcional: `deletedAt` só onde houver soft delete.

**Impacto:** `docs/ai/assistant-query-engine.md`, `docs/ai/assistant-language.md`

---

## 2026-08-21 — Fase 3b/3c: gráficos + histórico local

**Decisão / entrega:**

- Fase **3** (médias/taxas): **adiada** até o produto pedir medidas fechadas
- **3b:** chat devolve `dados.linhas` + `visualizacao` (barras|linhas|pizza); widget renderiza Recharts; JSON de visualização não aparece no texto
- **3c:** vários fios no `localStorage` (nova / listar / apagar); migra sessão antiga do `sessionStorage`

**Impacto:** `chat/route.ts`, `assistant-widget.tsx`, `visualizacao.ts`, `threads.ts`, `assistant-chart.tsx`, i18n

---

## 2026-08-21 — Fase 2: chat só na gramática v2

**Decisão / entrega:**

- Removida normalização da gramática v1 (`quebrarPor`, `inicio`/`fim` soltos, `clinica` sem `Contem`)
- Chat usa `buildConsultaInstructions()` (instruções + catálogo JSON)
- Resultado formatado para o modelo com dimensões nomeadas (texto + JSON)
- Teste de aceitação: padrão “atrasados + clínica + núcleo” sem relatório nomeado

**Impacto:** `consulta-schema.ts`, `consulta-engine.ts`, `chat/route.ts`, `assistant-contract.md`, `api-routes.md`

---

## 2026-08-21 — Fase 1 do motor de consulta (v2) no código

**Decisão / entrega:**

- Schema Zod v2: `dimensoes` (até 3), `periodo.campo`, `limite` 20/50, `ordenarPor`, `convenio` / `mesAgendamento` / `mesCriacao`
- Entrada legada (`quebrarPor`, `inicio`/`fim`, nomes curtos) normalizada via `parseAssistantConsulta`
- Resultado com dimensões nomeadas + `meta`; GET `/api/admin/assistant/queries` devolve catálogo versionado
- Push-down parcial no Prisma (`where` de status/período/nome); atraso ainda em memória
- Chat já consome o mesmo motor; instruções do modelo atualizadas para v2

**Impacto:** `consulta-schema.ts`, `consulta-engine.ts`, `queries/route.ts`, `assistant-contract.md`, `assistant-query-engine.md`

---

## 2026-08-21 — Timestamps obrigatórios em tabelas de domínio

**Decisão vigente:**

- Toda tabela de **domínio** no Prisma deve ter `createdAt` + `updatedAt` (`@updatedAt`).
- Exceções: modelos Auth/NextAuth; tabelas só-append (ex. `ReferralStatusAudit` só com `createdAt`).
- Coluna opcional recomendada: `deletedAt` **somente** quando o negócio pedir soft delete (não em toda tabela).
- Documentado em `docs/ai/patterns.md` §12.
- Alinhamento do schema legado: migration `20260821180000_domain_timestamps`.

**Impacto:** `prisma/schema.prisma`, `docs/ai/patterns.md`, `docs/ai/assistant-query-engine.md`

---

## 2026-08-19 — Atrasados e marcar como atendido (admin)

**Decisão vigente:**

- na listagem `/admin`, existe aba **Atrasados** além de Ativos e Bloqueados
- Ativos continua listando todos os não bloqueados, **incluindo** atrasados
- atrasado = tem data de agendamento em dia civil anterior a hoje e status diferente de `Atendido`
- destaque visual: faixa à esquerda, fundo rosado e selo **Atrasado** (não pintar a linha de vermelho sólido)
- administradores podem **Marcar como atendido** em `Encaminhado` ou `Agendado`, com modal de confirmação dos dados
- `Bloqueado` não pode ser concluído por esse atalho

**Impacto:** `docs/ai/referral-management.md`, `user-views.md`, `api-routes.md`; rota `PATCH /api/referrals/:id/complete`

---

## 2026-08-19 — Auditoria em agendar e concluir (médico)

**Decisão:** toda mudança de status gera `ReferralStatusAudit`. O agendamento administrativo e a conclusão pelo médico estavam fora dessa regra e passam a gravar auditoria.

**Impacto:** `PATCH /api/referrals/:id/schedule`, `PATCH /api/referrals/:id/specialist`
