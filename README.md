# CISO - Centro Integrado de Saúde Ocular

O **CISO** é uma plataforma inovadora de Gestão Inteligente para Saúde Ocular. Seu principal objetivo é conectar optometristas (na ponta primária), centros de triagem estruturados e médicos oftalmologistas especialistas, garantindo um fluxo de encaminhamento de pacientes ágil, rastreável e altamente eficiente.

## 🚀 O Problema e a Solução

Tradicionalmente, os encaminhamentos da visão primária (como os feitos por optometristas) para a oftalmologia especializada passam por papéis, mensagens informais ou guias físicas, causando lentidão, gargalos de informação e muitas vezes o não-retorno do laudo para a base.

**Nossa Solução:** Uma Plataforma Web (SaaS) centralizada baseada em **"Núcleos de Especialidades"**, orquestrando toda a jornada do paciente desde a triagem inicial óptica até o laudo final do cirurgião especialista, com controle rígido de pacotes de exames (Protocolos e Valores).

---

## 👥 Perfis de Acesso e Funcionalidades

A plataforma CISO divide o ecossistema em 4 perfis bem definidos:

### 1. ⚙️ Administrativo (Gestão de Núcleos)
Responsável por parametrizar o negócio e as finanças.
- **Catálogo de Exames Base:** Cadastro de todos os equipamentos e exames avulsos disponíveis na clínica, com seus respectivos preços (Ex: OCT, Galilei, Gonioscopia).
- **Montagem de Protocolos (Núcleos):** Criação de pacotes (Ex: "Núcleo de Pre-Catarata"). O gestor junta múltiplos exames e aplica um valor promocional de "Pacote", mostrando a economia gerada de forma transparente.

### 2. 👁️ Optometrista (Atendimento Primário)
A ponta inicial de atendimento.
- **Painel de Encaminhamentos:** Lista todos os pacientes já enviados para a clínica, com o status em tempo real (Encaminhado, Agendado ou Atendido).
- **Novo Encaminhamento:** Um fluxo poderoso de formulário. O Optometrista coleta os dados do paciente, seu histórico clínico e **seleciona o Núcleo (Protocolo)** desejado. O sistema automaticamente detalha a composição dos exames e calcula a economia gerada.
- **Laudo Restrito:** Visualiza exclusivamente o laudo de retorno emitido pelo especialista, concluindo o ciclo do paciente de volta à ótica.

### 3. 🛡️ Triagem Técnica (Centro de Operações)
A inteligência tática entre óticas e médicos.
- **Recepção e Análise:** Recebe os encaminhamentos, confere os anexos enviados e valida as informações.
- **Agendamento Inteligente:** Direciona o paciente exatamente para o Médico especialista associado àquela condição/Núcleo (Ex: Direciona um Núcleo de "Glaucoma" para o Dr. Fernando).

### 4. 👨‍⚕️ Médico Especialista
Focado inteiramente em produtividade clínica.
- **Agenda do Dia:** Visão rápida de todos os pacientes agendados.
- **Prontuário Unificado:** Ao acessar o paciente, o médico visualiza em 1 clique um resumo riquíssimo: identificação, doenças sistêmicas, queixa principal extraída da triagem, e quais exames ele precisa analisar.
- **Laudo Médico:** Emite sua conduta/devolutiva, receita e prescreve cirurgias, finalizando o laudo que volta automaticamente para a tela do Optometrista de origem.

---

## 💻 Arquitetura e Tech Stack

O front-end prototype foi desenvolvido com as tecnologias modernas do ecossistema React, focado em alta performance e Design System consistente.

*   **[Next.js 14](https://nextjs.org/):** Framework React (App Router) para navegação rápida e estrutura de pastas declarativa (`/src/app`).
*   **[Tailwind CSS](https://tailwindcss.com/):** Estilos focados em utilitários, permitindo a construção ágil de layouts responsivos sem arquivos `.css` avulsos.
*   **[Lucide React](https://lucide.dev/):** Biblioteca de ícones modernos minimalistas.
*   **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática rigorosa (`/src/data/mocks.ts` e páginas), blindando o código contra erros de run-time na manipulação das Fichas e Encaminhamentos.
*   **Components UI (`/src/components/ui/`):** Construção customizada em vez de dependência pesada de bibliotecas de componentes. Envolve modais complexas com transições `animate-in`, botões escaláveis e inputs consistentes (`clsx`, `tailwind-merge`).

### 📂 Estrutura de Pastas Principal

```text
ciso-plataforma-web/
├── src/
│   ├── app/
│   │   ├── (dashboard)/            # Rotas protegidas (com sidebar e header)
│   │   │   ├── admin/              # Painel de Gestão e Criação de Núcleos
│   │   │   ├── centro/             # Painel de Triagem/Call Center
│   │   │   ├── medico/             # Painel do Médico Especialista
│   │   │   └── optometrista/       # Consultórios optométricos e Novo Encaminhamento
│   │   ├── login/                  # Tela mockup de autenticação
│   │   └── page.tsx                # Landing Page (Marketing)
│   ├── components/
│   │   ├── layout/                 # Shell corporativo (Sidebar responsiva, header)
│   │   └── ui/                     # System Design: Card, Modals genéricas, Botões
│   └── data/                       # Mocks.ts: Interfaces e Banco de Dados Falso para MVP
├── public/                         # Assets estáticos
└── tailwind.config.ts              # Tokens de Cor (primary: CISO verde escuro, accent: Dourado)
```

---

## 🛠️ Como rodar o projeto (Local)

Certifique-se de ter o `Node.js` (preferencialmente v18+) instalado.

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Rode o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse no Navegador:**
   Abra `http://localhost:3000`

---

> 👨‍💻 Desenvolvido como Protótipo Front-end Funcional (Phase 3). 
> As ações (Save, Finalizar, etc.) utilizam alertas ou transições visuais reais, simulando perfeitamente a UX/UI e lógica de negócio de pacotes antes de integrar Banco de Dados e Backend definitivo via Supabase/PostgreSQL.
