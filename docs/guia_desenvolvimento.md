Documentação de Front-End - Sistema de Portaria Web

Versão: 1.0
Framework: Next.js 14+ (App Router)
UI Library: shadcn/ui + Tailwind CSS
Icons: Lucide React

1. Configuração Inicial e Estilo

O objetivo visual é "Clean & Industrial". Contraste alto para leitura fácil em monitores de portaria (muitas vezes com sol batendo), botões grandes e feedback visual claro.

1.1 Instalação Base

npx create-next-app@latest portaria-web --typescript --tailwind --eslint
cd portaria-web
npx shadcn-ui@latest init

Configurações do init shadcn:

Style: Default

Base Color: Slate (Profissional e neutro)

CSS Variables: Yes

1.2 Dependências Adicionais Essenciais

# Gerenciamento de Estado e API

npm install @tanstack/react-query axios

# Formulários e Validação

npm install react-hook-form @hookform/resolvers zod

# Utilitários e Webcam

npm install date-fns clsx tailwind-merge react-webcam

2. Componentes da Interface (Shadcn/UI)

Instale apenas o necessário para manter o bundle leve. Execute os comandos abaixo:

# Layout e Estrutura

npx shadcn-ui@latest add card dialog sheet table separator scroll-area

# Formulários

npx shadcn-ui@latest add input button label select form checkbox textarea badge

# Feedback e Interação

npx shadcn-ui@latest add toast avatar skeleton alert-dialog tooltip dropdown-menu popover calendar

3. Arquitetura de Pastas (App Router)

A estrutura separa claramente as rotas públicas (Login) das protegidas (Dashboard).

app/
├── (auth)/                 # Layout limpo (sem sidebar)
│   └── login/
│       └── page.tsx        # Tela de Login
├── (dashboard)/            # Layout com Sidebar + Header
│   ├── layout.tsx          # Provider do React Query + Sidebar Fixa
│   ├── page.tsx            # Dashboard Principal (Pátio Ativo)
│   ├── history/            # Relatórios
│   │   └── page.tsx
│   └── vehicles/           # Cadastro avulso (opcional)
│       └── page.tsx
├── api/                    # (Opcional) Next.js API Routes se precisar de proxy
└── globals.css
components/
├── ui/                     # Componentes shadcn (Button, Input...)
├── forms/                  # Formulários complexos
│   ├── entry-form.tsx      # O formulário principal de entrada
│   └── exit-modal.tsx      # Modal de saída (com abas Total/Parcial)
├── layout/
│   ├── sidebar.tsx
│   └── header.tsx
├── shared/
│   ├── webcam-capture.tsx  # Componente isolado de câmera
│   └── status-badge.tsx    # Badge colorida (Dentro/Almoço/Saiu)
└── data-table/             # Configuração da Tabela Avançada
lib/
├── api.ts                  # Instância do Axios
└── utils.ts                # cn() helper
hooks/
├── use-movements.ts        # Hooks do React Query
└── use-webcam.ts           # Lógica de captura

4. Detalhamento das Telas Principais

4.1 Layout do Dashboard (Shell)

Sidebar Lateral (Esquerda):

Logo da Empresa.

Navegação: "Painel" (Home), "Histórico", "Configurações".

Usuário Logado (Avatar + Nome) no rodapé.

Área Principal:

Cabeçalho com Título da Página e Breadcrumbs.

Botão de Ação Primária: "NOVA ENTRADA" (Grande, cor sólida).

4.2 Tela Principal (Dashboard / Pátio Ativo)

Esta é a tela onde o porteiro passa 90% do tempo.

Cards de Resumo (Topo):

Card: Total no Pátio (Ícone Caminhão).

Card: Visitantes/Pedestres (Ícone Pessoa).

Card: Em Almoço (Ícone Relógio - Alerta Amarelo).

Tabela de Pátio Ativo:

Componente: Table (shadcn).

Colunas:

Status (Badge: Verde="No Pátio", Amarelo="Almoço").

Placa (Negrito).

Motorista (Avatar + Nome).

Entrada (Hora formatada HH:mm).

Permanência (Cálculo date-fns: "há 2h 15m").

Ações (Dropdown: "Registrar Saída", "Ver Detalhes").

4.3 Componente: Modal de Nova Entrada (EntryDialog)

Acionado pelo botão "NOVA ENTRADA". Deve ser um Dialog para não perder o contexto da tabela de fundo.

Passo 1: Busca (Critical Path)

Input único grande: "Digite CPF ou Placa".

Ao selecionar um resultado existente, preenche o formulário automaticamente.

Lógica de Almoço: Se a API retornar que existe um veículo "Sem Motorista" para este CPF, exibir um Alert dentro do modal: "O veículo ABC-1234 consta no pátio. Deseja revincular?".

Passo 2: Dados

Grid de 2 colunas.

Esquerda: Dados Pessoais (Nome, Empresa).

Direita: Dados Veículo (Placa, Modelo, Tipo).

Passo 3: Foto

Componente WebcamCapture.

Botão "Capturar Foto".

Preview da foto tirada com botão "Tentar Novamente".

4.4 Componente: Modal de Saída (ExitDialog)

Ao clicar em "Registrar Saída" na tabela.

Deve usar o componente Tabs do shadcn.

Aba 1: Saída Completa (Default)

Inputs: NF (Opcional), Lacre.

Upload de Fotos (Carga/Lacre).

Botão: "Finalizar Acesso" (Destrutivo/Preto).

Aba 2: Saída Temporária (Almoço)

Texto explicativo: "O motorista sairá, mas o veículo permanecerá no pátio."

Botão: "Registrar Saída de Pessoa" (Amarelo/Aviso).

5. Integração e Estado (React Query)

Para garantir que a lista de pátio esteja sempre atualizada sem refresh manual.

Exemplo de Hook (hooks/use-movements.ts):

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Buscar lista do pátio
export function useActivePatio() {
  return useQuery({
    queryKey: ['movements', 'active'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/patio')
      return data
    },
    refetchInterval: 30000, // Atualiza a cada 30s automaticamente
  })
}

// Registrar Entrada
export function useCreateEntrance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.post('/movements/entry', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      // Disparar Toast de Sucesso aqui
    }
  })
}

6. Guia de Cores e Temas (Tailwind)

Adicione estas classes utilitárias no seu tailwind.config.ts ou use as classes padrão para manter a consistência semântica:

Status "No Pátio" (Verde): bg-green-100 text-green-800 border-green-200

Status "Almoço" (Amarelo): bg-yellow-100 text-yellow-800 border-yellow-200

Status "Finalizado" (Cinza): bg-slate-100 text-slate-600

Botão Primário: bg-slate-900 hover:bg-slate-800 text-white

7. Checklist de Desenvolvimento Front-End

[ ] Configurar Next.js + Shadcn.

[ ] Criar Layout (dashboard) com Sidebar estática.

[ ] Implementar componente WebcamCapture (testar permissões de navegador).

[ ] Criar Hook useActivePatio com dados mockados inicialmente.

[ ] Desenvolver ActivePatioTable com as badges de status.

[ ] Desenvolver EntryForm com Zod Validation (CPF obrigatório).

[ ] Implementar lógica de "Alerta de Veículo Abandonado" no form de entrada.

[ ] Desenvolver ExitModal com as duas abas (Total vs Almoço).

[ ] Conectar com API real.
