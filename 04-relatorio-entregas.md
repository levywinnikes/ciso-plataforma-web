# Relatório de Entregas — Integra Visão

**Documento canônico** para registro de entregas, horas e base de cobrança do projeto `Integra Visão`.

| Projeto       | Repositório           |
| ------------- | --------------------- |
| Integra Visão | `ciso-plataforma-web` |

**Última atualização:** 19/08/2026 (ENT-010 layout da lista admin)  
**Responsável pelo registro:** assistente de desenvolvimento (sessões Cursor)  
**Cliente / uso:** controle interno do projeto e base para cobrança  
**Taxa:** R$ 50,00/h (horas estimadas IA)

**Prefixo legado:** blocos ENT-001–010; novas entregas usar **IV-XXX**.

**Pagamento (Pago/Faturado):** Gestao `02-financeiro-faturamento.md` — sync manual.

---

**Onde registrar:** `04-relatorio-entregas.md` (canônico). Redirect: `docs/RELATORIO_ENTREGAS.md`.

## Cláusula do projeto

Toda entrega relevante do `Integra Visão` deve ser registrada neste arquivo antes de encerrar a tarefa.

Considerar como relevante, por exemplo:

- nova funcionalidade, tela, endpoint ou fluxo
- mudança de regra de negócio
- correção com impacto operacional
- documentação canônica nova ou atualização de contrato vigente
- refatoração que altere comportamento, permissão ou contrato técnico

Não é obrigatório registrar:

- typos isolados
- ajustes triviais de formatação
- comentários sem impacto funcional
- exploração somente leitura sem entrega concreta

---

## Como usar este documento

1. Cada entrega ganha um bloco `ENT-XXX` no histórico.
2. O resumo executivo do mês deve ser atualizado no topo.
3. Quando houver commit, registrar hash e mensagem.
4. Se ainda não houver commit, marcar `Aguardando commit`.
5. Entregas internas/documentais não precisam entrar em changelog de usuário.

---

## Resumo executivo (ago/2026)

| Data       | Entrega                                                    |   Horas   |      Valor      | Motivo de negócio                                                                            |
| ---------- | ---------------------------------------------------------- | :-------: | :-------------: | -------------------------------------------------------------------------------------------- |
| 18/08/2026 | Governança documental e contratos canônicos ENT-001        |    2h     |    R$ 100,00    | Consolidar a fonte de verdade das regras de acesso, views e API antes de expandir o produto  |
| 18/08/2026 | Refinar regra de gestão de usuários ENT-002                |   0,5h    |    R$ 25,00     | Fechar contrato: `isAdmin` delimita só usuários; restante do sistema liberado para não-admin |
| 18/08/2026 | Marcar admin local como questão em aberto ENT-003          |   0,25h   |    R$ 12,50     | Reverter contrato prematuro de `isAdmin`; documentar intenção (admin local) sem enforcement  |
| 19/08/2026 | Planejar Assistente administrativo (piloto Gemini) ENT-004 |   0,75h   |    R$ 37,50     | Definir chatbot só para administradores, Gemini sem DeepSeek, sem código                     |
| 19/08/2026 | Fechar decisões do piloto do Assistente ENT-005            |   0,5h    |    R$ 25,00     | Widget, cota, histórico, privacidade admin e contratos futuros por papel                     |
| 19/08/2026 | Atrasados e marcar como atendido (admin) ENT-006           |   1,5h    |    R$ 75,00    | Facilitar conclusão operacional e evidenciar agendamentos que passaram do dia                |
| 19/08/2026 | Auditoria de status e limpeza de pendências ENT-007        |    1h     |    R$ 50,00    | Fechar lacuna de auditoria e o roadmap documental de maio/2026                               |
| 19/08/2026 | Piloto do Assistente administrativo ENT-008                |   2,5h    |    R$ 125,00    | Widget de orientação para administradores, Gemini com fallback entre modelos                 |
| 19/08/2026 | Consulta genérica do Assistente ENT-009                    |    2h     |    R$ 100,00    | Números ao vivo sem relatório pronto; o chat monta o recorte da pergunta                     |
| 19/08/2026 | Ações da lista admin e autonomia A2 a fazer ENT-010        |   0,5h    |    R$ 25,00     | Corrigir layout da coluna de ações; ranking de paciente fica para depois                     |
| **Total**  | **Todas as entregas registradas no projeto**               | **11,5h** | **R$ 575,00** |                                                                                              |

