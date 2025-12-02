# Documentação da API - Sistema de Portaria

**Base URL:** `http://localhost:3000`

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação.

**Como usar:**

1. Faça login em `/auth/login` para obter um token
2. Use o token no header `Authorization: Bearer <token>` para endpoints protegidos
3. O token expira em 24 horas

**Nota:** Atualmente, apenas `/auth/me` requer autenticação. Os demais endpoints usam `createdById` e `closedById` para auditoria, mas podem ser protegidos no futuro.

## Índice

1. [Autenticação](#autenticação)
2. [Dashboard](#dashboard)
3. [Pessoas](#pessoas)
4. [Veículos](#veículos)
5. [Movimentações](#movimentações)
   - [Registrar Entrada](#post-movementsentrance)
   - [Registrar Saída](#post-movementsexit)
   - [Listar Pátio Ativo](#get-movementspatio)
   - [Histórico com Filtros](#get-movementshistory)
   - [Buscar por ID](#get-movementsid)

---

## Autenticação

### POST /auth/login

Realiza login e retorna um token JWT.

**Payload:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Resposta (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "name": "Administrador",
    "role": "ADMIN"
  }
}
```

**Resposta (401):**

```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas"
}
```

**Exemplo cURL:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Usuários padrão (criados via seed):**

- **Admin:** `username: admin` / `password: admin123`
- **Operador:** `username: operador` / `password: operador123`

---

### POST /auth/register

Registra um novo usuário no sistema. **Apenas usuários com role ADMIN podem executar esta ação.**

**Autenticação:** Requerida (JWT Bearer Token)

**Autorização:** Apenas `ADMIN`

**Payload:**

```json
{
  "username": "novo_usuario",
  "name": "Novo Usuário",
  "password": "senha123",
  "role": "OPERATOR"
}
```

**Campos obrigatórios:**

- `username` (string): Nome de usuário único
- `name` (string): Nome completo
- `password` (string): Senha

**Campos opcionais:**

- `role` (enum): `ADMIN` | `OPERATOR` (padrão: `OPERATOR`)

**Resposta (201):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "novo_usuario",
    "name": "Novo Usuário",
    "role": "OPERATOR"
  }
}
```

**Resposta (409):**

```json
{
  "statusCode": 409,
  "message": "Usuário já existe"
}
```

**Resposta (401) - Não autenticado:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Resposta (403) - Sem permissão (não é ADMIN):**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**Resposta (409) - Usuário já existe:**

```json
{
  "statusCode": 409,
  "message": "Usuário já existe"
}
```

**Exemplo cURL:**

```bash
# Obter token de autenticação (ADMIN)
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.access_token')

# Registrar novo usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "novo_usuario",
    "name": "Novo Usuário",
    "password": "senha123",
    "role": "OPERATOR"
  }'
```

---

### GET /auth/me

Retorna informações do usuário autenticado.

**Headers:**

- `Authorization: Bearer <token>`

**Resposta (200):**

```json
{
  "id": "uuid",
  "username": "admin",
  "name": "Administrador",
  "role": "ADMIN",
  "active": true
}
```

**Resposta (401):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Exemplo cURL:**

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Dashboard

### GET /dashboard/stats

Retorna estatísticas gerais do sistema.

**Autenticação:** Não requerida (pode ser protegida no futuro)

**Resposta:**

```json
{
  "totalInPatio": 5,
  "vehiclesInPatio": 3,
  "peopleInPatio": 4,
  "totalMovementsToday": 12
}
```

**Exemplo cURL:**

```bash
curl -X GET http://localhost:3000/dashboard/stats
```

---

### GET /dashboard/patio

Retorna lista detalhada de pessoas e veículos no pátio com paginação.

**Query Parameters (todos opcionais):**

- `page` (number): Número da página (padrão: 1, mínimo: 1)
- `limit` (number): Itens por página (padrão: 20, mínimo: 1, máximo: 100)

**Resposta:**

```json
{
  "data": [
    {
      "id": "uuid",
      "personId": "uuid",
      "vehicleId": "uuid",
      "enteredAt": "2024-01-15T10:30:00.000Z",
      "exitedAt": null,
      "vehicleStayOpen": false,
      "reason": "Entrega de carga",
      "person": {
        "id": "uuid",
        "name": "João Silva",
        "document": "12345678900",
        "type": "DRIVER"
      },
      "vehicle": {
        "id": "uuid",
        "plate": "ABC1234",
        "type": "TRUCK"
      },
      "createdBy": {
        "id": "uuid",
        "name": "Administrador",
        "username": "admin"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 27,
    "totalPages": 2
  }
}
```

**Exemplo cURL:**

```bash
# Listar primeira página (padrão: 20 itens)
curl -X GET http://localhost:3000/dashboard/patio

# Listar com paginação customizada
curl -X GET "http://localhost:3000/dashboard/patio?page=1&limit=10"
```

---

## Pessoas

### GET /persons/document/:document

Busca uma pessoa pelo documento.

**Parâmetros:**

- `document` (path): Documento da pessoa (CPF, Passaporte, etc.)

**Resposta (200):**

```json
{
  "id": "uuid",
  "name": "João Silva",
  "document": "12345678900",
  "rg": "1234567",
  "company": "Transportadora XYZ",
  "photoUrl": "https://example.com/photo.jpg",
  "type": "DRIVER",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Resposta (404):**

```json
null
```

**Exemplo cURL:**

```bash
curl -X GET http://localhost:3000/persons/document/12345678900
```

---

## Veículos

### GET /vehicles/plate/:plate

Busca um veículo pela placa.

**Parâmetros:**

- `plate` (path): Placa do veículo (ex: ABC1234)

**Resposta (200):**

```json
{
  "id": "uuid",
  "plate": "ABC1234",
  "model": "Scania R450",
  "color": "Branco",
  "type": "TRUCK",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Resposta (404):**

```json
null
```

**Exemplo cURL:**

```bash
curl -X GET http://localhost:3000/vehicles/plate/ABC1234
```

---

## Movimentações

### POST /movements/entrance

Registra uma entrada de pessoa (com ou sem veículo). O backend faz upsert de pessoa/veículo e garante **um movimento ativo por veículo ou pedestre**.

**Autenticação:** Não requerida (usa `createdById` para auditoria)

**Payload mínimo:**

```json
{
  "document": "12345678900",
  "name": "João Silva",
  "rg": "1234567",
  "company": "Transportadora XYZ",
  "photoUrl": "https://example.com/photo.jpg",
  "personType": "DRIVER",
  "plate": "ABC1234",
  "vehicleModel": "Scania R450",
  "vehicleColor": "Branco",
  "vehicleType": "TRUCK",
  "reason": "Entrega de carga",
  "createdById": "uuid-do-usuario"
}
```

**Campos obrigatórios:**

- `document` (string): Documento de identificação da pessoa (CPF, Passaporte, RG, etc.)
- `name` (string): Nome da pessoa
- `personType` (enum): `EMPLOYEE` | `VISITOR` | `DRIVER`
- `createdById` (string): ID do usuário que está registrando

**Campos opcionais:**

- `rg` (string): RG da pessoa
- `company` (string): Empresa que representa
- `photoUrl` (string): URL da foto
- `plate` (string): Placa do veículo (se houver)
- `vehicleModel` (string): Modelo do veículo
- `vehicleColor` (string): Cor do veículo
- `vehicleType` (enum): `CAR` | `TRUCK` | `MOTORCYCLE` | `OTHER` (obrigatório se `plate` for informado)
- `trailerPlate` (string): Placa da carreta (opcional, quando houver)
- `reason` (string): Motivo da entrada

**Restrições e validações:**
- Bloqueia entrada se **placa já está ativa** (movimento com `exitedAt = null` para essa placa).
- Bloqueia entrada se **pedestre/documento já está ativo** (sem veículo e `exitedAt = null`).

**Resposta (201) - entrada normal:**

```json
{
  "movement": {
    "id": "uuid",
    "personId": "uuid",
    "vehicleId": "uuid",
    "enteredAt": "2024-01-15T10:30:00.000Z",
    "exitedAt": null,
    "vehicleStayOpen": false,
    "reason": "Entrega de carga",
    "person": {
      "id": "uuid",
      "name": "João Silva",
      "cpf": "12345678900"
    },
    "vehicle": {
      "id": "uuid",
      "plate": "ABC1234"
    }
  },
  "vehicleStayOpenWarning": false,
  "existingVehiclePlate": null
}
```

**Resposta com retorno de saída parcial (veículo abandonado):**

```json
{
  "movement": {
    "id": "uuid",
    "personId": "uuid",
    "vehicleId": "uuid",
    "enteredAt": "2024-01-15T13:00:00.000Z",
    "exitedAt": null,
    "vehicleStayOpen": false,
    "reason": "Retorno após almoço",
    "person": {
      "id": "uuid",
      "name": "João Silva",
      "cpf": "12345678900"
    },
    "vehicle": {
      "id": "uuid",
      "plate": "ABC1234"
    }
  },
  "vehicleStayOpenWarning": true,
  "existingVehiclePlate": "ABC1234",
  "previousMovementId": "uuid-do-movimento-anterior",
  "previousDriverName": "João Silva",
  "driverChanged": false,
  "isReturn": true
}
```

**Campos adicionais quando `vehicleStayOpenWarning: true`:**

- `previousMovementId` (string): ID do movimento anterior com veículo abandonado
- `isReturn` (boolean): `true` se é um retorno de saída parcial (sempre que warning for true)
- `driverChanged` (boolean): `true` quando um novo motorista assume o veículo; `false` quando é retorno do mesmo motorista
- `previousDriverName` (string): Nome do motorista do movimento anterior (quando `driverChanged: true`)
- O movimento é **reaproveitado**: retorna com `exitedAt = null` e `vehicleStayOpen = false`

**Comportamento:**

1. **Retorno do mesmo motorista (`driverChanged: false`):**
   - Reabre o mesmo movimento (`vehicleStayOpen` volta para `false`, `exitedAt` fica `null`)
   - Histórico recebe `RETURN`
   - Nenhum novo movimento é criado; o ID permanece o mesmo

2. **Motorista Diferente (`driverChanged: true`):**
   - Sistema reabre o mesmo movimento e troca o motorista (`personId` é atualizado)
   - Histórico recebe `DRIVER_CHANGE`
   - O ID do movimento continua o mesmo
   - Placa/veículo não podem ser alterados nesse fluxo (retorna 400)

**Exemplo cURL - Entrada com veículo:**

```bash
# Primeiro, fazer login para obter o userId
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.access_token')

USER_ID=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.user.id')

# Registrar entrada usando o userId
curl -X POST http://localhost:3000/movements/entrance \
  -H "Content-Type: application/json" \
  -d "{
    \"document\": \"12345678900\",
    \"name\": \"João Silva\",
    \"personType\": \"DRIVER\",
    \"plate\": \"ABC1234\",
    \"vehicleModel\": \"Scania R450\",
    \"vehicleColor\": \"Branco\",
    \"vehicleType\": \"TRUCK\",
    \"trailerPlate\": \"CARRETA123\",
    \"reason\": \"Entrega de carga\",
    \"createdById\": \"$USER_ID\"
  }"
```

**Exemplo cURL - Entrada sem veículo (pedestre):**

```bash
# Obter userId (veja exemplo acima)
USER_ID="uuid-do-usuario"

curl -X POST http://localhost:3000/movements/entrance \
  -H "Content-Type: application/json" \
  -d "{
    \"document\": \"98765432100\",
    \"name\": \"Maria Santos\",
    \"personType\": \"VISITOR\",
    \"reason\": \"Visita técnica\",
    \"createdById\": \"$USER_ID\"
  }"
```

---

### POST /movements/exit

Registra uma saída (completa ou parcial).

**Autenticação:** Não requerida (usa `closedById` para auditoria)

**Payload:**

```json
{
  "movementId": "uuid-do-movimento",
  "type": "FULL_EXIT",
  "invoiceNumbers": ["00192", "00193", "00194"],
  "sealNumber": "9988",
  "photos": [
    "https://example.com/lacre1.jpg",
    "https://example.com/lacre2.jpg",
    "https://example.com/nf1.jpg",
    "https://example.com/nf2.jpg",
    "https://example.com/veiculo.jpg"
  ],
  "exitReason": "Entrega concluída",
  "closedById": "uuid-do-usuario"
}
```

**Campos obrigatórios:**

- `movementId` (string): ID do movimento a ser encerrado
- `type` (enum): `FULL_EXIT` | `PARTIAL_EXIT`
- `closedById` (string): ID do usuário que está registrando
- `exitReason` (string): **Obrigatório quando `type = PARTIAL_EXIT`** - Motivo da saída parcial (ex: "Almoço", "Almoço - retorno às 13h")

**Campos opcionais:**

- `invoiceNumbers` (string[]): Array de números das Notas Fiscais (pode ter nenhuma, uma ou múltiplas NFs)
- `sealNumber` (string): Número do Lacre
- `photos` (string[]): **Array de URLs das fotos da saída** - Permite vincular múltiplas fotos para documentar lacres, notas fiscais, veículo, etc. (ex: `["https://example.com/lacre1.jpg", "https://example.com/lacre2.jpg", "https://example.com/nf1.jpg", "https://example.com/veiculo.jpg"]`)
- `exitReason` (string): Opcional quando `type = FULL_EXIT` - Motivo da saída completa

**Tipos de Saída:**

1. **PARTIAL_EXIT** (Saída Parcial - Almoço):
   - Apenas a pessoa sai
   - Veículo permanece no pátio (`vehicleStayOpen: true`)
   - **Requer `exitReason` (obrigatório)** - Motivo da saída parcial
   - Não requer `invoiceNumbers`, `sealNumber` ou `photos`
   - **Importante:** O veículo pode ser retirado pelo mesmo motorista (retorno) ou por outro motorista (troca)
   - **Pode ser finalizada depois:** Uma saída parcial pode ser convertida em saída completa posteriormente usando `FULL_EXIT` no mesmo movimento

2. **FULL_EXIT** (Saída Completa):
   - Pessoa e veículo saem juntos
   - `invoiceNumbers` é opcional (pode ter nenhuma, uma ou múltiplas NFs)
   - `sealNumber` e `photos` são opcionais
   - **Pode finalizar saída parcial:** Se o movimento já tem `exitedAt` preenchido e `vehicleStayOpen: true` (saída parcial), usar `FULL_EXIT` atualiza o movimento para saída completa, adicionando `invoiceNumbers`, `sealNumber` e `photos`
   - **Não é permitido uma nova `PARTIAL_EXIT` em movimento com saída parcial aberta:** quando `vehicleStayOpen: true`, somente `FULL_EXIT` é aceito para finalizar o fluxo
   - **Não pode atualizar movimento já finalizado:** Se o movimento já tem `exitedAt` preenchido e `vehicleStayOpen: false` (já finalizado), retorna erro 400

**Resposta (200):**

```json
{
  "id": "uuid",
  "personId": "uuid",
  "vehicleId": "uuid",
  "enteredAt": "2024-01-15T10:30:00.000Z",
  "exitedAt": "2024-01-15T16:00:00.000Z",
  "vehicleStayOpen": false,
  "invoiceNumbers": ["00192", "00193", "00194"],
  "sealNumber": "9988",
  "exitPhotos": [
    "https://example.com/lacre1.jpg",
    "https://example.com/lacre2.jpg",
    "https://example.com/nf1.jpg",
    "https://example.com/nf2.jpg",
    "https://example.com/veiculo.jpg"
  ],
  "exitReason": "Entrega concluída",
  "person": { ... },
  "vehicle": { ... },
  "createdBy": { ... },
  "closedBy": { ... }
}
```

**Exemplo cURL - Saída Completa com múltiplas NFs:**

```bash
# Obter userId (veja exemplo acima)
USER_ID="uuid-do-usuario"
MOVEMENT_ID="uuid-do-movimento"

curl -X POST http://localhost:3000/movements/exit \
  -H "Content-Type: application/json" \
  -d "{
    \"movementId\": \"$MOVEMENT_ID\",
    \"type\": \"FULL_EXIT\",
    \"invoiceNumbers\": [\"00192\", \"00193\", \"00194\"],
    \"sealNumber\": \"9988\",
    \"photos\": [
      \"https://example.com/lacre1.jpg\",
      \"https://example.com/lacre2.jpg\",
      \"https://example.com/nf1.jpg\",
      \"https://example.com/nf2.jpg\",
      \"https://example.com/veiculo.jpg\"
    ],
    \"closedById\": \"$USER_ID\"
  }"
```

**Exemplo cURL - Saída Completa sem NF:**

```bash
USER_ID="uuid-do-usuario"
MOVEMENT_ID="uuid-do-movimento"

curl -X POST http://localhost:3000/movements/exit \
  -H "Content-Type: application/json" \
  -d "{
    \"movementId\": \"$MOVEMENT_ID\",
    \"type\": \"FULL_EXIT\",
    \"closedById\": \"$USER_ID\"
  }"
```

**Exemplo cURL - Saída Parcial (Almoço):**

```bash
# Obter userId (veja exemplo acima)
USER_ID="uuid-do-usuario"
MOVEMENT_ID="uuid-do-movimento"

curl -X POST http://localhost:3000/movements/exit \
  -H "Content-Type: application/json" \
  -d "{
    \"movementId\": \"$MOVEMENT_ID\",
    \"type\": \"PARTIAL_EXIT\",
    \"exitReason\": \"Almoço - retorno às 13h\",
    \"closedById\": \"$USER_ID\"
  }"
```

**Resposta (400) - Saída parcial sem motivo:**

```json
{
  "statusCode": 400,
  "message": [
    "exitReason é obrigatório para saída parcial"
  ]
}
```

**Resposta (400) - Tentar atualizar movimento já finalizado:**

```json
{
  "statusCode": 400,
  "message": "Movimento já foi finalizado completamente. Não é possível atualizar.",
  "error": "Bad Request"
}
```

**Exemplo cURL - Finalizar Saída Parcial (Converter em Completa):**

```bash
# 1. Primeiro, fazer saída parcial
USER_ID="uuid-do-usuario"
MOVEMENT_ID="uuid-do-movimento"

curl -X POST http://localhost:3000/movements/exit \
  -H "Content-Type: application/json" \
  -d "{
    \"movementId\": \"$MOVEMENT_ID\",
    \"type\": \"PARTIAL_EXIT\",
    \"exitReason\": \"Almoço - retorno às 13h\",
    \"closedById\": \"$USER_ID\"
  }"

# 2. Depois, finalizar a saída parcial (adicionar NF, lacre, fotos)
curl -X POST http://localhost:3000/movements/exit \
  -H "Content-Type: application/json" \
  -d "{
    \"movementId\": \"$MOVEMENT_ID\",
    \"type\": \"FULL_EXIT\",
    \"invoiceNumbers\": [\"999888\", \"999889\"],
    \"sealNumber\": \"LACRE999\",
    \"photos\": [
      \"https://example.com/lacre1.jpg\",
      \"https://example.com/nf1.jpg\",
      \"https://example.com/veiculo.jpg\"
    ],
    \"closedById\": \"$USER_ID\"
  }"

# Resultado: O movimento agora tem vehicleStayOpen: false e não aparece mais no pátio
```

**Comportamento ao Finalizar Saída Parcial:**

- O `exitedAt` original é **mantido** (não é atualizado)
- O `vehicleStayOpen` é alterado de `true` para `false`
- Os campos `invoiceNumbers`, `sealNumber` e `exitPhotos` são adicionados/atualizados
- O `exitReason` pode ser atualizado (opcional)
- O `closedById` pode ser atualizado (pode ser o mesmo ou diferente usuário)
- Após finalizar, o movimento **não aparece mais** no pátio (`GET /dashboard/patio`)

---

### GET /movements/patio

Retorna lista de movimentos ativos no pátio (pessoas e veículos que ainda não saíram) com paginação.

**Query Parameters (todos opcionais):**

- `page` (number): Número da página (padrão: 1, mínimo: 1)
- `limit` (number): Itens por página (padrão: 20, mínimo: 1, máximo: 100)

**Resposta:**

```json
{
  "data": [
    {
      "id": "uuid",
      "personId": "uuid",
      "vehicleId": "uuid",
      "enteredAt": "2024-01-15T10:30:00.000Z",
      "exitedAt": null,
      "vehicleStayOpen": false,
      "reason": "Entrega de carga",
      "person": {
        "id": "uuid",
        "name": "João Silva",
        "document": "12345678900",
        "type": "DRIVER"
      },
      "vehicle": {
        "id": "uuid",
        "plate": "ABC1234",
        "type": "TRUCK"
      },
      "createdBy": {
        "id": "uuid",
        "name": "Administrador",
        "username": "admin"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 27,
    "totalPages": 2
  }
}
```

**Exemplo cURL:**

```bash
# Listar primeira página (padrão: 20 itens)
curl -X GET http://localhost:3000/movements/patio

# Listar com paginação customizada
curl -X GET "http://localhost:3000/movements/patio?page=1&limit=10"
```

---

### GET /movements/history

Retorna o histórico completo de movimentações agrupadas em **ciclos** com filtros opcionais e paginação.

**Conceito de Ciclo:**

- Um ciclo agrupa todas as movimentações de uma **mesma pessoa + mesmo veículo**
- Um ciclo começa com uma entrada e termina quando há uma **saída completa** (veículo e motorista saem juntos)
- Saídas parciais e reentradas fazem parte do mesmo ciclo
- Status `closed` apenas quando o último movimento do ciclo tem saída completa

**Autenticação:** Não requerida (pode ser protegida no futuro)

**Query Parameters (todos opcionais):**

- `startDate` (string, ISO date): Data inicial do período (ex: `2024-01-15T00:00:00.000Z`)
- `endDate` (string, ISO date): Data final do período (ex: `2024-01-15T23:59:59.999Z`)
- `document` (string): Documento da pessoa (CPF, Passaporte, etc.) - busca exata, apenas números ou com formatação
- `plate` (string): Placa do veículo - **busca por aproximação** (ex: `ABC` encontra `ABC1234`, `ABC5678`, etc.)
- `personType` (enum): Tipo de pessoa - `EMPLOYEE` | `VISITOR` | `DRIVER`
- `vehicleType` (enum): Tipo de veículo - `CAR` | `TRUCK` | `MOTORCYCLE` | `OTHER`
- `invoiceNumber` (string): Número da Nota Fiscal - **busca por aproximação** (ex: `001` encontra `00192`, `00193`, etc.)
- `status` (string): Status do ciclo - `active` (ciclo ainda ativo) | `closed` (ciclo finalizado com saída completa)
- `page` (number): Número da página (padrão: 1, mínimo: 1)
- `limit` (number): Ciclos por página (padrão: 20, mínimo: 1, máximo: 100)

**Resposta (200):**

```json
{
  "data": [
    {
      "cycleId": "uuid-do-primeiro-movimento",
      "status": "closed",
      "person": {
        "id": "uuid",
        "name": "João Silva",
        "document": "12345678900",
        "type": "DRIVER"
      },
      "vehicle": {
        "id": "uuid",
        "plate": "ABC1234",
        "type": "TRUCK"
      },
      "firstEntryAt": "2024-01-15T10:00:00.000Z",
      "lastExitAt": "2024-01-15T16:00:00.000Z",
      "movements": [
        {
          "id": "uuid-1",
          "enteredAt": "2024-01-15T10:00:00.000Z",
          "exitedAt": "2024-01-15T12:00:00.000Z",
          "exitType": "PARTIAL_EXIT",
          "vehicleStayOpen": true,
          "exitReason": "Almoço - retorno às 13h",
          "person": { "name": "João Silva" },
          "vehicle": { "plate": "ABC1234" },
          "createdBy": { "name": "Administrador" },
          "closedBy": { "name": "Operador" }
        },
        {
          "id": "uuid-2",
          "enteredAt": "2024-01-15T13:00:00.000Z",
          "exitedAt": "2024-01-15T16:00:00.000Z",
          "exitType": "FULL_EXIT_WITH_INVOICE",
          "vehicleStayOpen": false,
          "invoiceNumbers": ["00192", "00193"],
          "sealNumber": "9988",
          "person": { "name": "João Silva" },
          "vehicle": { "plate": "ABC1234" }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Estrutura de um Ciclo:**

- `cycleId`: ID do primeiro movimento do ciclo (usado como identificador único)
- `status`: `active` (ciclo ainda em andamento) | `closed` (ciclo finalizado com saída completa)
- `person`: Dados da pessoa (mesma em todos os movimentos do ciclo)
- `vehicle`: Dados do veículo (mesmo em todos os movimentos do ciclo)
- `firstEntryAt`: Data/hora da primeira entrada do ciclo
- `lastExitAt`: Data/hora da última saída do ciclo (null se ainda ativo)
- `movements`: Array com todas as movimentações do ciclo, ordenadas cronologicamente

**Campo `exitType` em cada movimento:**

- `ACTIVE`: Movimento ativo (pessoa/veículo ainda no pátio, `exitedAt = null`)
- `PARTIAL_EXIT`: Saída parcial (motorista saiu, veículo ficou no pátio, `vehicleStayOpen = true`)
- `FULL_EXIT`: Saída completa sem NF (`exitedAt` preenchido, `vehicleStayOpen = false`, sem `invoiceNumbers`)
- `FULL_EXIT_WITH_INVOICE`: Saída completa com NF (`exitedAt` preenchido, `vehicleStayOpen = false`, com `invoiceNumbers`)

**Nota importante:**

- Um ciclo está `closed` apenas quando o **último movimento** tem saída completa (veículo e motorista saíram juntos)
- Saídas parciais e reentradas fazem parte do mesmo ciclo e aparecem no array `movements`
- Use o endpoint `GET /movements/cycle/:id` para ver todos os detalhes de um ciclo específico

**Exemplos cURL:**

**Buscar todas as movimentações (primeira página):**

```bash
curl -X GET "http://localhost:3000/movements/history"
```

**Buscar movimentações de um período específico:**

```bash
curl -X GET "http://localhost:3000/movements/history?startDate=2024-01-15T00:00:00.000Z&endDate=2024-01-15T23:59:59.999Z"
```

**Buscar por documento:**

```bash
curl -X GET "http://localhost:3000/movements/history?document=12345678900"
```

**Buscar por placa (aproximação):**

```bash
# Busca por aproximação - encontra placas que contenham "ABC"
curl -X GET "http://localhost:3000/movements/history?plate=ABC"

# Exemplos de resultados: ABC1234, ABC5678, ABC-1234, etc.
```

**Buscar apenas movimentações ativas (não saíram):**

```bash
curl -X GET "http://localhost:3000/movements/history?status=active"
```

**Buscar apenas movimentações encerradas:**

```bash
curl -X GET "http://localhost:3000/movements/history?status=closed"
```

**Buscar por tipo de pessoa:**

```bash
curl -X GET "http://localhost:3000/movements/history?personType=DRIVER"
```

**Buscar por tipo de veículo:**

```bash
curl -X GET "http://localhost:3000/movements/history?vehicleType=TRUCK"
```

**Buscar por número da NF (aproximação):**

```bash
# Busca por aproximação - encontra NFs que contenham "001"
curl -X GET "http://localhost:3000/movements/history?invoiceNumber=001"

# Exemplos de resultados: 00192, 00193, 00194, NF001, etc.
```

**Buscar com paginação:**

```bash
curl -X GET "http://localhost:3000/movements/history?page=2&limit=10"
```

**Buscar com múltiplos filtros combinados:**

```bash
curl -X GET "http://localhost:3000/movements/history?startDate=2024-01-15T00:00:00.000Z&endDate=2024-01-20T23:59:59.999Z&personType=DRIVER&vehicleType=TRUCK&status=closed&page=1&limit=20"
```

---

### GET /movements/cycle/:id

Busca o detalhe completo de um ciclo (todas as movimentações de uma pessoa + veículo).

**Parâmetros:**

- `id` (path): ID de qualquer movimento do ciclo (pode ser o primeiro, último ou qualquer movimento intermediário)

**Resposta (200):**

```json
{
  "cycleId": "uuid-do-movimento-usado-para-buscar",
  "status": "active",
  "person": {
    "id": "uuid",
    "name": "João Silva",
    "document": "12345678900",
    "type": "DRIVER"
  },
  "vehicle": {
    "id": "uuid",
    "plate": "ABC1234",
    "type": "TRUCK"
  },
  "firstEntryAt": "2024-01-15T10:00:00.000Z",
  "lastExitAt": "2024-01-15T12:00:00.000Z",
  "totalMovements": 2,
  "movements": [
    {
      "id": "uuid-1",
      "enteredAt": "2024-01-15T10:00:00.000Z",
      "exitedAt": "2024-01-15T12:00:00.000Z",
      "exitType": "PARTIAL_EXIT",
      "vehicleStayOpen": true,
      "exitReason": "Almoço - retorno às 13h",
      "person": { ... },
      "vehicle": { ... },
      "createdBy": { ... },
      "closedBy": { ... }
    },
    {
      "id": "uuid-2",
      "enteredAt": "2024-01-15T13:00:00.000Z",
      "exitedAt": null,
      "exitType": "ACTIVE",
      "vehicleStayOpen": false,
      "person": { ... },
      "vehicle": { ... },
      "createdBy": { ... }
    }
  ]
}
```

**Exemplo cURL:**

```bash
curl -X GET http://localhost:3000/movements/cycle/uuid-do-movimento
```

---

### GET /movements/:id

Busca um movimento específico por ID (movimento individual, não o ciclo completo).

**Parâmetros:**

- `id` (path): UUID do movimento

**Resposta (200):**

```json
{
  "id": "uuid",
  "personId": "uuid",
  "vehicleId": "uuid",
  "enteredAt": "2024-01-15T10:30:00.000Z",
  "exitedAt": "2024-01-15T16:00:00.000Z",
  "vehicleStayOpen": false,
  "invoiceNumbers": ["00192", "00193"],
  "sealNumber": "9988",
  "exitPhotos": [
    "https://example.com/lacre1.jpg",
    "https://example.com/lacre2.jpg",
    "https://example.com/nf1.jpg",
    "https://example.com/nf2.jpg",
    "https://example.com/veiculo.jpg"
  ],
  "exitReason": "Entrega concluída",
  "person": {
    "id": "uuid",
    "name": "João Silva",
    "document": "12345678900",
    "type": "DRIVER"
  },
  "vehicle": {
    "id": "uuid",
    "plate": "ABC1234",
    "type": "TRUCK"
  },
  "createdBy": {
    "id": "uuid",
    "name": "Administrador",
    "username": "admin"
  },
  "closedBy": {
    "id": "uuid",
    "name": "Operador",
    "username": "operador"
  },
  "events": [
    {
      "action": "ENTRY",
      "performedAt": "2024-01-15T10:30:00.000Z",
      "person": { "name": "João Silva", "document": "12345678900" },
      "vehicle": { "plate": "ABC1234" }
    },
    {
      "action": "PARTIAL_EXIT",
      "performedAt": "2024-01-15T12:00:00.000Z",
      "exitReason": "Almoço"
    },
    {
      "action": "DRIVER_CHANGE",
      "performedAt": "2024-01-15T13:00:00.000Z",
      "person": { "name": "Maria Santos", "document": "98765432100" }
    },
    {
      "action": "FULL_EXIT",
      "performedAt": "2024-01-15T16:00:00.000Z",
      "invoiceNumbers": ["00192"]
    }
  ]
}
```

**Resposta (404):**

```json
{
  "statusCode": 404,
  "message": "Movimento não encontrado"
}
```

**Exemplo cURL:**

```bash
curl -X GET http://localhost:3000/movements/uuid-do-movimento
```

---

### DELETE /movements/:id

Exclui um movimento do sistema. **Apenas usuários com role ADMIN podem executar esta ação.**

**Autenticação:** Requerida (JWT Bearer Token)

**Autorização:** Apenas `ADMIN`

**Parâmetros:**

- `id` (path): UUID do movimento

**Resposta (200):**

```json
{
  "message": "Movimento excluído com sucesso"
}
```

**Resposta (404) - Movimento não encontrado:**

```json
{
  "statusCode": 404,
  "message": "Movimento não encontrado"
}
```

**Resposta (401) - Não autenticado:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Resposta (403) - Sem permissão (não é ADMIN):**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**Exemplo cURL:**

```bash
# Obter token de autenticação
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.access_token')

# Excluir movimento
curl -X DELETE http://localhost:3000/movements/uuid-do-movimento \
  -H "Authorization: Bearer $TOKEN"
```

---

## Enums

### UserRole

- `ADMIN`: Administrador (acesso completo, relatórios, gerenciamento)
- `OPERATOR`: Operador (apenas registro de entrada/saída)

### PersonType

- `EMPLOYEE`: Funcionário
- `VISITOR`: Visitante
- `DRIVER`: Motorista Terceiro

### VehicleType

- `CAR`: Carro
- `TRUCK`: Caminhão/Carreta
- `MOTORCYCLE`: Moto
- `OTHER`: Outros

### ExitType

- `FULL_EXIT`: Saída completa (pessoa + veículo)
- `PARTIAL_EXIT`: Saída parcial (apenas pessoa, veículo fica)

---

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos ou faltando
- `401 Unauthorized`: Não autenticado ou credenciais inválidas
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Recurso já existe (ex: usuário duplicado)
- `500 Internal Server Error`: Erro interno do servidor

---

## Autenticação nos Endpoints

**Nota:** A maioria dos endpoints de movimentação não requer autenticação JWT, mas utilizam `createdById` e `closedById` para auditoria.

**Endpoints que requerem autenticação JWT e role ADMIN:**

- `POST /auth/register` - Registrar novo usuário
- `DELETE /movements/:id` - Excluir movimento
- `DELETE /persons/:id` - Excluir pessoa

Para usar esses campos:

1. **Opção 1 - Usar ID do usuário diretamente:**

   ```bash
   # Obter ID do usuário
   node scripts/get-user-id.js
   # Usar o ID retornado em createdById e closedById
   ```

2. **Opção 2 - Fazer login e usar o ID do usuário retornado:**

   ```bash
   # Fazer login
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'

   # Usar o user.id retornado em createdById e closedById
   ```

**Futuras melhorias:** Os endpoints podem ser protegidos com JWT, usando o token para obter automaticamente o `userId` do usuário autenticado.

---

## Notas Importantes

1. **IDs de Usuário**: Para `createdById` e `closedById`, você precisa do ID de um usuário válido no sistema. Execute o seed para criar usuários padrão:

   ```bash
   npm run prisma:seed
   ```

   **Usuários padrão:**
   - Admin: `username: admin` / `password: admin123`
   - Operador: `username: operador` / `password: operador123`

2. **CPF e Placa**: São campos únicos. Se já existirem, os registros serão atualizados (upsert).

3. **Veículo Abandonado / Troca de Motorista**: Quando há uma saída parcial, o retorno (mesmo ou outro motorista) reaproveita o mesmo movimento e retorna `vehicleStayOpenWarning: true`. Um motorista diferente gera histórico `DRIVER_CHANGE` no mesmo ID; a placa do veículo não pode ser alterada nesse fluxo.

4. **Validação**: Todos os endpoints validam os dados de entrada. Campos obrigatórios ausentes ou tipos incorretos retornarão erro 400.

5. **JWT Token**: O token JWT expira em 24 horas. Faça login novamente para obter um novo token.
