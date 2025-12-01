"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", data);
      const { access_token, user } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-elevated bg-white dark:bg-slate-800">
        <CardHeader className="space-y-2 text-center pb-4 sm:pb-6">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-2">
            <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sistema de Portaria
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            aria-label="Formulário de login"
          >
            {error && (
              <Alert
                variant="destructive"
                className="border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                autoComplete="username"
                aria-label="Campo de usuário"
                aria-required="true"
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby={errors.username ? "username-error" : undefined}
                {...register("username")}
                disabled={isLoading}
                className={errors.username ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
              />
              {errors.username && (
                <p
                  id="username-error"
                  className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1"
                  role="alert"
                >
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                aria-label="Campo de senha"
                aria-required="true"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
                disabled={isLoading}
                className={errors.password ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1"
                  role="alert"
                >
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              aria-label={isLoading ? "Fazendo login..." : "Entrar no sistema"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