---

## Histórico de entregas

### ENT-001 — Alinhar governança documental do Integra Visão

| Campo        | Valor                                                                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | 18/08/2026                                                                                                                                                                                                                             |
| **Motivo**   | O projeto precisava parar de misturar regra vigente, exceção temporária e roadmap, reduzindo divergência entre negócio, documentação e código                                                                                          |
| **Escopo**   | Documentação canônica e governança do projeto                                                                                                                                                                                          |
| **Entrega**  | Consolidação das decisões de acesso e produto, incluindo regra atual de clínicas para `PROFISSIONAL`, escopo de gestão de usuários por `isAdmin`/`ADMINISTRATIVO`, auditoria de mudanças de status e separação entre vigente e roadmap |
| **Arquivos** | `docs/ai/access-and-permissions.md`, `docs/ai/user-views.md`, `docs/ai/api-routes.md`, `docs/ai/decision-log.md`, `docs/ai/doc-index.md`                                                                                               |
| **Horas**    | 2h                                                                                                                                                                                                                                     |
| **Valor**    | R$ 100,00                                                                                                                                                                                                                              |
| **Status**   | Commitado em `b194886`                                                                                                                                                                                                                 |

### ENT-002 — Refinar regra de gestão de usuários

| Campo        | Valor                                                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | 18/08/2026                                                                                                                                          |
| **Motivo**   | Fechar ambiguidade sobre o que usuários sem `isAdmin` podem fazer em clínicas e consultórios                                                        |
| **Escopo**   | Governança documental / permissões                                                                                                                  |
| **Entrega**  | Regra formalizada: sem `isAdmin`, tudo no sistema exceto CRUD de usuários; `ADMINISTRATIVO` segue com acesso total por enquanto (questão em aberto) |
| **Arquivos** | `docs/ai/decision-log.md`, `docs/ai/access-and-permissions.md`, `docs/ai/user-views.md`, `docs/ai/api-routes.md`                                    |
| **Horas**    | 0,5h                                                                                                                                                |
| **Valor**    | R$ 25,00                                                                                                                                            |
| **Status**   | Commitado em `b194886`                                                                                                                              |

### ENT-003 — Marcar `isAdmin` / admin local como questão em aberto

| Campo        | Valor                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | 18/08/2026                                                                                                                                                        |
| **Motivo**   | Evitar fechar prematuramente regras de admin local que ainda não serão implementadas                                                                              |
| **Escopo**   | Governança documental / permissões                                                                                                                                |
| **Entrega**  | `isAdmin` documentado como intenção de admin local; contrato de gestão de usuários marcado como em aberto; comportamento atual do código descrito sem enforcement |
| **Arquivos** | `docs/ai/decision-log.md`, `docs/ai/access-and-permissions.md`, `docs/ai/user-views.md`, `docs/ai/api-routes.md`                                                  |
| **Horas**    | 0,25h                                                                                                                                                             |
| **Valor**    | R$ 12,50                                                                                                                                                          |
| **Status**   | Commitado em `b194886`                                                                                                                                            |

### ENT-004 — Planejar Assistente administrativo (piloto Gemini)

| Campo        | Valor                                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | 19/08/2026                                                                                                                                         |
| **Motivo**   | Testar orientação por chat com administradores, reusando Gemini gratuito e excluindo DeepSeek, antes de qualquer código                            |
| **Escopo**   | Governança documental / planejamento de produto                                                                                                    |
| **Entrega**  | Plano do piloto: chatbot para `ADMINISTRATIVO`, Gemini no servidor, sem escrita de dados; documento `admin-assistant.md` e entrada no decision-log |
| **Arquivos** | `docs/ai/admin-assistant.md`, `docs/ai/decision-log.md`, `docs/ai/doc-index.md`, `docs/ai/patterns.md`, `docs/ai/user-views.md`                    |
| **Horas**    | 0,75h                                                                                                                                              |
| **Valor**    | R$ 37,50                                                                                                                                           |
| **Status**   | Commitado em `b194886`                                                                                                                             |

