# Plano de Implementação - Saída Parcial e Retorno

## 📋 Análise da Situação Atual

### ✅ O que já está implementado:
1. **Exit Modal (`exit-modal.tsx`)**:
   - ✅ Suporta `PARTIAL_EXIT` e `FULL_EXIT`
   - ✅ Interface com tabs para escolher tipo de saída
   - ✅ Validação: PARTIAL_EXIT não requer NFs, lacre ou fotos

2. **Status Badge (`status-badge.tsx`)**:
   - ✅ Mostra "Saída Parcial" quando `vehicleStayOpen = true`
   - ✅ Diferencia visualmente movimentos com saída parcial

3. **Entry Form (`entry-form.tsx`)**:
   - ⚠️ Tem lógica básica para `vehicleStayOpenWarning` mas está incompleta
   - ⚠️ Não trata `isSameDriver`, `previousMovementId`, `previousDriverName`

### ❌ O que precisa ser implementado:

1. **Tratamento completo da resposta de entrada** quando há veículo abandonado
2. **Modal/Alert informativo** para diferentes cenários
3. **Ação para fechar movimento anterior** quando motorista diferente
4. **Melhorias na UX** do fluxo completo

---

## 🎯 Objetivos da Implementação

1. **Melhorar feedback visual** quando há veículo abandonado
2. **Guiar o operador** nas ações necessárias
3. **Facilitar o fechamento** de movimentos anteriores quando necessário
4. **Manter rastreabilidade** e auditoria

---

## 📐 Arquitetura da Solução

### 1. Componente: `VehicleAbandonedWarningModal`

**Propósito**: Exibir informações e ações quando detectado veículo abandonado

**Props**:
```typescript
interface VehicleAbandonedWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    vehicleStayOpenWarning: true;
    existingVehiclePlate: string;
    previousMovementId: string;
    isSameDriver: boolean;
    previousDriverName?: string;
    newMovementId: string;
  };
  onClosePreviousMovement?: (movementId: string) => void;
}
```

**Comportamento**:
- **Cenário A (isSameDriver = true)**:
  - ✅ Mensagem informativa: "Motorista retornou. Movimento anterior foi fechado automaticamente."
  - ✅ Link para ver movimento anterior
  - ✅ Botão "Continuar" para fechar o modal

- **Cenário B (isSameDriver = false)**:
  - ⚠️ Alerta crítico: "ATENÇÃO: Veículo estava com outro motorista!"
  - ⚠️ Mostrar: Motorista anterior vs Motorista atual
  - ⚠️ Botão: "Fechar Movimento Anterior Agora"
  - ⚠️ Link: "Ver Movimento Anterior"
  - ⚠️ Botão secundário: "Continuar sem fechar"

### 2. Hook: `useClosePreviousMovement`

**Propósito**: Fechar movimento anterior quando motorista diferente

**Implementação**:
```typescript
export function useClosePreviousMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movementId: string) => {
      // Opção 1: Se API tiver endpoint específico
      // return api.post(`/movements/${movementId}/close-vehicle`);

      // Opção 2: Usar endpoint de saída com tipo especial
      // return api.post(`/movements/exit`, {
      //   movementId,
      //   type: "CLOSE_VEHICLE_ONLY",
      //   closedById: user.id
      // });

      // Opção 3: Atualizar diretamente (se API permitir)
      // return api.patch(`/movements/${movementId}`, {
      //   vehicleStayOpen: false
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

**Nota**: Depende de qual endpoint a API fornece. Verificar documentação.

### 3. Atualização: `entry-form.tsx`

**Mudanças necessárias**:

1. **Capturar resposta completa da API**:
```typescript
const result = await createEntrance.mutateAsync(payload);

