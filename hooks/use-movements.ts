import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Buscar lista do pátio com paginação
export interface PatioFilters {
  page?: number;
  limit?: number;
}

export function useActivePatio(filters: PatioFilters = {}) {
  return useQuery({
    queryKey: ["movements", "active", filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());

        const { data } = await api.get(`/dashboard/patio?${params.toString()}`);
        // Retornar estrutura com data e pagination
        return {
          data: Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []),
          pagination: data?.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        };
      } catch (error) {
        console.error("Erro ao buscar pátio:", error);
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        };
      }
    },
    refetchInterval: 30000, // Atualiza a cada 30s automaticamente
  });
}

// Buscar estatísticas
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/dashboard/stats");
        return data || {};
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return {};
      }
    },
    refetchInterval: 30000,
  });
}

// Buscar pessoa por documento
export function usePersonByDocument(document: string | null) {
  return useQuery({
    queryKey: ["persons", "document", document],
    queryFn: async () => {
      if (!document) return null;
      const { data } = await api.get(`/persons/document/${document}`);
      return data;
    },
    enabled: !!document && document.length > 0,
  });
}

// Alias para compatibilidade (deprecated - usar usePersonByDocument)
export function usePersonByCpf(document: string | null) {
  return usePersonByDocument(document);
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
    enabled: !!plate && plate.length > 0,
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
  document?: string;
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
      if (filters.document) params.append("document", filters.document);
      if (filters.plate) params.append("plate", filters.plate);
      if (filters.personType) params.append("personType", filters.personType);
      if (filters.vehicleType) params.append("vehicleType", filters.vehicleType);
      if (filters.invoiceNumber) params.append("invoiceNumber", filters.invoiceNumber);
      if (filters.status) params.append("status", filters.status);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const { data } = await api.get(`/movements/history?${params.toString()}`);
      // Garantir estrutura consistente com data e pagination
      return {
        data: Array.isArray(data?.data) ? data.data : [],
        pagination: data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
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

// Deletar movimento (ADMIN apenas)
export function useDeleteMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movementId: string) => {
      const { data } = await api.delete(`/movements/${movementId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
