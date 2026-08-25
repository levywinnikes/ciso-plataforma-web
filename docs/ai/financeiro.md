# Financeiro administrativo — controle de comissões

**Status:** vigente (Fase A — 25/08/2026)  
**Rota:** `/admin/financeiro` (alias `/admin/relatorios`)  
**API:** `GET /api/admin/financeiro`  
**Papel:** somente `ADMINISTRATIVO`

## Objetivo de negócio

Painel para a operação **acompanhar o período e cobrar comissões** após a atuação do médico:

1. **Comissão — taxa de encaminhamento** (valor do núcleo no momento do encaminhamento).
2. **Comissão — indicação cirúrgica** (`surgeryId` + `surgeryPrice`).

Não é fluxo de caixa bancário (contas, Pix, saldo). Marcação “já cobrado/pago” fica fora desta fase.

## Regras

- `Bloqueado` **nunca** entra (salvo evolução futura com filtro explícito).
- Duas faixas **sempre rotuladas** separadamente; total = soma rotulada.
- Valor do núcleo: `nucleusSnapshotPrice` (histórico). Não usar o preço vivo do cadastro do núcleo.
- Valor de cirurgia: só se `surgeryId` estiver preenchido; usa `surgeryPrice`.
- Totais **“a cobrar”** somam apenas itens com status **`Atendido`** dentro do conjunto filtrado.
- Contagens (Atendido, com cirurgia, Encaminhado, Agendado) respeitam os filtros de período/status/consultório/cirurgia.

## Período

- **Default ao abrir:** mês civil corrente (Este mês).
- **Atalhos obrigatórios:** Hoje | Este mês | Mês anterior | Últimos 30 dias.
- Range livre (data início / fim) + **Pesquisar** / **Limpar** (Limpar → Este mês + filtros zerados).

### Semântica da data (Fase A)

| Status do item             | Data usada no filtro de período                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Atendido`                 | Data da transição para Atendido (`ReferralStatusAudit.toStatus = Atendido`, mais recente). Sem audit: fallback `updatedAt`. |
| `Encaminhado` / `Agendado` | `createdAt`                                                                                                                 |

## Filtros

- Consultório (opcional)
- Status: todos (exceto Bloqueado) | só Atendido | ou multi se evoluído
- Toggle **só com indicação cirúrgica**

## Resposta da API (contrato)

Query: `startDate`, `endDate` (ISO `YYYY-MM-DD`), `officeId?`, `onlyAttended?`, `onlyWithSurgery?`.

JSON inclui:

- `summary`: contagens + `commissionNucleus` + `commissionSurgery` + `commissionTotal` (só Atendido)
- `byNucleus`, `bySurgery`, `byStatus`
- `items`: lista de conferência (paciente, status, núcleo, cirurgia, valores, data de referência)
- `offices`: opções de filtro
- `period`: start/end aplicados

## UI

1. Barra de período + atalhos + Pesquisar/Limpar + demais filtros
2. KPIs a cobrar + contagens
3. Resumos por núcleo / cirurgia / status
4. Tabela detalhe

Gráficos e exportação: fases B/C (ver plano).

## Documentação relacionada

- `docs/ai/cirurgias.md` — indicação cirúrgica no encaminhamento
- `docs/ai/referral-management.md` — status e exclusão de Bloqueado em relatórios
- `docs/ai/decision-log.md` — decisão comissões pós-médico