// Verificar se há warning de veículo abandonado
if (result.data?.vehicleStayOpenWarning) {
  setVehicleAbandonedData({
    existingVehiclePlate: result.data.existingVehiclePlate,
    previousMovementId: result.data.previousMovementId,
    isSameDriver: result.data.isSameDriver,
    previousDriverName: result.data.previousDriverName,
    newMovementId: result.data.movement.id,
  });
  setShowVehicleWarning(true);
} else {
  // Sucesso normal
  toast({ title: "Sucesso", description: "Entrada registrada com sucesso" });
  handleClose();
}
```

2. **Estado para gerenciar warning**:
```typescript
const [vehicleAbandonedData, setVehicleAbandonedData] = useState<VehicleAbandonedData | null>(null);
const [showVehicleWarning, setShowVehicleWarning] = useState(false);
```

3. **Renderizar modal de warning**:
```tsx
<VehicleAbandonedWarningModal
  open={showVehicleWarning}
  onOpenChange={setShowVehicleWarning}
  data={vehicleAbandonedData}
  onClosePreviousMovement={handleClosePreviousMovement}
  onContinue={() => {
    setShowVehicleWarning(false);
    handleClose();
  }}
/>
```

### 4. Melhorias: Dashboard e Histórico

**Dashboard (`page.tsx`)**:
- ✅ Já mostra status "Saída Parcial" corretamente
- ✅ Movimentos com `vehicleStayOpen = true` aparecem no pátio ativo
- ⚠️ **Sugestão**: Adicionar filtro visual para destacar movimentos com saída parcial

**Histórico (`history/page.tsx`)**:
- ✅ Já mostra status corretamente
- ✅ Filtro por status `active` inclui movimentos com saída parcial
- ✅ Filtro por status `closed` mostra movimentos finalizados

---

## 🔄 Fluxo de Implementação

### Fase 1: Componente de Warning (Prioridade Alta)

1. ✅ Criar `VehicleAbandonedWarningModal`
2. ✅ Implementar UI para cenário A (mesmo motorista)
3. ✅ Implementar UI para cenário B (motorista diferente)
4. ✅ Adicionar navegação para movimento anterior

### Fase 2: Integração com Entry Form (Prioridade Alta)

1. ✅ Atualizar `entry-form.tsx` para capturar resposta completa
2. ✅ Adicionar estado para gerenciar warning
3. ✅ Integrar modal de warning
4. ✅ Testar fluxo completo

### Fase 3: Hook para Fechar Movimento (Prioridade Média)

1. ⚠️ Verificar se API tem endpoint para fechar movimento anterior
2. ✅ Criar hook `useClosePreviousMovement`
3. ✅ Integrar com modal de warning
4. ✅ Adicionar loading states e tratamento de erros

### Fase 4: Melhorias de UX (Prioridade Baixa)

1. ⚠️ Adicionar indicador visual no dashboard para saídas parciais
2. ⚠️ Melhorar mensagens de toast
3. ⚠️ Adicionar tooltips explicativos
4. ⚠️ Adicionar histórico de ações (quando movimento foi fechado automaticamente)

---

## 📝 Detalhamento Técnico

### Componente: VehicleAbandonedWarningModal

**Estrutura**:
```tsx
<Dialog>
  <DialogContent>
    {isSameDriver ? (
      // Cenário A: Mesmo Motorista
      <SuccessAlert>
        <CheckCircle />
        <Title>Motorista Retornou</Title>
        <Description>
          O motorista {currentDriverName} retornou após o almoço.
          O movimento anterior foi fechado automaticamente.
        </Description>
        <Actions>
          <Button onClick={handleViewPrevious}>Ver Movimento Anterior</Button>
          <Button onClick={handleContinue}>Continuar</Button>
        </Actions>
      </SuccessAlert>
    ) : (
      // Cenário B: Motorista Diferente
      <WarningAlert>
        <AlertTriangle />
        <Title>ATENÇÃO: Veículo estava com outro motorista!</Title>
        <Description>
          <Info>
            <strong>Motorista anterior:</strong> {previousDriverName}
            <strong>Motorista atual:</strong> {currentDriverName}
            <strong>Veículo:</strong> {existingVehiclePlate}
          </Info>
          <Actions>
            <Button onClick={handleClosePrevious} variant="destructive">
              Fechar Movimento Anterior Agora
            </Button>
            <Button onClick={handleViewPrevious} variant="outline">
              Ver Movimento Anterior
            </Button>
            <Button onClick={handleContinue} variant="ghost">
              Continuar sem fechar
            </Button>
          </Actions>
        </Description>
      </WarningAlert>
    )}
  </DialogContent>