### ENT-005 — Fechar decisões do piloto do Assistente

| Campo        | Valor                                                                                                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data**     | 19/08/2026                                                                                                                                                                                                                                                               |
| **Motivo**   | Desbloquear a implementação futura fechando UI, cota, histórico, privacidade do admin e o modelo de contratos para outros papéis                                                                                                                                         |
| **Escopo**   | Governança documental / planejamento de produto                                                                                                                                                                                                                          |
| **Entrega**  | Sete decisões fechadas: widget; docs internas para admin; sem máscara/recusa no piloto admin; histórico só na sessão; 30 perguntas/dia no servidor; nome Assistente; sempre visível para `ADMINISTRATIVO`. Contratos por papel obrigatórios antes de clínica/consultório |
| **Arquivos** | `docs/ai/admin-assistant.md`, `docs/ai/decision-log.md`, `docs/ai/patterns.md`, `docs/ai/access-and-permissions.md`                                                                                                                                                      |
| **Horas**    | 0,5h                                                                                                                                                                                                                                                                     |
| **Valor**    | R$ 25,00                                                                                                                                                                                                                                                                 |
| **Status**   | Commitado em `b194886`                                                                                                                                                                                                                                                   |

### ENT-006 — Atrasados e marcar como atendido no painel administrativo

| Campo        | Valor                                                                                                                                                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | 19/08/2026                                                                                                                                                                                                                                                                  |
| **Motivo**   | Simplificar a conclusão de encaminhamentos pelos administradores e tornar visíveis os agendamentos que passaram do dia                                                                                                                                                      |
| **Escopo**   | Encaminhamentos / painel administrativo                                                                                                                                                                                                                                     |
| **Entrega**  | Botão Marcar como atendido com modal de confirmação; aba Atrasados (Ativos segue mostrando todos, inclusive atrasados); destaque visual (faixa, fundo e selo); rota `PATCH /api/referrals/:id/complete` com auditoria                                                       |
| **Arquivos** | `src/app/(dashboard)/admin/page.tsx`, `src/app/api/referrals/[id]/complete/route.ts`, `src/features/referrals/overdue.ts`, `src/features/referrals/components/mark-attended-dialog.tsx`, `docs/ai/referral-management.md`, `docs/ai/user-views.md`, `docs/ai/api-routes.md` |
| **Horas**    | 1,5h                                                                                                                                                                                                                                                                        |
| **Valor**    | R$ 75,00                                                                                                                                                                                                                                                                   |
| **Status**   | Commitado em `b194886`                                                                                                                                                                                                                                                      |

### ENT-007 — Auditoria de status e limpeza de pendências

| Campo        | Valor                                                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | 19/08/2026                                                                                                                                                                 |
| **Motivo**   | A diretriz de auditar toda mudança de status não valia no agendamento nem na conclusão pelo médico; o roadmap de maio/2026 induzia erro (Organization “inexistente”)       |
| **Escopo**   | Encaminhamentos / governança documental                                                                                                                                    |
| **Entrega**  | `ReferralStatusAudit` em schedule e specialist; i18n da casca da listagem admin; `documentation-roadmap.md` atualizado para 19/08/2026                                     |
| **Arquivos** | `src/app/api/referrals/[id]/schedule/route.ts`, `src/app/api/referrals/[id]/specialist/route.ts`, `src/app/(dashboard)/admin/page.tsx`, `docs/ai/documentation-roadmap.md` |
| **Horas**    | 1h                                                                                                                                                                         |
| **Valor**    | R$ 50,00                                                                                                                                                                  |
| **Status**   | Commitado em `b194886`                                                                                                                                                     |

