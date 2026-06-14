# Documento de Orçamento e Valoração de Projeto

Este documento apresenta uma análise detalhada da arquitetura, funcionalidades, banco de dados e infraestrutura da plataforma **Integra Visão (ciso-plataforma-web)**, estimando o valor total de desenvolvimento com base em uma taxa de mercado de **R$ 110,00 por hora**.

---

## 📊 1. Resumo Executivo

A plataforma **Integra Visão** é um sistema full-stack do tipo SaaS multi-tenant voltado para a área médica, especificamente para o fluxo de encaminhamentos de pacientes de consultórios parceiros (profissionais/optometristas) para clínicas especializadas e atendimento médico especialista.

- **Tecnologia Core:** Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, NextAuth.js.
- **Banco de Dados:** PostgreSQL (Neon Serverless).
- **Hospedagem & Infraestrutura:** Vercel (Serverless e Edge functions).
- **Taxa Horária de Referência:** R$ 110,00/hora.
- **Esforço Estimado Total:** 242 horas.
- **Valor de Desenvolvimento Estimado:** **R$ 26.620,00**

---

## 🏗️ 2. Arquitetura e Engenharia de Software

O projeto segue padrões modernos e escaláveis de engenharia web:

1.  **Next.js 13+ (App Router):** Utilização de Server Components e Route Handlers (API interna) para alto desempenho e SEO.
2.  **Organização em Features:** Separação lógica de responsabilidades na pasta `src/features/` para modularizar regras de negócio complexas.
3.  **Segurança por Tenant (Multi-tenancy):** Isolamento de dados integrado a nível de banco de dados (`organizationId`) garantindo privacidade entre diferentes clínicas e consultórios.
4.  **Internacionalização (i18n):** Estrutura multi-idioma (pt-BR e en-US) configurada com `next-intl`.
5.  **Qualidade de Código & Testes:** Suíte de testes automatizados configurada com Jest e React Testing Library, além de validação estática de schemas com Zod.

---

## 🗄️ 3. Modelo e Estrutura de Banco de Dados

O banco de dados modelado no Prisma (`schema.prisma`) possui **12 tabelas** estruturadas de forma relacional:

- `User`: Armazena credenciais, roles de acesso (Administrativo, Médico, Profissional) e vinculação de tenant.
- `Organization`: Entidade principal para multi-tenant (separa Clínicas de Grupos Profissionais).
- `ProfessionalAccess`: Controla quais grupos profissionais têm permissão de encaminhar pacientes para quais clínicas.
- `CareNucleus` e `CareService`: Catálogo de núcleos de atendimento médico (ex: Glaucoma, Catarata) e seus respectivos exames/serviços com preços bases.
- `Referral`: Tabela transacional principal de encaminhamentos, que armazena dados de pacientes, status (`Encaminhado`, `Agendado`, `Atendido`), médico atribuído, condutas do especialista, e snapshots dos preços praticados na criação do encaminhamento.
- `ReferralDocument` e `ReferralAttachment`: Uploads de prontuários, documentos e exames médicos.

---

## 📦 4. Detalhamento de Módulos e Estimativa de Horas

Abaixo está o mapeamento detalhado dos módulos do sistema, estimando o tempo necessário para análise, codificação, estilização, testes e validação de cada um deles.

### Módulo 1: Setup do Projeto e Modelagem do Banco de Dados

- _Descrição:_ Inicialização do Next.js com TypeScript e Tailwind CSS, configuração do Prisma ORM, modelagem relacional das 12 tabelas, criação de migrations, seeding inicial de dados e configuração do ambiente local.
- _Esforço:_ 20 horas.
- _Valor:_ R$ 2.200,00.

### Módulo 2: Autenticação, Autorização e Proteção Multi-tenant

- _Descrição:_ Integração do NextAuth.js com Credentials Provider, proteção de rotas através de Next.js Middlewares, extensão das sessões para injetar `role` e `organizationId`, controle de acessos em rotas de API.
- _Esforço:_ 25 horas.
- _Valor:_ R$ 2.750,00.

### Módulo 3: Painel Administrativo (Admin Dashboard)

- _Descrição:_ Painel de controle central para os gestores do sistema composto por 9 sub-módulos:
  1.  _Gestão de Organizações_ (criação e edição de clínicas e grupos).
  2.  _Controle de Acessos_ (vinculação de grupos profissionais às clínicas).
  3.  _Gestão de Usuários_ (gerenciamento de permissões e convites).
  4.  _Núcleos de Atendimento_ (catálogo de núcleos médicos).
  5.  _Serviços do Núcleo_ (catálogo de exames e precificação).
  6.  _Relatórios Gerenciais_ e _Fluxos Financeiros_.