</Dialog>
```

### Integração com Entry Form

**Ordem de execução**:
1. Usuário preenche formulário de entrada
2. Submete formulário
3. API retorna resposta com `vehicleStayOpenWarning`
4. Se `vehicleStayOpenWarning = true`:
   - Não fechar modal de entrada ainda
   - Mostrar modal de warning
   - Aguardar ação do usuário
5. Se `vehicleStayOpenWarning = false`:
   - Fechar modal normalmente
   - Mostrar toast de sucesso

### Tratamento de Erros

**Cenários**:
1. **Erro ao fechar movimento anterior**:
   - Mostrar toast de erro
   - Manter modal aberto
   - Permitir tentar novamente

2. **Erro ao buscar movimento anterior**:
   - Mostrar mensagem genérica
   - Oferecer ID do movimento para busca manual

3. **Timeout na requisição**:
   - Mostrar mensagem de timeout
   - Permitir retry

---

## 🎨 Design e UX

### Cores e Ícones

**Cenário A (Mesmo Motorista)**:
- ✅ Cor: Verde (`bg-green-50`, `text-green-700`)
- ✅ Ícone: `CheckCircle` ou `UserCheck`
- ✅ Tom: Informativo e positivo

**Cenário B (Motorista Diferente)**:
- ⚠️ Cor: Amarelo/Laranja (`bg-yellow-50`, `text-yellow-700`) ou Vermelho (`bg-red-50`, `text-red-700`)
- ⚠️ Ícone: `AlertTriangle` ou `AlertCircle`
- ⚠️ Tom: Alerta e requer atenção

### Mensagens

**Cenário A**:
```
✅ Motorista Retornou

O motorista João Silva retornou após o almoço.
O movimento anterior foi fechado automaticamente.

[Ver Movimento Anterior] [Continuar]
```

**Cenário B**:
```
⚠️ ATENÇÃO: Veículo estava com outro motorista!

Veículo: ABC1234
Motorista anterior: João Silva
Motorista atual: Maria Santos

Ação necessária:
1. Verificar se o motorista anterior autorizou a retirada
2. Fazer saída completa do movimento anterior (com NF, lacre, etc)
3. Ou confirmar que o veículo foi transferido corretamente

