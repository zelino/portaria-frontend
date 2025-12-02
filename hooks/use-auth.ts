import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface LoginData {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "OPERATOR";
}

interface LoginResponse {
  access_token: string;
  user: User;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginData): Promise<LoginResponse> => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      queryClient.setQueryData(["auth", "user"], data.user);
    },
  });
}

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      if (typeof window === "undefined") return null;

      const token = localStorage.getItem("access_token");
      if (!token) return null;

      try {
        const { data } = await api.get("/auth/me");
        return data;
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        return null;
      }
    },
    initialData: () => {
      if (typeof window === "undefined") return null;
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    queryClient.setQueryData(["auth", "user"], null);
    queryClient.clear();
  };
}

interface RegisterUserData {
  username: string;
  name: string;
  password: string;
  role?: "ADMIN" | "OPERATOR";
}

interface RegisterUserResponse {
  access_token: string;
  user: User;
}

// Registrar novo usuário (ADMIN apenas)
export function useRegisterUser() {
  return useMutation({
    mutationFn: async (data: RegisterUserData): Promise<RegisterUserResponse> => {
      const response = await api.post("/auth/register", data);
      return response.data;
    },
  });
}

// Deletar pessoa (ADMIN apenas)
export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personId: string) => {
      const { data } = await api.delete(`/persons/${personId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
    },
  });
}
