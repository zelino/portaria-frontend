# 🧪 Plano Completo de Testes com Playwright - Sistema de Portaria

**Data:** 02/12/2025
**Ambiente:** Frontend (localhost:3001) + Backend API (localhost:3000)
**Pré-requisito:** Banco de dados zerado (sem movimentações)
**Ferramenta:** Playwright MCP (Microsoft Playwright Browser Automation)

---

## 📋 ÍNDICE

1. [Preparação do Ambiente](#1-preparação-do-ambiente)
2. [Suite 1: Cadastro e Entrada](#2-suite-1-cadastro-e-entrada)
3. [Suite 2: Busca e Validação](#3-suite-2-busca-e-validação)
4. [Suite 3: Saída Completa](#4-suite-3-saída-completa)
5. [Suite 4: Saída Parcial](#5-suite-4-saída-parcial)
6. [Suite 5: Retorno](#6-suite-5-retorno)
7. [Suite 6: Troca de Motorista](#7-suite-6-troca-de-motorista)
8. [Suite 7: Histórico e Ciclos](#8-suite-7-histórico-e-ciclos)
9. [Suite 8: Validações e Casos de Erro](#9-suite-8-validações-e-casos-de-erro)
10. [Suite 9: Estatísticas](#10-suite-9-estatísticas)
11. [Checklist Final](#11-checklist-final)

---

## 1. PREPARAÇÃO DO AMBIENTE

### 1.1 Verificar Serviços

```bash
# Terminal 1 - Backend
cd /Users/zelino/Development/back_end/portaria-playduo
npm run dev

# Terminal 2 - Frontend
cd /Users/zelino/Development/front_end/portaria-playduo
npm run dev
```

### 1.2 Zerar Banco de Dados

- Confirmar que banco está limpo (0 movimentações)
- Verificar dashboard inicial vazio

### 1.3 Estado Inicial Esperado

- **Dashboard:**
  - Total no Pátio: 0
  - Visitantes/Pedestres: 0
  - Saída Parcial: 0
  - Tabela vazia: "Nenhuma movimentação ativa no momento"
- **Histórico:**
  - 0 ciclos
  - Mensagem de lista vazia

---

## 2. SUITE 1: CADASTRO E ENTRADA

### 🎯 Objetivo

Validar fluxo completo de cadastro e entrada de diferentes tipos de pessoas e veículos.

### TEST 1.1: Entrada de Motorista com Caminhão ✅

**Cenário:** Primeira entrada no sistema (banco vazio)

**Passos:**

1. Navegar para `http://localhost:3001/`
2. Clicar em "NOVA ENTRADA"
3. Preencher formulário:
   - Documento: `111.111.111-11`
   - Nome: `João Silva`
   - RG: `MG-12.345.678`
   - Empresa: `Transportadora ABC`
   - Tipo: `Motorista`
   - Placa: `ABC1234`
   - Placa Carreta: `XYZ9876`
   - Modelo: `Scania R450`
   - Cor: `Branco`
   - Tipo Veículo: `Caminhão`
   - Motivo: `Entrega de mercadorias`
4. Clicar "Registrar Entrada"

**Validações:**

- ✅ Modal fecha automaticamente
- ✅ Toast de sucesso aparece
- ✅ Dashboard atualiza em tempo real:
  - Total no Pátio: 0 → 1
  - Visitantes/Pedestres: 0 → 1
  - Saída Parcial: 0 (inalterado)
- ✅ Tabela mostra nova linha:
  - Status: "No Pátio" (badge verde)
  - Placa: "ABC1234" + ícone carreta "XYZ9876"
  - Motorista: "JS João Silva"
  - Entrada: timestamp atual
  - Permanência: "há menos de um minuto"
  - Botões: "Saída", "Detalhes"

**Dados de Teste:**

```javascript
const motorista1 = {
  documento: "111.111.111-11",
  nome: "João Silva",
  rg: "MG-12.345.678",
  empresa: "Transportadora ABC",
  tipo: "Motorista",
  veiculo: {
    placa: "ABC1234",
    carreta: "XYZ9876",
    modelo: "Scania R450",
    cor: "Branco",
    tipo: "Caminhão"
  },
  motivo: "Entrega de mercadorias"
};
```

---

### TEST 1.2: Entrada de Motorista com Carro ✅

**Cenário:** Segunda entrada (sistema com 1 movimentação)

**Passos:**

1. Clicar "NOVA ENTRADA"
2. Preencher:
   - Documento: `222.333.444-55`
   - Nome: `Maria Santos`
   - Tipo: `Motorista`
   - Placa: `DEF5678`
   - Tipo Veículo: `Carro`
3. Registrar

**Validações:**

- ✅ Total no Pátio: 1 → 2
- ✅ Visitantes: 1 → 2
- ✅ Tabela mostra 2 linhas
- ✅ Maria Santos aparece na primeira posição (mais recente)

**Dados:**

```javascript
const motorista2 = {
  documento: "222.333.444-55",
  nome: "Maria Santos",
  tipo: "Motorista",
  veiculo: {
    placa: "DEF5678",
    tipo: "Carro"
  }
};
```

---

### TEST 1.3: Entrada de Visitante/Pedestre (sem veículo) ✅

**Cenário:** Entrada de pessoa sem veículo

**Passos:**

1. Clicar "NOVA ENTRADA"
2. Preencher:
   - Documento: `333.444.555-66`
   - Nome: `Carlos Visitante`
   - Tipo: `Visitante`
   - (NÃO preencher dados de veículo)
   - Motivo: `Reunião com gerência`
3. Registrar

**Validações:**

- ✅ Total no Pátio: 2 → 3
- ✅ Visitantes: 2 → 3
- ✅ Placa: "-" (sem veículo)
- ✅ Tipo mostrado como "Visitante" ou "Pedestre"

**Dados:**

```javascript
const visitante1 = {
  documento: "333.444.555-66",
  nome: "Carlos Visitante",
  tipo: "Visitante",
  motivo: "Reunião com gerência"
};
```

---

### TEST 1.4: Entrada de Ajudante com Veículo ✅

**Cenário:** Testar tipo "Ajudante"

**Passos:**

1. Preencher:
   - Documento: `444.555.666-77`
   - Nome: `Pedro Ajudante`
   - Tipo: `Ajudante`
   - Placa: `GHI9012`
   - Tipo Veículo: `Van`
2. Registrar

**Validações:**

- ✅ Total: 3 → 4
- ✅ Visitantes: 3 → 4
- ✅ Tipo "Ajudante" aparece corretamente

**Dados:**

```javascript
const ajudante1 = {
  documento: "444.555.666-77",
  nome: "Pedro Ajudante",
  tipo: "Ajudante",
  veiculo: {
    placa: "GHI9012",
    tipo: "Van"
  }
};
```

---

### TEST 1.5: Entrada com Moto ✅

**Cenário:** Veículo tipo moto

**Passos:**

1. Preencher:
   - Documento: `555.666.777-88`
   - Nome: `Ana Motoboy`
   - Tipo: `Motorista`
   - Placa: `JKL3456`
   - Tipo Veículo: `Moto`
2. Registrar

**Validações:**

- ✅ Total: 4 → 5
- ✅ Tipo veículo "Moto" salvo corretamente

**Dados:**

```javascript
const motoboy1 = {
  documento: "555.666.777-88",
  nome: "Ana Motoboy",
  tipo: "Motorista",
  veiculo: {
    placa: "JKL3456",
    tipo: "Moto"
  }
};
```

---

### TEST 1.6: Entrada com CPF Não Formatado ✅

**Cenário:** Validar formatação automática de CPF

**Passos:**

1. Preencher documento: `66677788899` (sem pontos/traços)
2. Nome: `Lucas Teste`
3. Tipo: `Motorista`
4. Placa: `MNO7890`
5. Registrar

**Validações:**

- ✅ CPF formatado automaticamente para `666.777.888-99`
- ✅ Entrada registrada com sucesso
- ✅ Histórico mostra CPF formatado

**Dados:**

```javascript
const motorista3 = {
  documento: "66677788899", // Sem formatação
  nome: "Lucas Teste",
  tipo: "Motorista",
  veiculo: { placa: "MNO7890" }
};
```

---

### 📊 Estado Esperado Após Suite 1

**Dashboard:**

- Total no Pátio: 6 movimentações
- Visitantes/Pedestres: 6 pessoas
- Saída Parcial: 0

**Tabela (ordem decrescente de entrada):**

1. Lucas Teste - MNO7890
2. Ana Motoboy - JKL3456 (Moto)
3. Pedro Ajudante - GHI9012 (Van)
4. Carlos Visitante - (sem veículo)
5. Maria Santos - DEF5678 (Carro)
6. João Silva - ABC1234 + XYZ9876 (Caminhão)

---

## 3. SUITE 2: BUSCA E VALIDAÇÃO

### 🎯 Objetivo

Validar funcionalidades de busca no histórico.

### TEST 2.1: Busca por Documento (CPF) ✅

**Passos:**

1. Navegar para `/history`
2. Aguardar carregamento (deve mostrar 6 ciclos)
3. Selecionar tipo de busca: "Documento"
4. Digitar: `111.111.111-11`
5. Pressionar Enter ou clicar buscar

**Validações:**

- ✅ Filtra e mostra apenas João Silva
- ✅ Contador: "(1 ciclo)"
- ✅ Outros resultados ocultos

---

### TEST 2.2: Busca por Placa ✅

**Passos:**

1. Limpar busca anterior
2. Selecionar: "Placa"
3. Digitar: `ABC1234`
4. Buscar

**Validações:**

- ✅ Mostra apenas João Silva
- ✅ Exibe placa e carreta corretamente

---

### TEST 2.3: Busca Parcial por Nome ✅

**Passos:**

1. Limpar filtros
2. Verificar se busca livre funciona
3. Digitar: `Silva` (parte do nome)

**Validações:**

- ✅ Mostra João Silva E Lucas Teste (se busca parcial habilitada)
- OU mostra apenas correspondência exata

---

### TEST 2.4: Busca Sem Resultados ✅

**Passos:**

1. Buscar documento: `999.999.999-99` (não existe)

**Validações:**

- ✅ Mostra mensagem "Nenhum ciclo encontrado"
- ✅ Contador: "(0 ciclos)"
- ✅ Não quebra a interface

---

## 4. SUITE 3: SAÍDA COMPLETA

### 🎯 Objetivo

Validar fluxo de saída completa (pessoa E veículo saem juntos).

### TEST 3.1: Saída Completa Simples ✅

**Cenário:** Saída de Lucas Teste (MNO7890)

**Passos:**

1. Voltar ao Dashboard `/`
2. Localizar Lucas Teste na tabela
3. Clicar botão "Saída"
4. Modal "Registrar Saída" abre
5. Verificar aba "Saída Completa" está ativa
6. Preencher (opcional):
   - Motivo: `Entrega finalizada`
7. Clicar "Finalizar Acesso"

**Validações:**

- ✅ Modal fecha
- ✅ Toast de sucesso
- ✅ Lucas removido da tabela
- ✅ Estatísticas:
  - Total: 6 → 5
  - Visitantes: 6 → 5
  - Saída Parcial: 0 (inalterado)
- ✅ Histórico mostra ciclo com:
  - Status: "Encerrado"
  - Data saída: timestamp atual
  - Motivo exibido (se preenchido)

---

### TEST 3.2: Saída Completa com NF e Lacre ✅

**Cenário:** Saída de João Silva com documentação

**Passos:**

1. Clicar "Saída" em João Silva
2. Aba "Saída Completa"
3. Preencher:
   - Motivo: `Carga entregue`
   - NF 1: `12345`
   - Adicionar NF
   - NF 2: `67890`
   - Adicionar NF
   - Número do Lacre: `LAC-9876`
4. Finalizar

**Validações:**

- ✅ Total: 5 → 4
- ✅ Visitantes: 5 → 4
- ✅ Histórico mostra:
  - Status: "Encerrado"
  - NFs: "12345, 67890" (ícone de NF com contador "2")
  - Lacre: LAC-9876
  - Tempo total de permanência calculado

---

### TEST 3.3: Saída de Pedestre ✅

**Cenário:** Saída de pessoa sem veículo

**Passos:**

1. Clicar "Saída" em Carlos Visitante
2. Finalizar (sem preencher campos opcionais)

**Validações:**

- ✅ Total: 4 → 3
- ✅ Visitantes: 4 → 3
- ✅ Saída registrada normalmente (mesmo sem veículo)

---

### 📊 Estado Após Suite 3

**Dashboard:**

- Total: 3 (Ana, Pedro, Maria)
- Visitantes: 3
- Saída Parcial: 0

**Histórico:**

- 6 ciclos totais (3 ativos, 3 encerrados)

---

## 5. SUITE 4: SAÍDA PARCIAL

### 🎯 Objetivo

Validar saída parcial (pessoa sai, veículo fica) e rastreamento de eventos.

### TEST 4.1: Saída Parcial de Maria Santos ✅

**Cenário:** Primeira saída parcial do sistema

**Passos:**

1. Dashboard → Clicar "Saída" em Maria Santos
2. Clicar na aba **"Saída Parcial"**
3. Verificar alerta: "A pessoa sairá, mas o veículo permanecerá no pátio"
4. Verificar info: "O veículo DEF5678 permanecerá no pátio"
5. Preencher **obrigatório**:
   - Motivo: `Almoço - retorna em 1 hora`
6. Clicar "Registrar Saída de Pessoa"

**Validações:**

- ✅ Modal fecha
- ✅ Toast de sucesso
- ✅ Estatísticas:
  - Total: 3 (inalterado - veículo ficou)
  - Visitantes: 3 → 2 (pessoa saiu)
  - Saída Parcial: 0 → 1 (veículo sem motorista)
- ✅ Linha de Maria Santos muda:
  - Status: "No Pátio" → **"Saída Parcial"** (badge vermelho)
  - Entrada: mantém timestamp original
  - **Saída: timestamp atual**
  - Permanência: "Aguardando retorno há menos de um minuto"
  - **Novos botões:**
    - "Finalizar Saída" (encerrar movimento)
    - "Retorno" (mesma pessoa volta)
    - "Outro Motorista" (nova pessoa assume veículo)
    - "Detalhes"

---

### TEST 4.2: Validar Evento PARTIAL_EXIT no Histórico ✅

**Passos:**

1. Navegar para `/history`
2. Clicar no ciclo de Maria Santos
3. Expandir "Histórico da Movimentação"

**Validações:**

- ✅ 2 eventos no histórico:
  1. **PARTIAL_EXIT** (mais recente)
     - Ação: "Saída Parcial"
     - Data/Hora: timestamp da saída
     - Pessoa: Maria Santos
     - Veículo: DEF5678
     - Por: Administrador
     - **Motivo: "Almoço - retorna em 1 hora"**
  2. **ENTRY** (original)
     - Ação: "Entrada"
     - Data/Hora: timestamp da entrada
- ✅ Contador: "Saídas Parciais: 1"
- ✅ Status do ciclo: **"Ativo"** (não "Encerrado")
- ✅ Última saída: timestamp da saída parcial

---

### TEST 4.3: Saída Parcial de Pedro Ajudante ✅

**Cenário:** Segunda saída parcial (múltiplos veículos em espera)

**Passos:**

1. Dashboard → Saída de Pedro Ajudante
2. Aba "Saída Parcial"
3. Motivo: `Resolver documentação na matriz`
4. Registrar

**Validações:**

- ✅ Total: 3 (inalterado)
- ✅ Visitantes: 2 → 1 (só Ana no pátio)
- ✅ Saída Parcial: 1 → 2
- ✅ Pedro em status "Saída Parcial"
- ✅ Maria E Pedro com botões especiais

---

### TEST 4.4: Validar Campo Motivo Obrigatório ✅

**Cenário:** Tentar saída parcial sem motivo

**Passos:**

1. Abrir saída de Ana Motoboy
2. Ir para aba "Saída Parcial"
3. Deixar campo "Motivo" vazio
4. Tentar clicar "Registrar Saída de Pessoa"

**Validações:**

- ✅ Botão permanece **desabilitado** enquanto campo vazio
- ✅ Não permite submissão
- ✅ Após preencher motivo, botão habilita

---

### 📊 Estado Após Suite 4

**Dashboard:**

- Total: 3
- Visitantes: 1 (apenas Ana)
- Saída Parcial: 2 (Maria e Pedro)

**Veículos aguardando:**

- DEF5678 (Maria)
- GHI9012 (Pedro)

---

## 6. SUITE 5: RETORNO

### 🎯 Objetivo

Validar retorno de pessoa após saída parcial.

### TEST 5.1: Retorno de Maria Santos (Mesmo Motorista) ✅

**Cenário:** Motorista retorna para pegar veículo

**Passos:**

1. Dashboard → Localizar Maria Santos (status "Saída Parcial")
2. Clicar botão **"Retorno"**
3. Modal "Entrada Rápida - Retorno" abre
4. Verificar dados **pré-preenchidos**:
   - Documento: 222.333.444-55
   - Nome: Maria Santos
   - Tipo: Motorista
   - Placa: DEF5678
5. Verificar alerta: "Entrada rápida ativada - Dados pré-preenchidos para retorno"
6. Clicar "Registrar Entrada"

**Validações:**

- ✅ Modal fecha
- ✅ Toast de sucesso
- ✅ Estatísticas:
  - Total: 3 (inalterado)
  - Visitantes: 1 → 2 (Maria voltou)
  - Saída Parcial: 2 → 1 (Maria não está mais aguardando)
- ✅ Linha de Maria:
  - Status: "Saída Parcial" → **"No Pátio"**
  - **Entrada: mantém timestamp ORIGINAL** (não cria novo)
  - Saída: removido
  - Permanência: calcula desde entrada original
  - Botões: volta para "Saída" e "Detalhes" (normais)

---

### TEST 5.2: Validar Evento RETURN no Histórico ✅

**Passos:**

1. `/history` → Ciclo de Maria Santos
2. Expandir histórico

**Validações:**

- ✅ **3 eventos** agora:
  1. **RETURN** (mais recente)
     - Ação: "Retorno de Saída Parcial"
     - Data/Hora: timestamp do retorno
     - Pessoa: Maria Santos
     - Veículo: DEF5678
     - Por: Administrador
  2. **PARTIAL_EXIT**
     - (evento anterior mantido)
  3. **ENTRY**
     - (evento original mantido)
- ✅ Contador: "Saídas Parciais: 1" (mantém histórico)
- ✅ Status: **"Ativo"** (ciclo continua ativo)
- ✅ Movimentação mostra:
  - Entrada: timestamp original
  - Saída: vazio ou null
  - Status badge: "No Pátio"

---

### TEST 5.3: Retorno de Pedro Ajudante ✅

**Passos:**

1. Dashboard → "Retorno" em Pedro
2. Registrar entrada rápida

**Validações:**

- ✅ Visitantes: 2 → 3
- ✅ Saída Parcial: 1 → 0 (todos retornaram)
- ✅ Evento RETURN criado no histórico de Pedro

---

### 📊 Estado Após Suite 5

**Dashboard:**

- Total: 3 (Ana, Maria, Pedro - todos "No Pátio")
- Visitantes: 3
- Saída Parcial: 0

---

## 7. SUITE 6: TROCA DE MOTORISTA

### 🎯 Objetivo

**⚠️ TESTE CRÍTICO** - Validar cenário de novo motorista assumindo veículo em saída parcial.

### TEST 6.1: Setup - Nova Saída Parcial ✅

**Passos:**

1. Registrar saída parcial de Ana Motoboy
2. Motivo: `Motorista foi resolver documentos`

**Validações:**

- ✅ Visitantes: 3 → 2
- ✅ Saída Parcial: 0 → 1
- ✅ Moto JKL3456 em espera

---

### TEST 6.2: Novo Motorista Assume Veículo ⚠️

**Cenário:** Paulo assume moto de Ana

**Passos:**

1. Localizar Ana (status "Saída Parcial")
2. Clicar **"Outro Motorista"**
3. Modal deve abrir (verificar título - espera-se "Nova Entrada" ou similar)
4. Preencher **NOVO motorista**:
   - Documento: `777.888.999-00` (diferente de Ana)
   - Nome: `Paulo Novo Motorista`
   - Tipo: `Motorista`
   - Placa: `JKL3456` (mesma moto)
5. Registrar entrada

**Validações Esperadas (se funcionar):**

- ✅ Modal fecha
- ✅ Estatísticas:
  - Total: 3 (ou 4 se criar novo movimento)
  - Visitantes: 2 → 3 (Paulo entrou)
  - Saída Parcial: 1 → 0 (moto não está mais sem motorista)
- ✅ Tabela mostra:
  - **Paulo Novo Motorista** com JKL3456
  - Ana **removida** ou movida para histórico
- ✅ Histórico:
  - Ciclo de Ana: **Encerrado** ou com evento DRIVER_CHANGE
  - **Novo ciclo** de Paulo criado com JKL3456
  - OU evento DRIVER_CHANGE no ciclo de Ana

**Validações de Falha (se bug existir):**

- ❌ Modal não fecha
- ❌ Dados não salvam
- ❌ Ana permanece em "Saída Parcial"
- ❌ Paulo não aparece na tabela
- ❌ Estatísticas não mudam
- ❌ Nenhum evento criado

**⚠️ NOTA:** Este teste **pode falhar** baseado no bug identificado. Documentar comportamento real.

---

### TEST 6.3: Validar Eventos de Troca (se implementado) ✅/❌

**Passos:**

1. `/history` → Buscar ciclos de Ana e Paulo
2. Verificar eventos

**Validações Esperadas:**

- ✅ Ciclo de Ana:
  - Status: "Encerrado"
  - Evento DRIVER_CHANGE ou EXIT
  - Referência ao novo motorista
- ✅ Ciclo de Paulo:
  - Novo ciclo criado
  - Evento ENTRY com nota de "assumiu veículo"
  - Mesma placa JKL3456

---

## 8. SUITE 7: HISTÓRICO E CICLOS

### 🎯 Objetivo

Validar visualização detalhada de ciclos e movimentações.

### TEST 7.1: Detalhes do Ciclo - João Silva ✅

**Passos:**

1. `/history` → Localizar João Silva (Encerrado)
2. Clicar na linha
3. Modal "Detalhes do Ciclo" abre

**Validações:**

- ✅ Cabeçalho: "Todas as movimentações de João Silva com o veículo ABC1234"
- ✅ Contadores:
  - Movimentos: 1
  - Saídas Parciais: 0
  - Trocas: 0
  - Com NF: 2 (se registrou NFs no TEST 3.2)
- ✅ Status: "Encerrado"
- ✅ Dados Pessoais:
  - Nome: João Silva
  - Documento: 111.111.111-11
  - RG: MG-12.345.678 (se preenchido)
  - Empresa: Transportadora ABC
  - Tipo: Motorista
- ✅ Dados do Veículo:
  - Placa: ABC1234
  - Carreta: XYZ9876
  - Modelo: Scania R450
  - Cor: Branco
  - Tipo: Caminhão
- ✅ Movimentação 1:
  - Entrada: timestamp
  - Saída: timestamp
  - Por: Administrador
  - NFs: 12345, 67890
  - Lacre: LAC-9876
- ✅ Histórico: 2 eventos (ENTRY, EXIT)
- ✅ Foto de entrada (se capturada)

---

### TEST 7.2: Detalhes do Ciclo - Maria Santos (com saídas parciais) ✅

**Passos:**

1. Clicar no ciclo de Maria Santos (Ativo)

**Validações:**

- ✅ Contadores:
  - Movimentos: 1
  - **Saídas Parciais: 1** (histórico acumulado)
  - Trocas: 0
- ✅ Status: "Ativo"
- ✅ Histórico: 3 eventos (ENTRY, PARTIAL_EXIT, RETURN)
- ✅ Cada evento mostra:
  - Ação claramente identificada
  - Timestamp
  - Snapshots (pessoa, veículo)
  - Usuário que executou
  - Motivo (quando aplicável)

---

### TEST 7.3: Botão "Ver Todos os Ciclos da Placa" ✅

**Passos:**

1. No modal de detalhes de Maria Santos
2. Clicar "Ver Todos os Ciclos da Placa DEF5678"

**Validações:**

- ✅ Lista filtra mostrando apenas ciclos com DEF5678
- ✅ Se houver múltiplos motoristas (troca), mostra todos
- ✅ Contador atualiza

---

### TEST 7.4: Ordenação e Filtros do Histórico ✅

**Passos:**

1. Voltar para lista de histórico
2. Verificar ordem padrão (mais recentes primeiro)
3. Testar filtros avançados (se existirem):
   - Status: Ativo/Encerrado
   - Data de entrada
   - Data de saída

**Validações:**

- ✅ Ordenação correta
- ✅ Filtros aplicam corretamente
- ✅ Contador reflete filtros

---

## 9. SUITE 8: VALIDAÇÕES E CASOS DE ERRO

### 🎯 Objetivo

Testar validações de formulário e tratamento de erros.

### TEST 8.1: Entrada Duplicada - Mesmo CPF ⚠️

**Cenário:** Tentar registrar entrada de pessoa já no pátio

**Passos:**

1. Dashboard → "NOVA ENTRADA"
2. Preencher com CPF de Maria Santos: `222.333.444-55`
3. Preencher nome e outros dados
4. Tentar registrar

**Validações:**

- ✅ Sistema **deve impedir** (Maria já está ativa)
- ✅ Mensagem de erro clara
- OU ✅ Sistema permite mas cria movimento separado (validar regra de negócio)

---

### TEST 8.2: Entrada Duplicada - Mesma Placa ⚠️

**Cenário:** Tentar registrar entrada com placa já ativa

**Passos:**

1. Tentar registrar novo motorista com placa `DEF5678`

**Validações:**

- ✅ Sistema impede ou alerta
- ✅ Mensagem: "Veículo já está no pátio"

---

### TEST 8.3: Campos Obrigatórios - Documento ✅

**Passos:**

1. NOVA ENTRADA
2. Deixar "Documento" vazio
3. Preencher outros campos
4. Tentar registrar

**Validações:**

- ✅ Botão desabilitado OU erro de validação
- ✅ Campo destacado em vermelho
- ✅ Mensagem: "Campo obrigatório"

---

### TEST 8.4: Campos Obrigatórios - Nome ✅

**Passos:**

1. Preencher documento
2. Deixar nome vazio
3. Tentar registrar

**Validações:**

- ✅ Validação impede registro
- ✅ Foco no campo obrigatório

---

### TEST 8.5: Validação de CPF Inválido ✅

**Passos:**

1. Preencher documento: `111.111.111-11` (CPF inválido - dígitos repetidos)
2. Tentar registrar

**Validações:**

- ✅ Sistema aceita (sem validação de dígito) OU
- ✅ Mensagem de erro se validar algoritmicamente

---

### TEST 8.6: Placa com Formato Inválido ✅

**Passos:**

1. Preencher placa: `INVALIDO` (sem padrão Mercosul/Brasil)

**Validações:**

- ✅ Sistema aceita (placas internacionais permitidas) OU
- ✅ Validação específica aplicada

---

### TEST 8.7: Saída de Movimentação Inexistente ⚠️

**Cenário:** Manipulação de URL/API

**Passos:**

1. Tentar acessar `/movements/999999` (ID inexistente)

**Validações:**

- ✅ Retorna 404 ou mensagem amigável
- ✅ Não quebra a aplicação

---

### TEST 8.8: Backend Offline ⚠️

**Passos:**

1. Desligar servidor backend
2. Tentar registrar nova entrada

**Validações:**

- ✅ Mensagem de erro clara
- ✅ Toast: "Erro ao conectar com servidor"
- ✅ Formulário não limpa (preserva dados)
- ✅ Aplicação não quebra

---

## 10. SUITE 9: ESTATÍSTICAS

### 🎯 Objetivo

Validar precisão de cálculos e contadores.

### TEST 9.1: Contadores do Dashboard ✅

**Após todas as suites anteriores:**

**Validações:**

- ✅ **Total no Pátio** = soma de linhas na tabela
- ✅ **Visitantes/Pedestres** = total de pessoas físicas no pátio
- ✅ **Saída Parcial** = veículos sem motorista
- ✅ Consistência entre cards e tabela

---

### TEST 9.2: Cálculo de Permanência ✅

**Passos:**

1. Verificar coluna "Permanência" na tabela
2. Aguardar 1 minuto
3. Atualizar página

**Validações:**

- ✅ Atualiza corretamente ("há 1 minuto", "2 minutos", etc.)
- ✅ Para movimentos antigos: "cerca de X horas"
- ✅ Formato legível e traduzido

---

### TEST 9.3: Tempo Total em Ciclo Encerrado ✅

**Passos:**

1. Histórico → João Silva (encerrado)
2. Verificar tempo total

**Validações:**

- ✅ Calcula diferença entre entrada e saída
- ✅ Formato: "X horas Y minutos" ou similar
- ✅ Dados consistentes

---

### TEST 9.4: Contadores de Eventos ✅

**Passos:**

1. Abrir ciclo de Maria Santos
2. Verificar contadores

**Validações:**

- ✅ "Saídas Parciais: 1" correto
- ✅ Se houver trocas, contador "Trocas" preciso
- ✅ "Com NF" conta movimentos com NF registrada

---

## 11. CHECKLIST FINAL

### ✅ Funcionalidades Core

- [ ] **Entrada de Movimentação**
  - [ ] Motorista com caminhão
  - [ ] Motorista com carro
  - [ ] Motorista com moto
  - [ ] Motorista com van
  - [ ] Visitante/Pedestre (sem veículo)
  - [ ] Ajudante
  - [ ] Com carreta
  - [ ] Formatação automática de CPF
  - [ ] Validação de campos obrigatórios

- [ ] **Saída Completa**
  - [ ] Saída simples
  - [ ] Saída com NF (uma)
  - [ ] Saída com múltiplas NFs
  - [ ] Saída com lacre
  - [ ] Saída de pedestre
  - [ ] Motivo opcional

- [ ] **Saída Parcial**
  - [ ] Registro de saída parcial
  - [ ] Campo motivo obrigatório
  - [ ] Evento PARTIAL_EXIT criado
  - [ ] Status badge "Saída Parcial"
  - [ ] Botões especiais aparecem
  - [ ] Estatísticas corretas
  - [ ] Múltiplas saídas parciais no mesmo ciclo

- [ ] **Retorno**
  - [ ] Modal de entrada rápida
  - [ ] Dados pré-preenchidos
  - [ ] Evento RETURN criado
  - [ ] Mantém timestamp original
  - [ ] Status volta para "No Pátio"
  - [ ] Estatísticas atualizam

- [ ] **Troca de Motorista** ⚠️
  - [ ] Botão "Outro Motorista" funciona
  - [ ] Novo motorista registrado
  - [ ] Ciclo anterior encerrado
  - [ ] Evento DRIVER_CHANGE (se implementado)
  - [ ] Estatísticas corretas

- [ ] **Histórico**
  - [ ] Lista de ciclos carrega
  - [ ] Busca por documento
  - [ ] Busca por placa
  - [ ] Busca por NF
  - [ ] Detalhes do ciclo
  - [ ] Eventos exibidos corretamente
  - [ ] Contadores precisos
  - [ ] "Ver todos os ciclos da placa"

- [ ] **Dashboard**
  - [ ] Estatísticas "Total no Pátio"
  - [ ] Estatísticas "Visitantes/Pedestres"
  - [ ] Estatísticas "Saída Parcial"
  - [ ] Tabela de movimentações ativas
  - [ ] Ordenação (mais recentes primeiro)
  - [ ] Cálculo de permanência
  - [ ] Badges de status coloridos
  - [ ] Botões de ação contextuais

### ✅ Campo `history`

- [ ] **Eventos Rastreados**
  - [ ] ENTRY
  - [ ] PARTIAL_EXIT (com motivo)
  - [ ] RETURN
  - [ ] EXIT (saída completa)
  - [ ] DRIVER_CHANGE (se implementado)

- [ ] **Estrutura dos Eventos**
  - [ ] `action` correto
  - [ ] `performedAt` com timestamp
  - [ ] `performedBy` com usuário
  - [ ] `personNameSnapshot` preenchido
  - [ ] `vehiclePlateSnapshot` preenchido
  - [ ] `reason` quando aplicável

### ✅ UI/UX

- [ ] Toasts de sucesso aparecem
- [ ] Toasts de erro aparecem
- [ ] Modais fecham automaticamente
- [ ] Atualização em tempo real
- [ ] Responsividade mobile (se aplicável)
- [ ] Tema claro/escuro (se aplicável)
- [ ] Ícones corretos
- [ ] Badges coloridos (verde, vermelho, etc.)
- [ ] Mensagens de erro amigáveis
- [ ] Loading states

### ✅ Validações

- [ ] Campos obrigatórios impedidos
- [ ] Formatação de CPF automática
- [ ] Validação de dados duplicados
- [ ] Tratamento de erros de API
- [ ] Mensagens claras de erro

### ⚠️ Bugs Conhecidos

- [ ] **Troca de Motorista não funciona** (documentado no relatório anterior)

---

## 📝 ORDEM DE EXECUÇÃO RECOMENDADA

### Fase 1: Setup e Validação Inicial (5 min)

1. Zerar banco de dados
2. Iniciar serviços (backend + frontend)
3. Verificar dashboard vazio
4. Verificar histórico vazio

### Fase 2: Cadastros Básicos (10 min)

1. Suite 1: Testes 1.1 a 1.6
2. Validar estatísticas progressivas

### Fase 3: Funcionalidades de Pesquisa (5 min)

1. Suite 2: Testes 2.1 a 2.4

### Fase 4: Saídas Completas (10 min)

1. Suite 3: Testes 3.1 a 3.3
2. Validar histórico de ciclos encerrados

### Fase 5: Saídas Parciais (10 min)

1. Suite 4: Testes 4.1 a 4.4
2. Validar eventos PARTIAL_EXIT

### Fase 6: Retornos (10 min)

1. Suite 5: Testes 5.1 a 5.3
2. Validar eventos RETURN

### Fase 7: Troca de Motorista (10 min) ⚠️

1. Suite 6: Testes 6.1 a 6.3
2. **Documentar falhas** se bug existir

### Fase 8: Histórico Completo (10 min)

1. Suite 7: Testes 7.1 a 7.4
2. Validar todos os eventos criados

### Fase 9: Validações e Erros (10 min)

1. Suite 8: Testes 8.1 a 8.8
2. Documentar comportamento de erros

### Fase 10: Estatísticas Finais (5 min)

1. Suite 9: Testes 9.1 a 9.4
2. Validar consistência de dados

### Fase 11: Checklist e Relatório (5 min)

1. Preencher checklist final
2. Gerar relatório de bugs
3. Documentar comportamentos inesperados

**TEMPO TOTAL ESTIMADO: 90 minutos**

---

## 📊 DADOS DE TESTE CONSOLIDADOS

```javascript
// Para uso em scripts automatizados

const testData = {
  motoristas: [
    {
      id: 1,
      documento: "111.111.111-11",
      nome: "João Silva",
      rg: "MG-12.345.678",
      empresa: "Transportadora ABC",
      tipo: "Motorista",
      veiculo: {
        placa: "ABC1234",
        carreta: "XYZ9876",
        modelo: "Scania R450",
        cor: "Branco",
        tipo: "Caminhão"
      },
      motivo: "Entrega de mercadorias"
    },
    {
      id: 2,
      documento: "222.333.444-55",
      nome: "Maria Santos",
      tipo: "Motorista",
      veiculo: {
        placa: "DEF5678",
        tipo: "Carro"
      }
    },
    {
      id: 3,
      documento: "444.555.666-77",
      nome: "Pedro Ajudante",
      tipo: "Ajudante",
      veiculo: {
        placa: "GHI9012",
        tipo: "Van"
      }
    },
    {
      id: 4,
      documento: "555.666.777-88",
      nome: "Ana Motoboy",
      tipo: "Motorista",
      veiculo: {
        placa: "JKL3456",
        tipo: "Moto"
      }
    },
    {
      id: 5,
      documento: "66677788899", // Sem formatação
      nome: "Lucas Teste",
      tipo: "Motorista",
      veiculo: {
        placa: "MNO7890"
      }
    }
  ],

  visitantes: [
    {
      id: 1,
      documento: "333.444.555-66",
      nome: "Carlos Visitante",
      tipo: "Visitante",
      motivo: "Reunião com gerência"
    }
  ],

  saidas: {
    completas: [
      {
        motorista: "Lucas Teste",
        motivo: "Entrega finalizada"
      },
      {
        motorista: "João Silva",
        motivo: "Carga entregue",
        nfs: ["12345", "67890"],
        lacre: "LAC-9876"
      },
      {
        motorista: "Carlos Visitante"
      }
    ],

    parciais: [
      {
        motorista: "Maria Santos",
        motivo: "Almoço - retorna em 1 hora"
      },
      {
        motorista: "Pedro Ajudante",
        motivo: "Resolver documentação na matriz"
      },
      {
        motorista: "Ana Motoboy",
        motivo: "Motorista foi resolver documentos"
      }
    ]
  },

  retornos: [
    {
      motorista: "Maria Santos",
      documento: "222.333.444-55",
      placa: "DEF5678"
    },
    {
      motorista: "Pedro Ajudante",
      documento: "444.555.666-77",
      placa: "GHI9012"
    }
  ],

  trocas: [
    {
      motoristaOriginal: "Ana Motoboy",
      documentoOriginal: "555.666.777-88",
      novoMotorista: {
        documento: "777.888.999-00",
        nome: "Paulo Novo Motorista",
        tipo: "Motorista"
      },
      placa: "JKL3456"
    }
  ]
};
```

---

## 🐛 BUGS CONHECIDOS A VALIDAR

1. **Troca de Motorista** (Prioridade ALTA)
   - Botão "Outro Motorista" não cria novo ciclo
   - Ciclo anterior não encerra
   - Estatísticas não atualizam

2. **Validações de Duplicidade** (Prioridade MÉDIA)
   - Verificar se impede CPF duplicado
   - Verificar se impede placa duplicada

3. **Tratamento de Erros** (Prioridade MÉDIA)
   - Backend offline
   - Timeout de requisições
   - Dados inválidos

---

## ✅ CRITÉRIOS DE SUCESSO

**Teste considerado BEM-SUCEDIDO se:**

- ✅ 95%+ dos testes da Suite 1-5 passarem
- ✅ 90%+ dos testes da Suite 7-9 passarem
- ✅ Campo `history` rastreando eventos corretamente
- ✅ Estatísticas sempre consistentes
- ✅ Sem crashes ou erros fatais
- ⚠️ Suite 6 pode falhar (bug conhecido)

**Teste considerado FALHO se:**

- ❌ Estatísticas inconsistentes em qualquer momento
- ❌ Eventos não sendo criados no `history`
- ❌ Crashes ou erros 500 frequentes
- ❌ Dados perdidos ou corrompidos

---

## 📄 RELATÓRIO FINAL

Após executar todas as suites, gerar relatório contendo:

1. **Resumo Executivo**
   - Total de testes: X
   - Sucessos: Y (Z%)
   - Falhas: W (V%)

2. **Testes por Suite**
   - Suite 1: X/Y passaram
   - Suite 2: X/Y passaram
   - ... (para cada suite)

3. **Bugs Identificados**
   - Críticos: lista
   - Altos: lista
   - Médios: lista
   - Baixos: lista

4. **Funcionalidades Validadas**
   - ✅ Lista de features funcionando
   - ❌ Lista de features quebradas

5. **Campo `history` - Validação**
   - Eventos confirmados funcionando
   - Eventos não testados
   - Estrutura de dados validada

6. **Recomendações**
   - Bugs prioritários para correção
   - Melhorias sugeridas
   - Testes adicionais necessários

---

**FIM DO PLANO DE TESTES**

Este documento deve ser usado como guia completo para validação do sistema. Execute os testes na ordem recomendada e documente todos os resultados para rastreabilidade completa.
