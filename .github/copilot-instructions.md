# Instrucoes para IA neste repositorio

Objetivo: garantir que qualquer agente de IA leia documentacao antes de implementar mudancas.

## Regra de ouro (obrigatoria)

Antes de criar ou alterar codigo, a IA deve:

1. Ler o indice em docs/ai/doc-index.md.
2. Abrir os documentos mapeados para a feature solicitada.
3. Confirmar restricoes tecnicas e de negocio encontradas.
4. So depois propor e aplicar alteracoes.

Se a IA nao encontrar documentacao suficiente, deve primeiro atualizar a documentacao necessaria e apenas entao implementar.

## Fluxo padrao de execucao

1. Entender o pedido e classificar o tipo de mudanca:

- UI/UX
- Formulario/validacao
- Internacionalizacao
- API/servico
- Dados/Prisma
- Testes
- Infra/qualidade

2. Consultar documentacao obrigatoria:

- docs/ai/doc-index.md
- README.md

3. Consultar documentacao especifica por dominio (via indice).

4. Implementar mantendo os padroes:

- Sem hardcode de textos de interface: usar chaves de traducao.
- Preferir componentes reutilizaveis para comportamentos recorrentes.
- Validacao de entrada via schema quando aplicavel.
- Nao quebrar contratos existentes de tipos e dados.

5. Validar antes de finalizar:

- npm run lint
- npm run build
- npm run test (quando houver impacto funcional)

6. Se algo novo foi decidido, registrar no local correto do indice.

## Criterios de qualidade para PR/entrega

- Mudanca pequena, focada e consistente com o dominio.
- Arquivos novos com responsabilidade clara.
- Sem duplicacao de regra de negocio em multiplos pontos.
- Sem regressao de i18n e sem strings de UI hardcoded.
- Evidencia de validacao local (lint/build/test).

## Quando criar novo documento

Criar documentacao nova apenas quando:

- Existe uma regra recorrente sem lugar claro no repositorio.
- A feature introduz um novo fluxo arquitetural.
- O custo de manutencao sem documento seria alto.

Sempre atualizar docs/ai/doc-index.md ao criar, mover ou remover documentos.
