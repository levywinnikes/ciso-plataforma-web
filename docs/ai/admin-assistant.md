# Assistente administrativo (piloto) — Integra Visão

**Status:** PILOTO VIGENTE (19/08/2026) para `ADMINISTRATIVO`. Widget nas rotas `/admin/**`.

**Origem:** 2026-08-19 — assistente (chatbot) para testar com **Administradores** primeiro; provedor **Gemini gratuito** (mesmo estilo do `facts-every-morning`); **sem DeepSeek**.

---

## 1. Objetivo

Ajudar usuários `ADMINISTRATIVO` a tirar dúvidas e orientar o uso do Integra Visão (cadastros, encaminhamentos, relatórios, convênios, clínicas, etc.) sem substituir as telas existentes.

Não é, neste piloto:

- um agente que altera dados sozinho
- um assistente para `MEDICO` ou `PROFISSIONAL`
- um substituto de suporte humano para casos clínicos

---

## 2. Forma de uso: chatbot (widget)

Painel de conversa (chat), não um assistente “invisível” que executa ações.

**Piloto fechado:** Opção A — **widget flutuante** só em rotas `/admin/**`. Sem página `/admin/assistente` nesta fase.

Textos da interface via chaves i18n (nunca jargão: sem “endpoint”, “payload”, “prompt”). Nome na interface: **Assistente**. Outros textos de negócio: “Pergunta”, “Resposta”, “Não foi possível obter orientação”.

Não há interruptor de ambiente (`ASSISTANT_ENABLED`): se o usuário é `ADMINISTRATIVO`, o widget **aparece**. Se a chave Gemini faltar ou a cota estourar, a pergunta falha com erro visível (`patterns.md` §11), sem esconder o Assistente.

Se no futuro existir tela de configuração do Assistente, usar **Zod + React Hook Form + `<Field>`**.

---

## 3. Quem usa (piloto)

| Papel            | Acesso no piloto                                                 |
| ---------------- | ---------------------------------------------------------------- |
| `ADMINISTRATIVO` | Sim (qualquer administrativo; widget sempre visível nesse papel) |
| `MEDICO`         | Não                                                              |
| `PROFISSIONAL`   | Não                                                              |

API: `requireAdministrativo()` (mesmo padrão de rotas admin). Sem chave no cliente.

---

## 4. Provedor de IA

| Provedor                                 | Piloto                                  |
| ---------------------------------------- | --------------------------------------- |
| **Google Gemini** (API gratuita / Flash) | **Sim** — `GEMINI_API_KEY` no servidor  |
| DeepSeek                                 | **Não** — fora do piloto e sem fallback |
| OpenAI / outros                          | Fora do piloto                          |

Referência técnica no Facts (não copiar o fallback DeepSeek):

- chave: `GEMINI_API_KEY`
- modelos de teste sugeridos: `gemini-2.5-flash`, depois `gemini-2.0-flash`
- `gemini-3.1-flash-lite` só se Flash esgotar cota (opcional)

A chamada **só no servidor**. A chave nunca vai ao navegador.

### O que o Gemini faz neste piloto

1. Recebe a pergunta do administrador (sem filtro de assunto para este papel) + orientação de produto.
2. Orientação **hoje no código:** resumo curto em `product-guidance.ts` (inclui caminhos técnicos). **Direção planejada (§11):** manual `assistant-knowledge.md` + pacote ao vivo de totais — **não** colar `docs/ai` técnico no modelo.
3. Responde em linguagem de negócio, no idioma da sessão (`pt-BR` / `en-US`).
4. Se não souber: diz que não sabe e aponta a tela correspondente, sem inventar regra.
5. **Não** grava, altera nem exclui dados pelo chat.
6. **Não** busca a web (grounding Google Search) no piloto.

### Contratos por papel (fase 3 — obrigatório antes de abrir clínica/consultório)

Quando o chat for oferecido a `MEDICO` ou `PROFISSIONAL`, **não** reutilizar o contrato amplo do administrador. Fechar antes um **modelo de contrato por papel**, por exemplo:

- o que pode perguntar
- o que o modelo pode ver (docs vs dados operacionais)
- o que é recusado ou mascarado
- textos de orientação próprios

Essa decisão de 19/08/2026 vale **somente** para `ADMINISTRATIVO`.

---

## 5. Arquitetura proposta (quando for implementar)

```text
Admin (widget em /admin/**) — sempre visível se role = ADMINISTRATIVO
        │
        ▼
POST /api/admin/assistant/chat   ← requireAdministrativo
        │
        ├─ valida mensagem (tamanho, Zod)
        ├─ limite 200 perguntas / usuário / dia (contagem no servidor)
        ├─ monta orientação (hoje: resumo no código; planejado: manual + totais ao vivo)
        └─ Gemini (servidor, GEMINI_API_KEY)
                │
                ▼
        resposta (histórico da conversa só no navegador)
        auditoria mínima: quem perguntou, horário, tamanho, tokens se disponível
```

Padrões do projeto:

