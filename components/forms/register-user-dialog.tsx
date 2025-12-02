"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { useRegisterUser } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const registerUserSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório").min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "OPERATOR"]).default("OPERATOR"),
});

type RegisterUserForm = z.infer<typeof registerUserSchema>;

interface RegisterUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterUserDialog({
  open,
  onOpenChange,
}: RegisterUserDialogProps) {
  const { toast } = useToast();
  const registerUser = useRegisterUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterUserForm>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      role: "OPERATOR",
    },
  });

  const role = watch("role");

  const onSubmit = async (data: RegisterUserForm) => {
    try {
      await registerUser.mutateAsync(data);
      toast({
        title: "Sucesso",
        description: "Usuário cadastrado com sucesso",
      });
      handleClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao cadastrar usuário",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset({
      role: "OPERATOR",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Cadastrar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Crie uma nova conta de usuário no sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Alert className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
              Apenas usuários com permissão de ADMIN podem cadastrar novos usuários.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome de Usuário <span className="text-red-500" aria-label="obrigatório">*</span>
            </Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="ex: joao.silva"
              aria-label="Campo de nome de usuário"
              aria-required="true"
              aria-invalid={errors.username ? "true" : "false"}
              className={errors.username ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome Completo <span className="text-red-500" aria-label="obrigatório">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="ex: João Silva"
              aria-label="Campo de nome completo"
              aria-required="true"
              aria-invalid={errors.name ? "true" : "false"}
              className={errors.name ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Senha <span className="text-red-500" aria-label="obrigatório">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Mínimo 6 caracteres"
              aria-label="Campo de senha"
              aria-required="true"
              aria-invalid={errors.password ? "true" : "false"}
              className={errors.password ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Permissão <span className="text-red-500" aria-label="obrigatório">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(v) => setValue("role", v as "ADMIN" | "OPERATOR", { shouldValidate: true })}
              aria-label="Tipo de permissão"
              aria-required="true"
            >
              <SelectTrigger
                aria-label="Selecione o tipo de permissão"
                className="h-11 border-2 border-slate-300 dark:border-slate-600"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPERATOR">Operador</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operador: apenas registro de entrada/saída. Administrador: acesso completo.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-slate-200 dark:border-slate-700 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={registerUser.isPending}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {registerUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar Usuário
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