### ENT-008 — Piloto do Assistente administrativo

| Campo        | Valor                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | 19/08/2026                                                                                                                                |
| **Motivo**   | Orientar administradores no uso do sistema com Gemini gratuito, sem DeepSeek, com cota folgada e fallback entre modelos                   |
| **Escopo**   | Assistente / painel administrativo                                                                                                        |
| **Entrega**  | Widget nas telas `/admin`, rota autenticada, 200 perguntas/dia no servidor, histórico só na sessão, UI alinhada às cores do Integra Visão |
| **Arquivos** | `src/features/assistant/*`, `src/lib/ai/gemini.ts`, `src/app/api/admin/assistant/chat/route.ts`, `prisma/schema.prisma`                   |
| **Horas**    | 2,5h                                                                                                                                      |
| **Valor**    | R$ 125,00                                                                                                                                 |
| **Status**   | Commitado em `b194886`                                                                                                                    |

### ENT-009 — Consulta genérica do Assistente

| Campo        | Valor                                                                                                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | 19/08/2026                                                                                                                                                                                                                                   |
| **Motivo**   | Totais fixos preveriam a pergunta; o administrador precisa de recorte na hora, sem despejar a lista das telas                                                                                                                                |
| **Escopo**   | Assistente / painel administrativo                                                                                                                                                                                                           |
| **Entrega**  | Manual e contrato do Assistente; consulta com assunto, filtros e quebra; duas passagens no Gemini; reconexão se o banco encerrar a sessão; autonomia extra (ranking) documentada como a fazer                                                |
| **Arquivos** | `src/features/assistant/consulta-engine.ts`, `src/app/api/admin/assistant/queries/route.ts`, `src/app/api/admin/assistant/chat/route.ts`, `docs/ai/assistant-contract.md`, `docs/ai/assistant-knowledge.md`, `docs/ai/assistant-autonomy.md` |
| **Horas**    | 2h                                                                                                                                                                                                                                           |
| **Valor**    | R$ 100,00                                                                                                                                                                                                                                    |
| **Status**   | Commitado em `b194886`                                                                                                                                                                                                                       |

### ENT-010 — Layout das ações na lista admin

| Campo        | Valor                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| **Data**     | 19/08/2026                                                                                                    |
| **Motivo**   | O botão Marcar como atendido quebrava o texto e empurrava editar/excluir na coluna de ações                   |
| **Escopo**   | Encaminhamentos / painel administrativo                                                                       |
| **Entrega**  | Coluna de ações em ícones alinhados (concluir, agendar, editar, excluir); rótulo completo no mouse e no modal |
| **Arquivos** | `src/app/(dashboard)/admin/page.tsx`, `docs/ai/referral-management.md`                                        |
| **Horas**    | 0,5h                                                                                                          |
| **Valor**    | R$ 25,00                                                                                                      |
| **Status**   | Commitado em `b194886`                                                                                        |

#### Commits

- `b194886` — feat: piloto do Assistente, atrasados e consulta operacional no admin

---

## Modelo para novas entregas

```markdown
### ENT-XXX — [Título curto]

| Campo        | Valor                                |
| ------------ | ------------------------------------ |
| **Data**     | DD/MM/AAAA                           |
| **Motivo**   | [Por que a entrega foi necessária]   |
| **Escopo**   | [Módulo / domínio]                   |
| **Entrega**  | [Resumo objetivo do que foi feito]   |
| **Arquivos** | `caminho/arquivo`, `caminho/arquivo` |
| **Horas**    | Xh                                   |
| **Valor**    | R$ 0,00                              |
| **Status**   | Aguardando commit / Commitado        |

#### Commits

- `hash` — mensagem
```

---

## Observações

- O nome oficial do produto é **Integra Visão**.
- Roadmap e decisões futuras devem ser registrados separadamente dos contratos vigentes.
- Este relatório é exclusivo deste projeto e não deve ser misturado com outros clientes ou repositórios.
