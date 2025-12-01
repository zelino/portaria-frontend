# PRD - Sistema Web de Controle de Portaria

**Versão:** 1.0
**Status:** Rascunho Inicial
**Tipo:** Aplicação Web

## 1. Visão Geral e Objetivos

O objetivo é desenvolver um sistema web simplificado para o controle de fluxo de pessoas e veículos em uma portaria industrial/empresarial. O sistema deve focar na agilidade do registro e na flexibilidade de situações logísticas, como a dissociação momentânea entre motorista e veículo (ex: motorista sai para almoçar e o caminhão permanece no pátio).

## 2. Perfis de Usuário (Atores)

### Porteiro/Operador

Usuário principal. Foca em registrar entradas e saídas rapidamente. Precisa de interface limpa e poucos cliques.

### Administrador/Gestor

Foca em relatórios, auditoria de acessos e gerenciamento de usuários.

## 3. Requisitos Funcionais

### 3.1. Autenticação e Usuários

- **Login:** Sistema de login simples (E-mail/Usuário e Senha).
- **Multi-usuário:** O sistema deve suportar múltiplos porteiros logados simultaneamente.
- **Auditoria:** Toda ação de registro (entrada/saída) deve gravar o ID do usuário que realizou a operação.

### 3.2. Cadastros Base (Banco de Dados)

#### Pessoas

- **Dados:** Nome, CPF (chave única), RG, Empresa, Tipo (Funcionário, Visitante, Motorista).
- **Mídia:** Foto do rosto (Webcam ou Upload).

#### Veículos

- **Dados:** Placa (chave de busca), Tipo (Carro, Caminhão, Moto), Modelo, Cor.
- **Obs:** O veículo deve ser cadastrado uma única vez e reutilizado em futuras entradas.

### 3.3. Fluxo de Entrada (Registro)

- **Busca Prévia:** O sistema deve permitir buscar por CPF ou Placa antes de iniciar um registro para aproveitar dados já cadastrados.
- **Vínculo Pessoa x Veículo:** No momento da entrada, o operador deve poder vincular uma pessoa a um veículo existente ou cadastrar um novo.
- **Nota:** Deve ser possível registrar entrada de pessoa sem veículo (pedestre).
- **Dados da Entrada:** Data/Hora (automático), Motivo (Visita, Carregamento, etc.), KM (opcional).

### 3.4. Fluxo de Saída e Gestão de Pátio

- **Dashboard de Pátio:** Lista visível de todos os veículos/pessoas que estão com entrada em aberto ("Dentro da empresa").
- **Registro de Saída Completa:** Baixa na pessoa e no veículo.
- **Campos de Saída:** Número da NF (Obrigatório ou Opcional configurável), Lacre (Opcional).
- **Mídia de Saída:** Upload/Captura de foto do veículo/carga na saída.

#### Registro de Saída Parcial (Caso "Almoço")

- Funcionalidade para registrar a saída apenas da Pessoa, mantendo o status do Veículo como "No Pátio".
- Ao retornar, o sistema deve alertar que existe um veículo vinculado àquele CPF aguardando no pátio e sugerir o re-vínculo.

### 3.5. Relatórios e Consultas

- **Busca Histórica:** Campo de busca global para encontrar registros passados por Placa, Nome, CPF ou NF.
- **Relatório de Movimentação:** Listagem com filtros de data, tipo de pessoa e status.
- **Detalhes do Registro:** Ao clicar em um registro histórico, exibir: Quem entrou, qual veículo, horários, NF, fotos e quem foi o porteiro responsável.

## 4. Regras de Negócio (Lógica do Sistema)

- **Unicidade:** Não pode haver duas entradas "Abertas" para a mesma Pessoa ou mesma Placa simultaneamente (exceto no caso de saída parcial do motorista).
- **Visibilidade Compartilhada:** Se o Porteiro A registrar uma entrada, o Porteiro B (em outro computador) deve ver essa informação atualizada no Dashboard imediatamente (ou ao atualizar a página).
- **Persistência de Dados:** O cadastro da pessoa e do veículo não deve ser apagado após a saída; apenas o registro da "visita" é encerrado.

## 5. Requisitos Não Funcionais (Técnicos/UX)

- **Interface:** Responsiva (focada em Desktop/Tablet). Botões grandes para ações principais.
- **Performance:** A busca de placa/CPF deve retornar em menos de 1 segundo.
- **Hardware:** Integração com Webcam padrão do navegador para captura de fotos.

## 6. Protótipo de Fluxo Crítico (O "Caso do Almoço")

Para garantir que o desenvolvedor entenda a prioridade, aqui está o fluxo detalhado:

### Cenário

Caminhão Placa ABC-1234 entra com Motorista João às 08:00.

### Ação 1

**Horário:** Às 12:00, João sai a pé para almoçar.

**Sistema:** O porteiro clica na entrada ativa. Seleciona a opção "Saída Apenas do Motorista".

**Status no Banco:** Movimentação do Veículo = Aberta / Movimentação da Pessoa = Encerrada temporariamente.

### Ação 2

**Horário:** Às 13:00, João retorna.

**Sistema:** Porteiro digita CPF do João. O sistema alerta: "O Veículo ABC-1234 está no pátio vinculado a este motorista. Deseja retomar o vínculo?".

### Ação 3

**Horário:** Às 16:00, Caminhão e Motorista saem com a carga.

**Sistema:** Porteiro seleciona "Saída Total". Preenche NF 00192, Lacre 9988, tira foto da carga e encerra.
