# Autonomia do Assistente — planejamento

**Status:** A FAZER. Planejamento fechado; **não** implementar até pedido explícito.  
**Vigente hoje:** só orientar + consulta agregada **sem** pessoa (`assistant-contract.md`).  
**Público:** só `ADMINISTRATIVO` (o piloto já manda a pergunta ao Gemini sem máscara).

---

## O problema

A pergunta **“Qual é o paciente mais recorrente?”** é um recorte operacional que o administrador **já vê** na lista (nomes, várias linhas da mesma pessoa). O Assistente recusou porque o contrato atual trata _qualquer nome_ como proibido.

Isso não é “prever um relatório de paciente recorrente”. É o mesmo motor de consulta, com permissão de **destacar** quem já aparece na operação. Recusar vira engessamento: o chat só fala de totais anônimos, como um relatório mudo.

Autonomia aqui **não** é o modelo escrever no banco nem inventar SQL. É ele **decidir sozinho** se precisa consultar, o que recortar e se o resultado é um total, um ranking ou um caso.

---

## O que autonomia significa

O Assistente escolhe, a cada pergunta:

1. só explicar (manual + atalho de tela);
2. **consultar** o recorte;
3. **responder** com o que voltou — inclusive um nome, se a operação permitir.

O servidor continua no meio: valida, agrega, limita. O modelo não baixa a base e não altera cadastro.

---

## Camadas (do mais fechado ao mais livre)

| Camada           | O Assistente pode                                                                                 | Exemplo                                                 | Código hoje                 |
| ---------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------- |
| **A0 Orientar**  | Regras, telas, atalhos. Sem banco.                                                                | “Como marco como atendido?”                             | Sim                         |
| **A1 Agregar**   | Totais por situação, núcleo, clínica, mês… sem pessoa                                             | “Quantos atrasados neste mês?”                          | Sim                         |
| **A2 Destacar**  | Ranking curto (top 5) do que o admin já vê, **com rótulo** (paciente, clínica, consultório…)      | “Paciente mais recorrente”; “qual clínica mais recebe?” | Não                         |
| **A3 Localizar** | Até 5 linhas de um caso (nome, situação, data, clínica, núcleo) — os mesmos campos da lista admin | “Tem encaminhamento do João?”                           | Não                         |
| **A4 Agir**      | Marcar como atendido, editar, excluir pelo chat                                                   | —                                                       | **Não** (só aponta o botão) |

Proposta para o próximo ciclo de código: **ligar A2**. A3 numa decisão seguinte. A4 fora até alguém pedir agente que escreve.

---

## A2 na prática (próximo passo sugerido)

Não criar um relatório “paciente recorrente”. Ampliar a consulta genérica:

- operação: `agregar` (já existe) ou `rankear`
- `quebrarPor` passa a aceitar **`paciente`** (nome; se empatar, o servidor pode usar documento só para juntar linhas, **sem** devolver o documento)
- `limite`: padrão 1 para “o mais…”, máximo **5**
- `ordenarPor`: quantidade (depois receita, se financeiro)

“Paciente mais recorrente” vira: assunto encaminhamentos, rankear, quebrar por paciente, limite 1.  
“Top 3 clínicas” já quase existe em A1; A2 só deixa o modelo pedir **os primeiros**.

O que A2 **ainda não** faz:

- devolver telefone, documento ou justificativa na resposta;
- listar todos os pacientes;
- clínica/consultório (outros papéis).

Isso é coerente com a decisão vigente: administrador opera o sistema; o texto pode ir ao Gemini. A2 manda **um ou poucos nomes**, não a lista inteira.

---

## A3 (depois, se A2 funcionar)

`localizar` com texto da pergunta (nome). Até 5 coincidências. Campos da listagem admin. Atalho para Encaminhamentos. Sem anexos.

Se passar de 5: “há mais casos; abra a lista” + atalho. Sem despejar o restante no chat.

---

## O que permanece fechado

- Escrever dados (A4)
- SQL livre / “me manda tudo”
- Internet
- Médico e consultório sem contrato próprio
- Inventar número ou nome se a consulta falhar

---

## Relatório “criativo”

Sim: a autonomia é **combinar** o que já existe na operação, não ter um PDF/modelo para cada ideia.

O administrador inventa o recorte na frase. O Assistente traduz para assunto + filtros + quebra (+ ranking, quando A2 existir). Exemplos que **não** precisam de relatório prévio:

- atrasados da clínica X neste mês, por núcleo
- receita por consultório no período Y (sem bloqueados)
- paciente mais recorrente **em retina**
- top 5 clínicas com mais encaminhados ainda sem data

Isso é criativo no **recorte**. Não é criativo no **tipo de número**.

Se pedirem uma medida que o sistema **ainda não calcula**, ele não inventa. Exemplos que hoje (e no A2) **não** saem do chat:

- tempo médio até o agendamento
- taxa de conversão Encaminhado → Atendido ao longo do ano (série com fórmula nova)
- exportar planilha / gráfico
- “me monta um relatório igual ao do convênio Z com 12 colunas”

Resposta honesta nesses casos: dizer o que **consegue** aproximar com as dimensões atuais, ou mandar ao Financeiro / lista, sem fabricar a métrica.

Ampliar criatividade depois = nova **medida** ou **dimensão** no motor (ex.: convênio, dias de atraso), não uma lista de “relatórios criativos” previstos.

---

O servidor descreve **operações** (`agregar`, `rankear`, depois `localizar`), não uma lista de perguntas. O modelo escolhe a operação. Critério de pronto: a pergunta da tela (“paciente mais recorrente”) deixa de ser recusada e volta o nome com a quantidade de encaminhamentos, mais o atalho da lista se fizer sentido.

---

## Ordem (A FAZER)

1. Documentar (este arquivo) — **feito**
2. **A FAZER:** implementar **A2** (ranking, ex. paciente mais recorrente) — só quando pedir
3. Avaliar **A3** com uso real
4. **A4** só com decisão nova