- _Esforço:_ 60 horas.
- _Valor:_ R$ 6.600,00.

### Módulo 4: Painel do Profissional (Optometristas / Consultórios)

- _Descrição:_ Interface de trabalho para o profissional que realiza a triagem primária:
  - Lista de encaminhamentos enviados com paginação e filtros avançados.
  - Formulário de "Novo Encaminhamento" com validação estática de dados, upload de anexos de exames, cálculo de custo dinâmico e escolha do núcleo destino.
  - Modal detalhado de visualização do encaminhamento.
  - Modal de edição para status `Encaminhado` (recente implementação).
  - Exclusão lógica de encaminhamentos.
- _Esforço:_ 35 horas.
- _Valor:_ R$ 3.850,00.

### Módulo 5: Painel da Clínica (Triagem e Agendamento)

- _Descrição:_ Área dedicada à equipe administrativa da clínica receptora dos pacientes:
  - Monitoramento de novos encaminhamentos recebidos.
  - Módulo de Triage (Triagem) onde os encaminhamentos passam para status `Agendado` com definição de data/hora e atribuição do médico responsável.
- _Esforço:_ 30 horas.
- _Valor:_ R$ 3.300,00.

### Módulo 6: Painel do Médico Especialista

- _Descrição:_ Painel focado no atendimento do médico especialista na clínica:
  - Visualização de prontuário e ficha de encaminhamento do paciente.
  - Formulário de preenchimento de condutas e pareceres médicos.
  - Anexo de relatórios pós-exame.
  - Alteração de status para `Atendido`.
- _Esforço:_ 25 horas.
- _Valor:_ R$ 2.750,00.

### Módulo 7: Internacionalização (i18n)

- _Descrição:_ Configuração de middleware de localização da linguagem, mapeamento de arquivos JSON de traduções (pt-BR e en-US), tratamento de validação de schemas em múltiplos idiomas.
- _Esforço:_ 15 horas.
- _Valor:_ R$ 1.650,00.

### Módulo 8: Infraestrutura e Integração Contínua (CI/CD)

- _Descrição:_ Configuração do repositório no GitHub integrado ao Vercel para deploys automatizados na branch `main`, configuração de variáveis de produção do Neon DB no console da Vercel, execução de migrations de produção no build step.
- _Esforço:_ 12 - horas.
- _Valor:_ R$ 1.320,00.

### Módulo 9: Testes Unitários e de Integração

- _Descrição:_ Escrita de testes com Jest e Mocking de dados para validar fluxos de formulários (Zod), hooks de renderização de estados e requisições HTTP simuladas.
- _Esforço:_ 20 horas.
- _Valor:_ R$ 2.200,00.

---

## 🏷️ 5. Resumo Geral de Custos

| Módulo    | Descrição do Escopo                           | Horas Estimadas | Custo (R$ 110/h) |
| :-------- | :-------------------------------------------- | :-------------: | :--------------: |
| **01**    | Setup do Projeto & Modelagem de DB            |       20h       |   R$ 2.200,00    |
| **02**    | Autenticação & Regras Multi-tenant            |       25h       |   R$ 2.750,00    |
| **03**    | Painel Administrativo (9 Sub-módulos)         |       60h       |   R$ 6.600,00    |
| **04**    | Painel do Profissional (Criar/Editar/Excluir) |       35h       |   R$ 3.850,00    |
| **05**    | Painel da Clínica (Triagem & Agendamento)     |       30h       |   R$ 3.300,00    |
| **06**    | Painel do Médico Especialista                 |       25h       |   R$ 2.750,00    |
| **07**    | Tradução e Internacionalização (i18n)         |       15h       |   R$ 1.650,00    |
| **08**    | Infraestrutura Vercel + Neon DB               |       12h       |   R$ 1.320,00    |
| **09**    | Cobertura de Testes Automatizados             |       20h       |   R$ 2.200,00    |
| **Total** | **Escopo Completo da Plataforma**             |    **242h**     | **R$ 26.620,00** |

---

## 💡 6. Conclusão da Valoração

O projeto **Integra Visão** é avaliado em **R$ 26.620,00** em valor de desenvolvimento de software puro.

Esta valoração reflete um sistema robusto pronto para produção, com segurança aprimorada contra acessos indevidos e código-fonte com alta manutenibilidade. Caso fosse adicionada a gestão operacional ou de design customizado (UI/UX dedicado), o projeto poderia facilmente alcançar a faixa de **R$ 30.000,00 a R$ 35.000,00** no mercado de agências de desenvolvimento de software no Brasil.
