# Sistema de Portaria Web

Sistema web para controle de fluxo de pessoas e veículos em portaria industrial/empresarial.

## Tecnologias

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **React Query** (@tanstack/react-query)
- **React Hook Form** + **Zod**
- **Axios**
- **date-fns**
- **react-webcam**

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (já está criado):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Importante:** O backend deve estar rodando na porta 3000.

### 3. Executar o projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3001`

**Nota:** O backend deve estar rodando em `http://localhost:3000`

## Docker

O projeto está configurado para ser executado em containers Docker usando multi-stage build para otimização.

### Construir a imagem

```bash
docker build -t portaria-playduo .
```

### Executar o container

```bash
docker run -p 3001:3001 -e NEXT_PUBLIC_API_URL=http://host.docker.internal:3000 portaria-playduo
```

**Notas importantes:**
- A porta 3001 é exposta pelo container e mapeada para a mesma porta no host
- `NEXT_PUBLIC_API_URL` deve apontar para o backend. Use `http://host.docker.internal:3000` se o backend estiver rodando no host, ou o endereço do container do backend se estiver na mesma rede Docker
- Para produção, considere usar um arquivo `.env` ou variáveis de ambiente do sistema

### Exemplo com docker-compose (opcional)

Se preferir usar docker-compose, você pode criar um arquivo `docker-compose.yml`:

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
    depends_on:
      - backend
```

## Estrutura do Projeto

```
app/
├── (auth)/              # Rotas públicas (login)
│   └── login/
├── (dashboard)/         # Rotas protegidas (dashboard)
│   ├── layout.tsx       # Layout com sidebar
│   ├── page.tsx        # Dashboard principal
│   └── history/        # Página de histórico
components/
├── ui/                  # Componentes shadcn/ui
├── layout/              # Sidebar e Header
├── forms/               # Formulários (entrada/saída)
└── shared/              # Componentes compartilhados
hooks/
├── use-auth.ts          # Autenticação
└── use-movements.ts     # Movimentações (React Query)
lib/
├── api.ts               # Configuração do Axios
└── utils.ts             # Utilitários
```

## Funcionalidades

### Autenticação

- Login com usuário e senha
- Proteção de rotas
- Gerenciamento de sessão

### Dashboard

- Visualização do pátio ativo
- Cards de resumo (Total no pátio, Visitantes, Saída parcial)
- Tabela de movimentações ativas
- Atualização automática a cada 30 segundos

### Nova Entrada

- Busca por CPF ou Placa
- Preenchimento automático de dados existentes
- Captura de foto via webcam
- Suporte a entrada com ou sem veículo
- Alerta de veículo abandonado

### Saída

- Saída completa (pessoa + veículo)
- Saída parcial (apenas pessoa, veículo permanece no pátio)
- Campos de NF e Lacre
- Upload de fotos

## Usuários Padrão

- **Admin:** `username: admin` / `password: admin123`
- **Operador:** `username: operador` / `password: operador123`

## Desenvolvimento

O projeto segue as boas práticas do Next.js 14+ com App Router:

- Componentes Server e Client separados
- React Query para gerenciamento de estado e cache
- Validação de formulários com Zod
- UI consistente com shadcn/ui
- TypeScript para type safety

## Próximos Passos

- [ ] Implementar página de histórico completa
- [ ] Adicionar filtros e busca avançada
- [ ] Implementar relatórios
- [ ] Adicionar configurações do sistema
- [ ] Melhorar tratamento de erros
- [ ] Adicionar testes
