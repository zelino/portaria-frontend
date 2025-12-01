# Lógica de Saída Parcial e Retorno

## 📋 Como Funciona

### 1. Saída Parcial (PARTIAL_EXIT) - Almoço

Quando um motorista sai para almoçar, mas deixa o veículo no pátio:

```typescript
// POST /movements/exit
{
  "movementId": "uuid-do-movimento",
  "type": "PARTIAL_EXIT",
  "closedById": "uuid-do-usuario"
}
```

**O que acontece:**
- ✅ `exitedAt` é preenchido com a data/hora atual
- ✅ `vehicleStayOpen = true` (veículo fica no pátio)
- ✅ `closedById` registra quem fechou
- ❌ `invoiceNumbers`, `sealNumber`, `exitPhotos` NÃO são salvos

**Estado do Movimento após Saída Parcial:**
```json
{
  "id": "movement-1",
  "enteredAt": "2024-01-15T10:00:00.000Z",
  "exitedAt": "2024-01-15T12:00:00.000Z",  // ← Preenchido
  "vehicleStayOpen": true,                  // ← Veículo ainda no pátio
  "person": {
    "name": "João Silva",
    "cpf": "12345678900"
  },
  "vehicle": { "plate": "ABC1234" }
}
```

**O movimento aparece:**
- ✅ No histórico (`GET /movements/history?status=active`) - porque `vehicleStayOpen = true`
- ✅ No pátio ativo (`GET /movements/patio`) - porque `vehicleStayOpen = true`
- ✅ No histórico geral (`GET /movements/history`) - como movimento encerrado

---

### 2. Entrada Após Saída Parcial - Dois Cenários Possíveis

#### 📌 Cenário A: Mesmo Motorista Retorna (Retorno do Almoço)

Quando o **mesmo motorista** retorna após o almoço:

```typescript
// POST /movements/entrance
{
  "cpf": "12345678900",  // ← MESMO CPF do movimento anterior
  "name": "João Silva",
  "personType": "DRIVER",
  "plate": "ABC1234",  // ← Mesma placa do veículo "abandonado"
  "vehicleType": "TRUCK",
  "createdById": "uuid-do-usuario"
}
```

**O que acontece:**

1. **Sistema verifica** se existe movimento com:
   - `vehicle.plate == "ABC1234"`
   - `vehicleStayOpen == true`

2. **Se encontrar:**
   - ✅ Compara CPF do novo movimento com CPF do movimento anterior
   - ✅ Se CPF for **igual** → Detecta "mesmo motorista retornando"
   - ✅ **FECHA automaticamente** o movimento anterior (`vehicleStayOpen = false`)
   - ✅ Cria novo movimento para o retorno
   - ✅ Retorna `isSameDriver: true`

3. **Resposta da API:**
```json
{
  "movement": {
    "id": "movement-2",  // ← NOVO movimento
    "enteredAt": "2024-01-15T13:00:00.000Z",
    "exitedAt": null,
    "vehicleStayOpen": false,
    "person": {
      "name": "João Silva",
      "cpf": "12345678900"
    },
    "vehicle": { "plate": "ABC1234" }
  },
  "vehicleStayOpenWarning": true,
  "existingVehiclePlate": "ABC1234",
  "previousMovementId": "movement-1",
  "isSameDriver": true,  // ← Indica que é o mesmo motorista
  "previousDriverName": "João Silva"
}
```

**Estado Final:**
- **Movimento 1**: `exitedAt` preenchido, `vehicleStayOpen = false` ✅ FECHADO`
- **Movimento 2**: `exitedAt = null`, `vehicleStayOpen = false` ✅ ATIVO`

---

#### 📌 Cenário B: Motorista Diferente Vem Pegar o Veículo

Quando um **motorista diferente** vem pegar o veículo que foi deixado:

```typescript
// POST /movements/entrance
{
  "cpf": "98765432100",  // ← CPF DIFERENTE do movimento anterior
  "name": "Maria Santos",
  "personType": "DRIVER",
  "plate": "ABC1234",  // ← Mesma placa do veículo "abandonado"
  "vehicleType": "TRUCK",
  "createdById": "uuid-do-usuario"
}
```

**O que acontece:**

1. **Sistema verifica** se existe movimento com:
   - `vehicle.plate == "ABC1234"`
   - `vehicleStayOpen == true`

2. **Se encontrar:**
   - ✅ Compara CPF do novo movimento com CPF do movimento anterior
   - ✅ Se CPF for **diferente** → Detecta "motorista diferente"
   - ⚠️ **NÃO fecha** o movimento anterior automaticamente
   - ✅ Cria novo movimento
   - ✅ Retorna `isSameDriver: false` e `previousDriverName`

3. **Resposta da API:**
```json
{
  "movement": {
    "id": "movement-2",  // ← NOVO movimento
    "enteredAt": "2024-01-15T13:00:00.000Z",
    "exitedAt": null,
    "vehicleStayOpen": false,
    "person": {
      "name": "Maria Santos",
      "cpf": "98765432100"  // ← CPF diferente
    },
    "vehicle": { "plate": "ABC1234" }
  },
  "vehicleStayOpenWarning": true,
  "existingVehiclePlate": "ABC1234",
  "previousMovementId": "movement-1",
  "isSameDriver": false,  // ← Indica que é motorista diferente
  "previousDriverName": "João Silva"  // ← Nome do motorista anterior
}
```

