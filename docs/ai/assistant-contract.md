# Contrato do Assistente — o que faz e o que não faz

**Status:** CONTRATO VIGENTE no código do piloto (19/08/2026).  
**Público do piloto:** só `ADMINISTRATIVO`.  
**Documento irmão:** `assistant-knowledge.md`.

Princípio: o Assistente **não decora** o sistema e **não usa relatório pronto**. Lê o manual; se a pergunta pedir número, **monta uma consulta** (recorte + quebra); o servidor agrega.

**Autonomia extra (A2 destacar / A3 localizar):** planejamento em `docs/ai/assistant-autonomy.md`. Ainda **não** vigente no código — por isso “paciente mais recorrente” hoje é recusado.

---

## 1. Missão

Ajudar o administrador a entender o Integra Visão, obter totais do recorte pedido e abrir a tela certa. Não substitui as telas. Não opera cadastro.

---

## 2. Pode / não pode

**Pode:** explicar regras do manual; atalho de tela; números **só** depois de uma consulta válida; admitir que não sabe.

**Não pode:** alterar dados; inventar cifra; listar pacientes; buscar a internet; atender médico/consultório; usar a lista completa das telas; ensinar caminho técnico.

Relatórios hoje abre o Financeiro.

---

## 3. Manual + consulta (não relatório)

Relatório fixo (“totais de atrasados”, “receita por núcleo”) **prevê a pergunta**. Isso foi descartado.

O modelo recebe:

1. o **manual** (regras e nomes de tela);
2. a **gramática da consulta** (o que é possível recortar/quebrar) — não os números.

Se precisar de dado, pede a consulta. O servidor devolve linhas de total. Aí o modelo fala com a pessoa.

`docs/ai` técnico não vai para o modelo.

---

## 4. Gramática

- **assunto:** encaminhamentos | financeiro | cadastros
- **medir:** quantidade e/ou receita
- **quebrarPor:** até 2 (`situacao`, `nucleo`, `clinica`, `consultorio`, `mes`; cadastros: `papel`, `tipo`)
- **filtros:** situação, só atrasados, período, nome de clínica/consultório/núcleo; financeiro **sem** Bloqueado salvo `incluirBloqueados`

Resultado: `{ rotulo, quantidade, receita? }`. Sem paciente.

Ainda fora no código atual: “quem está atrasado?” nome a nome; “paciente mais recorrente”. Ver planejamento de autonomia.

Ampliar = nova **dimensão** neste contrato, não um relatório novo.

---

## 5. Fluxo no chat

1. Regra/tela → resposta direta.
2. Número → JSON da consulta → servidor agrega → resposta em linguagem de negócio (sem JSON).
3. Consulta inválida ou falha de banco → não inventa; aponta a tela.

POST `/api/admin/assistant/queries` com `{ "consulta": { ... } }` usa o mesmo motor. O Gemini não chama o endereço.

---

## 6. Código

- `src/features/assistant/consulta-engine.ts`
- duas passagens no Gemini quando houver consulta
- atalho `[rótulo](tela:codigo)`; aba `?aba=atrasados`

Critério: “atrasados da clínica X neste mês” funciona **sem** existir um relatório com esse nome.
