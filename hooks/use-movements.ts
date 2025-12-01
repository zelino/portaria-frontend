import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Buscar lista do pátio
export function useActivePatio() {
  return useQuery({
    queryKey: ["movements", "active"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/patio");
      return data;
    },
    refetchInterval: 30000, // Atualiza a cada 30s automaticamente
  });
}

// Buscar estatísticas
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      return data;
    },
    refetchInterval: 30000,
  });
}

// Buscar pessoa por CPF
export function usePersonByCpf(cpf: string | null) {
  return useQuery({
    queryKey: ["persons", "cpf", cpf],
    queryFn: async () => {
      if (!cpf) return null;
      const { data } = await api.get(`/persons/cpf/${cpf}`);
      return data;
    },
    enabled: !!cpf && cpf.length >= 11,
  });
}

// Buscar veículo por placa
export function useVehicleByPlate(plate: string | null) {
  return useQuery({
    queryKey: ["vehicles", "plate", plate],
    queryFn: async () => {
      if (!plate) return null;
      const { data } = await api.get(`/vehicles/plate/${plate}`);
      return data;
    },
    enabled: !!plate && plate.length >= 6,
  });
}

// Registrar Entrada
export function useCreateEntrance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.post("/movements/entrance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Registrar Saída
export function useCreateExit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.post("/movements/exit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Buscar histórico de movimentações com filtros
export interface MovementsHistoryFilters {
  startDate?: string;
  endDate?: string;
  cpf?: string;
  plate?: string;
  personType?: "EMPLOYEE" | "VISITOR" | "DRIVER";
  vehicleType?: "CAR" | "TRUCK" | "MOTORCYCLE" | "OTHER";
  invoiceNumber?: string;
  status?: "active" | "closed";
  page?: number;
  limit?: number;
}

export function useMovementsHistory(filters: MovementsHistoryFilters = {}) {
  return useQuery({
    queryKey: ["movements", "history", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.cpf) params.append("cpf", filters.cpf);
      if (filters.plate) params.append("plate", filters.plate);
      if (filters.personType) params.append("personType", filters.personType);
      if (filters.vehicleType) params.append("vehicleType", filters.vehicleType);
      if (filters.invoiceNumber) params.append("invoiceNumber", filters.invoiceNumber);
      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const { data } = await api.get(`/movements/history?${params.toString()}`);
      return data;
    },
  });
}

// Buscar movimento por ID
export function useMovementById(movementId: string | null) {
  return useQuery({
    queryKey: ["movements", movementId],
    queryFn: async () => {
      if (!movementId) return null;
      const { data } = await api.get(`/movements/${movementId}`);
      return data;
    },
    enabled: !!movementId,
  });
}

// Buscar ciclo completo por ID
export function useCycleById(cycleId: string | null) {
  return useQuery({
    queryKey: ["movements", "cycle", cycleId],
    queryFn: async () => {
      if (!cycleId) return null;
      const { data } = await api.get(`/movements/cycle/${cycleId}`);
      return data;
    },
    enabled: !!cycleId,
  });
}
