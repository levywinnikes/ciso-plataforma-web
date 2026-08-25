# Telas e Views por Role

Este documento descreve apenas as telas **vigentes** do `Integra Visão`.

Itens planejados, experimentais ou ainda não adotados como regra de produto devem ficar em roadmap ou decision log separado.

---

## ADMINISTRATIVO

### Dashboard principal

**Rota:** `/admin`

Capacidades:

- visão geral do sistema
- listagem de encaminhamentos
- aba/filtro de `Bloqueado`
- aba **Atrasados** (agendamento em dia anterior ao atual, ainda não `Atendido`); a aba Ativos continua mostrando todos os não bloqueados, inclusive atrasados
- destaque visual de atrasados (faixa, fundo suave e selo **Atrasado**)
- atalho **Marcar como atendido** com confirmação dos dados (status `Encaminhado` ou `Agendado`)
- edição administrativa de encaminhamentos
- atalhos para os módulos administrativos
- **Calendário de agendamentos** (aba própria, default, somente leitura na grade): carrega o mês via API; no painel do dia oferece as mesmas ações da lista (admin: atender/agendar/editar/excluir; profissional: ver/editar/excluir conforme status)

### Cadastros e operação administrativa

Rotas atualmente presentes no projeto:

- `/admin/novo`
- `/admin/clinicas`
- `/admin/grupos-profissionais`
- `/admin/usuarios`
- `/admin/convenios`
- `/admin/nucleos`
- `/admin/servicos`
- `/admin/cirurgias`
- `/admin/financeiro`
- `/admin/organizacoes`
- `/admin/relatorios`
- `/admin/acessos`

Observações:

- a presença da rota não significa que o módulo esteja fechado como contrato de negócio
- `admin/acessos` e `ProfessionalAccess` não governam o fluxo vigente de encaminhamento neste momento
- financeiro e relatórios devem excluir `Bloqueado` por padrão
- **Assistente (chat):** piloto vigente para `ADMINISTRATIVO` — widget flutuante nas telas `/admin`. Clínica e consultório só depois de contrato por papel. Ver `docs/ai/admin-assistant.md`.

---

## MEDICO

### Dashboard médico

**Rota:** `/medico`

Capacidades vigentes:

- listar encaminhamentos da clínica
- visualizar apenas o fluxo clínico (`Agendado` e `Atendido`)
- **Calendário de agendamentos** (aba própria, default, somente leitura): carrega o mês via API (`appointmentFrom`/`appointmentTo`); lista pagina via `page`/`pageSize`
- abas **Calendário** | **Lista**
- calendário por `appointmentDate` (clique abre a ficha)
- preencher notas, conduta e anexos do especialista
- concluir atendimento quando aplicável

Restrições:

- não enxerga encaminhamentos `Bloqueado`
- não administra encaminhamentos de outras clínicas

### Colaboradores da organização

**Rota:** `/organizacao/usuarios`

Capacidades atuais (comportamento no código):

- a tela existe para `MEDICO` e `PROFISSIONAL`
- gestão de colaboradores da própria organização está disponível, mas **sem contrato fechado** sobre quem deveria ter acesso

**Questão em aberto:** `isAdmin` como admin local para restringir essa área — não implementar por enquanto.

---

## PROFISSIONAL

### Dashboard profissional

**Rota:** `/profissional`

Capacidades vigentes:

- **Calendário de agendamentos** (aba própria, default, somente leitura): mês via API; sem data ficam só na lista paginada
- listar e paginar encaminhamentos próprios via API (`page`/`pageSize`/`tab`)
- se `isAdmin=true`, acompanhar encaminhamentos de todo o consultório (comportamento já no código)
- usar aba/filtro `Bloqueado`
- editar e excluir encaminhamentos enquanto estiverem em status inicial permitido

### Novo encaminhamento

**Rota:** `/profissional/novo`

Capacidades vigentes:

- cadastrar dados do paciente
- escolher clínica destino
- escolher núcleo e convênio quando aplicável
- anexar documentos
- salvar como `Encaminhado` ou `Bloqueado`

Regra vigente para escolha de clínica:

- o sistema pode listar **todas as clínicas**
- `ProfessionalAccess` fica fora da regra operacional atual

### Colaboradores da organização

**Rota:** `/organizacao/usuarios`

Capacidades atuais (comportamento no código):

- a tela existe para `MEDICO` e `PROFISSIONAL`
- gestão de colaboradores da própria organização está disponível, mas **sem contrato fechado** sobre quem deveria ter acesso

**Questão em aberto:** `isAdmin` como admin local para restringir essa área — não implementar por enquanto.

---

## Rotas legadas e compatibilidade

- `/optometrista` → redireciona para `/profissional`
- `/optometrista/novo` → redireciona para `/profissional/novo`
- `/centro` → rota legada/deprecada
- `/clinica` → rota existente no projeto, mas fora do fluxo principal vigente definido para o produto

---

## Resumo de rotas vigentes

| Rota                          | Papel                     | Uso atual                                                   |
| ----------------------------- | ------------------------- | ----------------------------------------------------------- |
| `/admin`                      | `ADMINISTRATIVO`          | Dashboard global                                            |
| `/admin/novo`                 | `ADMINISTRATIVO`          | Novo encaminhamento administrativo                          |
| `/admin/clinicas`             | `ADMINISTRATIVO`          | Gestão de clínicas                                          |
| `/admin/grupos-profissionais` | `ADMINISTRATIVO`          | Gestão de grupos profissionais                              |
| `/admin/usuarios`             | `ADMINISTRATIVO`          | Gestão administrativa de usuários                           |
| `/admin/convenios`            | `ADMINISTRATIVO`          | Gestão de convênios                                         |
| `/admin/nucleos`              | `ADMINISTRATIVO`          | Gestão de núcleos                                           |
| `/admin/servicos`             | `ADMINISTRATIVO`          | Gestão de serviços                                          |
| `/admin/cirurgias`            | `ADMINISTRATIVO`          | Gestão de cirurgias                                         |
| `/admin/financeiro`           | `ADMINISTRATIVO`          | Comissões pós-médico (período + a cobrar núcleos/cirurgias) |
| `/medico`                     | `MEDICO`                  | Operação clínica                                            |
| `/profissional`               | `PROFISSIONAL`            | Encaminhamentos do profissional                             |
| `/profissional/novo`          | `PROFISSIONAL`            | Novo encaminhamento                                         |
| `/organizacao/usuarios`       | `MEDICO` / `PROFISSIONAL` | Colaboradores da própria organização                        |