[Fechar Movimento Anterior Agora] [Ver Movimento Anterior] [Continuar sem fechar]
```

---

## 🧪 Casos de Teste

### Teste 1: Saída Parcial
- [ ] Registrar entrada com veículo
- [ ] Registrar saída parcial (PARTIAL_EXIT)
- [ ] Verificar que `vehicleStayOpen = true`
- [ ] Verificar que movimento aparece no pátio ativo
- [ ] Verificar que StatusBadge mostra "Saída Parcial"

### Teste 2: Retorno - Mesmo Motorista
- [ ] Ter movimento com saída parcial
- [ ] Registrar entrada com mesmo CPF e mesma placa
- [ ] Verificar que modal de warning aparece
- [ ] Verificar que `isSameDriver = true`
- [ ] Verificar que movimento anterior foi fechado automaticamente
- [ ] Clicar em "Ver Movimento Anterior" e verificar navegação
- [ ] Clicar em "Continuar" e verificar que modal fecha

### Teste 3: Retorno - Motorista Diferente
- [ ] Ter movimento com saída parcial
- [ ] Registrar entrada com CPF diferente e mesma placa
- [ ] Verificar que modal de warning aparece
- [ ] Verificar que `isSameDriver = false`
- [ ] Verificar que movimento anterior NÃO foi fechado
- [ ] Clicar em "Fechar Movimento Anterior Agora"
- [ ] Verificar que movimento anterior foi fechado
- [ ] Verificar que modal fecha após ação

### Teste 4: Fluxo Normal (Sem Warning)
- [ ] Registrar entrada sem veículo abandonado
- [ ] Verificar que modal de warning NÃO aparece
- [ ] Verificar que toast de sucesso aparece
- [ ] Verificar que modal de entrada fecha

---

## 📋 Checklist de Implementação

### Fase 1: Componente de Warning
- [ ] Criar arquivo `components/forms/vehicle-abandoned-warning-modal.tsx`
- [ ] Implementar interface TypeScript
- [ ] Implementar UI para cenário A (mesmo motorista)
- [ ] Implementar UI para cenário B (motorista diferente)
- [ ] Adicionar navegação para movimento anterior
- [ ] Adicionar estilos e ícones
- [ ] Testar responsividade

### Fase 2: Integração com Entry Form
- [ ] Atualizar `entry-form.tsx` para capturar resposta completa
- [ ] Adicionar estado `vehicleAbandonedData`
- [ ] Adicionar estado `showVehicleWarning`
- [ ] Integrar modal de warning
- [ ] Atualizar lógica de `onSubmit`
- [ ] Atualizar `handleClose` para limpar estados
- [ ] Testar fluxo completo

### Fase 3: Hook para Fechar Movimento
- [ ] Verificar endpoint da API (se existe)
- [ ] Criar hook `useClosePreviousMovement` em `hooks/use-movements.ts`
- [ ] Integrar hook com modal de warning
- [ ] Adicionar loading states
- [ ] Adicionar tratamento de erros
- [ ] Testar cenário de sucesso
- [ ] Testar cenário de erro

### Fase 4: Melhorias e Polimento
- [ ] Adicionar indicadores visuais no dashboard
- [ ] Melhorar mensagens de toast
- [ ] Adicionar tooltips explicativos
- [ ] Adicionar testes E2E (se aplicável)
- [ ] Documentar comportamento para usuários
- [ ] Revisar acessibilidade (ARIA labels, etc)

---

## 🔍 Pontos de Atenção

1. **API Endpoint**: Verificar se existe endpoint para fechar movimento anterior. Se não existir, pode ser necessário:
   - Criar endpoint específico: `POST /movements/:id/close-vehicle`
   - Ou usar endpoint existente com parâmetro especial
   - Ou atualizar diretamente via PATCH

2. **Navegação**: Quando usuário clica em "Ver Movimento Anterior":
   - Fechar modal de warning
   - Fechar modal de entrada
   - Abrir modal de detalhes do movimento anterior
   - Ou navegar para histórico com filtro aplicado

3. **Estado do Modal**: Quando modal de warning está aberto:
   - Modal de entrada deve permanecer aberto (não fechar)
   - Ou fechar modal de entrada e manter apenas warning
   - Decisão de UX: qual é melhor?

4. **Cache/Refetch**: Após fechar movimento anterior:
   - Invalidar queries do React Query
   - Refetch do pátio ativo
   - Refetch do histórico (se necessário)

5. **Acessibilidade**:
   - Adicionar ARIA labels apropriados
   - Garantir navegação por teclado
   - Garantir leitura por screen readers
   - Adicionar foco apropriado

---

## 📚 Referências

- Documentação da API: `docs/API.md`
- Lógica de Saída Parcial: `docs/LOGICA_SAIDA_PARCIAL.md`
- Collection Postman: `docs/Portaria-API.postman_collection.json`

---

## 🚀 Próximos Passos

1. **Revisar este plano** com a equipe
2. **Confirmar endpoint da API** para fechar movimento anterior
3. **Decidir sobre navegação** (como abrir movimento anterior)
4. **Iniciar Fase 1** (Componente de Warning)
5. **Testar incrementalmente** cada fase

---

## 💡 Sugestões Futuras

1. **Notificações**: Enviar notificação quando movimento anterior precisa ser fechado
2. **Relatórios**: Relatório de movimentos com saída parcial não resolvidos
3. **Dashboard Widget**: Widget mostrando movimentos pendentes de fechamento
4. **Automação**: Opção para fechar automaticamente após X horas (configurável)
