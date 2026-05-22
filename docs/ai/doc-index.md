# Indice de Documentacao para IA

Este arquivo e o ponto de entrada obrigatorio para qualquer agente antes de codar.

## Ordem de leitura recomendada

1. README.md
2. docs/ai/doc-index.md (este arquivo)
3. Documentos especificos do dominio afetado

## Mapa rapido por assunto

### Visao geral e arquitetura

- README.md
- docs/ai/patterns.md (padroes recorrentes: feature module, i18n, componentes, testes)
- src/features (organizacao por dominio)
- src/components/ui (componentes base)
- src/components/ui/index.tsx (barrel export — lista completa de componentes)
- src/components/forms (wrappers de formulario)

### Formularios e validacoes

- src/app/(dashboard)/admin/schema.ts
- src/app/(dashboard)/admin/hooks.ts
- src/app/(dashboard)/clinica/schema.ts
- src/app/(dashboard)/clinica/hooks.ts
- src/app/(dashboard)/profissional/schema.ts
- src/app/(dashboard)/profissional/hooks.ts
- src/app/(dashboard)/profissional/novo/schema.ts
- src/components/forms/field.tsx
- docs/ai/patterns.md (secao 1 e 4)

### Internacionalizacao

- i18n.ts
- middleware.ts
- src/i18n/request.ts
- src/i18n/config.ts
- src/i18n/messages.ts
- src/i18n/messages/pt-BR.json
- src/i18n/messages/en-US.json

### Layout e navegacao

- src/app/layout.tsx
- src/app/(dashboard)/layout.tsx
- src/components/layout/sidebar.tsx
- src/components/layout/layout-shell.tsx

### API, servicos e dados

- src/app/api/health/route.ts
- src/app/api/referrals/route.ts
- src/features/referrals/service.ts
- src/features/referrals/types.ts
- src/features/auth/service.ts
- src/features/auth/types.ts
- src/lib/prisma.ts
- src/lib/api-auth.ts (helpers obrigatorios de autenticacao/autorizacao em rotas API)
- prisma/schema.prisma
- src/env.ts
- docs/ai/database-structure.md (estrutura das tabelas e relacoes do banco)
- docs/ai/security-checklist.md (CHECKLIST OBRIGATORIO antes de criar/alterar rota API)

### Modelo de Acesso e Permissoes (OBRIGATORIO LER ANTES DE QUALQUER MUDANCA)

- docs/ai/access-and-permissions.md (roles, vinculacao organizacional, matriz de permissoes, fluxos)
- docs/ai/user-views.md (telas e views por role, rotas, funcionalidades)
- docs/ai/api-routes.md (endpoints REST, payloads, respostas, permissoes por endpoint)
- docs/ai/security-checklist.md (padrao obrigatorio para handlers de API)

> **IMPORTANTE**: Qualquer mudanca que envolva autenticacao, autorizacao, criacao de roles, acesso a dados OU API deve consultar estes documentos primeiro.

### Qualidade e automacao

- package.json (scripts)
- .husky/pre-commit (lint-staged: ESLint + Prettier em arquivos staged)
- .husky/pre-push (npm run build: executa antes de git push)
- .eslintrc.json
- .prettierrc.json
- jest.config.ts
- jest.setup.ts

## Checklist antes de implementar

- O problema ja esta descrito em algum arquivo?
- Existe componente reutilizavel para o caso?
- Existe schema de validacao para adaptar ao inves de duplicar?
- Todos os textos novos estao em chaves de traducao?
- A mudanca afeta testes existentes?

## Checklist antes de finalizar

- Rodar lint e build com sucesso.
- Rodar testes quando houver impacto funcional.
- Atualizar este indice se novos documentos foram criados.
- Registrar no README quando mudar fluxo estrutural.