- `src/lib/api-auth.ts` + `docs/ai/security-checklist.md`
- erros granulares i18n (`errors.assistantUnavailable`, `errors.assistantDailyLimit`, etc.)
- cliente Gemini extraído (`src/lib/ai/gemini.ts` ou similar) e registrado em `patterns.md` no mesmo ciclo do código

Não reutilizar `lib/ai_client.js` do Facts (fallback DeepSeek). Cliente **somente Gemini**.

O limite diário **não** pode viver só no navegador: recarregar a página não zera a cota.

---

## 6. Privacidade e dados (piloto `ADMINISTRATIVO`)

**Decisão de 19/08/2026:** administradores têm controle operacional do sistema (não são clínica nem consultório). Neste piloto **não** há recusa nem mascaramento de conteúdo da pergunta.

Consequências explícitas:

1. O administrador **pode** perguntar sobre encaminhamentos, pessoas e operação, inclusive colando dado que já vê nas telas.
2. Esse texto **segue para o Gemini** (processamento fora do Integra Visão). É decisão consciente do piloto admin, não um vazamento acidental.
3. O histórico da conversa **não** vai para o banco; fica só na sessão do navegador (some ao recarregar).
4. Auditoria do piloto: metadados (usuário, data, tamanho da pergunta), não o texto completo da conversa.

Quando o Assistente existir para clínica ou consultório, este parágrafo **não** se aplica: valem os contratos por papel da seção 4.

---

## 7. Fases

| Fase                  | Escopo                                               | Público                              |
| --------------------- | ---------------------------------------------------- | ------------------------------------ |
| **0 — Planejamento**  | Este documento + decision-log                        | Equipe — **feito**                   |
| **1 — Piloto admin**  | Widget + API Gemini + docs internas + limite 200/dia | Só `ADMINISTRATIVO` — **feito**      |
| **2 — Melhorias**     | Histórico persistido, página cheia, atalhos          | Admin — nova decisão                 |
| **3 — Outros papéis** | Contratos por papel + restrições próprias            | Clínica / consultório — nova decisão |

---

## 8. Critérios de aceite do piloto

1. Só `ADMINISTRATIVO` vê o widget e chama a API.
2. `MEDICO` / `PROFISSIONAL` recebem 403 se tentarem a API.
3. Resposta em linguagem de negócio; i18n na casca da UI; nome **Assistente**.
4. Sem DeepSeek; falha do Gemini mostra erro visível.
5. Chave só em variável de ambiente no servidor.
6. Sem escrita de dados via chat.
7. Limite de **200 perguntas por usuário por dia**, contado no servidor. Fallback só entre modelos Gemini (sem DeepSeek).
8. Histórico só no navegador.
9. Documentação vigente (`user-views`, `api-routes`, `access-and-permissions`) atualizada **no mesmo PR** da implementação.

---

## 9. Decisões fechadas (2026-08-19)

| #   | Tema                         | Decisão                                                                                                                                                                                                                                                        |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | UI                           | Widget flutuante em `/admin/**`. Sem página dedicada no piloto.                                                                                                                                                                                                |
| 2   | Orientação                   | Piloto inicial: resumo no código. **Revisão planejada (§11):** manual de consulta + pacote de totais; sem dump técnico de `docs/ai`. Sem restrição forte de assunto para administrador. Contratos por papel **obrigatórios** antes de abrir a outros usuários. |
| 3   | Dado de paciente na pergunta | **Sem recusa e sem máscara** no piloto admin. O texto pode ir ao Gemini. Outros papéis: contrato próprio depois.                                                                                                                                               |
| 4   | Histórico                    | Só na sessão do navegador.                                                                                                                                                                                                                                     |
| 5   | Cota                         | **200 perguntas / administrador / dia**, no servidor. Fallback entre modelos Gemini se um esgotar (sem DeepSeek).                                                                                                                                              |
| 6   | Nome                         | **Assistente**.                                                                                                                                                                                                                                                |
| 7   | Liga/desliga                 | **Não** usar `ASSISTANT_ENABLED`. Widget sempre visível para `ADMINISTRATIVO`.                                                                                                                                                                                 |

Nada nesta seção permanece em aberto para o piloto admin.

---

## 10. Relação com o Facts Every Morning

Reaproveitar **ideia operacional**, não o código:

| Facts                        | Integra Visão (piloto)              |
| ---------------------------- | ----------------------------------- |
| `GEMINI_API_KEY` + Flash     | Igual                               |
| Vários modelos se um der 429 | Igual (só Gemini)                   |
| Fallback DeepSeek            | **Proibido**                        |
| Agentes de roteiro/vídeo     | Não se aplica                       |
| Chamada em Node/CLI          | Chamada em rota Next.js autenticada |

---

## 11. Contrato de inteligência (vigente no piloto)

O **contrato vigente** está em `docs/ai/assistant-contract.md`: manual + consulta genérica (não relatório de três totais). Autonomia extra (ranking/localizar): `docs/ai/assistant-autonomy.md` — planejamento, ainda sem código.
