# Análise Técnica e Estimativa de Custo - Plataforma Web CISO

Este documento apresenta uma análise detalhada para a evolução da plataforma **CISO**, migrando de uma arquitetura baseada em dados estáticos (mocks) para uma solução robusta com banco de dados real, integração direta via Prisma e sistema de níveis de acesso.

## 1. Escopo Técnico Atualizado

### 1.1 Arquitetura Monolítica Modificada (Next.js + Prisma)

Conforme solicitado, não haverá uma API separada. Utilizaremos o **Next.js 13+ (App Router)** com **Server Actions** e **Prisma ORM** agindo diretamente sobre o banco de dados. Isso simplifica o deploy e reduz a latência de comunicação.

### 1.2 Modelagem de Dados (Clinic-Centric)

A lógica de "Médico" será refatorada para focar na "Clínica".

- **Clínica**: Entidade principal com nome, CNPJ/Dados, e um campo de **Prazo** (vencimento do contrato ou acesso).
- **Médico**: Vinculado a uma ou mais clínicas.
- **Relacionamento**: Muitos-para-Muitos entre Clínicas e Médicos.

### 1.3 Níveis de Usuário (RBAC)

Implementação de controle de acesso baseado em funções:

- **Admin**: Gestão total (Núcleos, Exames, Clínicas, Usuários).
- **Centro (Núcleo)**: Operação de triagem e encaminhamento.
- **Clínica/Médico**: Visualização de encaminhamentos e prontuários.
- **Optometrista**: Realização de exames e encaminhamentos iniciais.

## 2. Prazos e Esforço Estimado

A conversão do projeto atual (que está em estágio de protótipo com mocks) para um sistema pronto para produção envolve as seguintes etapas:

| Etapa                  | Descrição                                                                        | Horas Esti.    |
| :--------------------- | :------------------------------------------------------------------------------- | :------------- |
| **Setup & Infra**      | Configuração do Prisma, Bancos de Dados (PostgreSQL/MySQL) e Auth (NextAuth.js). | 12h - 16h      |
| **Modelagem DB**       | Criação do Schema Prisma (Users, Clinics, Doctors, Exams, Protocols, Exams).     | 8h - 10h       |
| **Migração de Lógica** | Substituição dos `mocks` por chamadas de banco em todas as páginas existentes.   | 35h - 45h      |
| **Gestão de Clínicas** | Desenvolvimento do CRUD de Clínicas (com médicos vinculados e prazos).           | 15h - 20h      |
| **RBAC & Segurança**   | Implementação de Middleware para proteção de rotas e níveis de acesso.           | 10h - 12h      |
| **Testes & Ajustes**   | Validação de fluxos ponta a ponta e correção de bugs.                            | 15h - 20h      |
| **Total Estimado**     |                                                                                  | **95h - 123h** |

## 3. Estimativa de Custo

Os valores variam de acordo com o modelo de contratação (Freelance vs. Agência) e a senioridade do profissional.

### Cenário A: Freelancer Júnior / Iniciante

- **Valor Hora Médio**: R$ 50,00
- **Investimento Total**: **R$ 4.750,00 a R$ 6.150,00**

### Cenário B: Freelancer Pleno/Sênior

- **Valor Hora Médio**: R$ 100,00 - R$ 180,00
- **Investimento Total**: **R$ 9.500,00 a R$ 22.140,00**

### Cenário C: Agência de Desenvolvimento

- **Valor Hora Médio**: R$ 200,00 - R$ 350,00
- **Investimento Total**: **R$ 19.000,00 a R$ 43.000,00**

> [!NOTE]
> Estes valores são estimativas baseadas na complexidade de migrar um frontend já existente para um sistema full-stack funcional. Custos de infraestrutura (Hospedagem Vercel/Supabase/AWS) não estão inclusos.

## 4. Próximos Passos Recomendados

1.  **Definição do Banco de Dados**: Recomenda-se **PostgreSQL** para melhor compatibilidade com Prisma e escalabilidade.
2.  **Configuração do Ambiente**:
    - Instalação do `@prisma/client` e `prisma`.
    - Inicialização do schema com as tabelas de `User`, `Clinic` e `Doctor`.
3.  **Refatoração do Cadastro de Admin**: Adaptar a tela de `admin/page.tsx` para gerenciar Clínicas em vez de apenas Núcleos/Exames isolados.

## 5. Exemplo de Estrutura Prisma (Draft)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      String   // ADMIN, CLINIC, OPTOM, CENTER
  doctor    Doctor?
}

model Clinic {
  id        String   @id @default(cuid())
  name      String
  deadline  DateTime
  doctors   Doctor[]
  createdAt DateTime @default(now())
}

model Doctor {
  id        String   @id @default(cuid())
  name      String
  crm       String
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  clinics   Clinic[]
}
```

Este documento serve como base para negociações e planejamento de cronograma.