**Estado Final:**
- **Movimento 1**: `exitedAt` preenchido, `vehicleStayOpen = true` ⚠️ **AINDA ABERTO**
- **Movimento 2**: `exitedAt = null`, `vehicleStayOpen = false` ✅ ATIVO

**⚠️ IMPORTANTE:** Neste caso, o operador precisa:
1. Fazer a **saída completa** do Movement #1 (com NF, lacre, etc)
2. Ou o sistema pode permitir que o Movement #1 seja fechado automaticamente quando o Movement #2 for criado (dependendo da regra de negócio)

---

## 🔄 Fluxo Completo

### Caso 1: Mesmo Motorista (Retorno do Almoço)

```
1. Entrada Inicial
   João Silva + Veículo ABC1234 → Movement #1 (ativo)

2. Saída Parcial
   João Silva sai → Movement #1:
   - exitedAt: 12:00 ✅
   - vehicleStayOpen: true ⚠️

3. Retorno (Mesmo Motorista)
   João Silva retorna + Veículo ABC1234 → Sistema detecta:
   - CPF igual ✅
   - Fecha Movement #1 automaticamente (vehicleStayOpen = false)
   - Cria Movement #2 (ativo)

4. Estado Final
   Movement #1: Fechado ✅
   Movement #2: Ativo ✅
```

### Caso 2: Motorista Diferente (Troca de Motorista)

```
1. Entrada Inicial
   João Silva + Veículo ABC1234 → Movement #1 (ativo)

2. Saída Parcial
   João Silva sai → Movement #1:
   - exitedAt: 12:00 ✅
   - vehicleStayOpen: true ⚠️

3. Entrada (Motorista Diferente)
   Maria Santos + Veículo ABC1234 → Sistema detecta:
   - CPF diferente ⚠️
   - NÃO fecha Movement #1
   - Cria Movement #2 (ativo)
   - Retorna aviso: "Veículo estava com João Silva"

4. Estado Final
   Movement #1: Ainda aberto ⚠️ (precisa ser fechado manualmente)
   Movement #2: Ativo ✅
```

---

## 💡 Recomendações para o Frontend

### Quando `isSameDriver = true`:
- Mostrar mensagem: "Motorista retornou. Movimento anterior foi fechado automaticamente."
- Opcional: Mostrar link para ver o movimento anterior

### Quando `isSameDriver = false`:
- Mostrar **ALERTA** importante:
  ```
  ⚠️ ATENÇÃO: Veículo ABC1234 estava com outro motorista!

  Motorista anterior: João Silva
  Motorista atual: Maria Santos

  Ação necessária:
  1. Verificar se o motorista anterior autorizou a retirada
  2. Fazer saída completa do movimento anterior (com NF, lacre, etc)
  3. Ou confirmar que o veículo foi transferido corretamente
  ```
- Oferecer botão: "Fechar movimento anterior agora"
- Mostrar link para o movimento anterior (`previousMovementId`)

---

## 🔧 Implementação Técnica

### Verificação de CPF

```typescript
// Normalizar CPFs (remover formatação)
const normalizedCpf = dto.cpf.replace(/\D/g, '');
const existingCpf = existingOpenVehicle.person.cpf.replace(/\D/g, '');

// Comparar
const isSameDriver = normalizedCpf === existingCpf;
```

### Fechamento Automático (Apenas para Mesmo Motorista)

```typescript
if (isSameDriver) {
  // Fechar movimento anterior automaticamente
  await this.prisma.movement.update({
    where: { id: existingOpenVehicle.id },
    data: {
      vehicleStayOpen: false,
    },
  });
}
```

---

## ❓ Decisões de Negócio

### Pergunta 1: Fechar automaticamente quando motorista diferente?

**Opção A:** Não fechar (atual)
- Motorista anterior precisa fazer saída completa manualmente
- Mais controle e auditoria
- Requer ação do operador

**Opção B:** Fechar automaticamente também
- Mais simples para o operador
- Menos controle sobre transferências
- Pode perder rastreabilidade

**Recomendação:** Manter como está (Opção A) para motorista diferente, mas adicionar endpoint para fechar movimento anterior quando necessário.

### Pergunta 2: Permitir fechar movimento anterior via API?

Criar endpoint específico:

```typescript
// POST /movements/:id/close-vehicle
// Fecha apenas o vehicleStayOpen (sem exigir NF, etc)
// Útil quando motorista diferente pega o veículo
```

---

## 📝 Resumo

1. **Saída Parcial:** Motorista sai, veículo fica (`vehicleStayOpen = true`)

2. **Retorno - Mesmo Motorista:**
   - Sistema detecta CPF igual
   - Fecha movimento anterior automaticamente
   - Cria novo movimento

3. **Retorno - Motorista Diferente:**
   - Sistema detecta CPF diferente
   - NÃO fecha movimento anterior
   - Cria novo movimento
   - Retorna aviso para o operador
   - Operador precisa fechar movimento anterior manualmente

4. **Campos na Resposta:**
   - `vehicleStayOpenWarning`: Indica que havia veículo abandonado
   - `isSameDriver`: Indica se é o mesmo motorista
   - `previousDriverName`: Nome do motorista anterior
   - `previousMovementId`: ID do movimento anterior (para referência)
