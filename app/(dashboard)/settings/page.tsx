"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, Users } from "lucide-react";
import { RegisterUserDialog } from "@/components/forms/register-user-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { data: user } = useAuth();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <>
        <Header title="Configurações" />
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-full">
          <Card className="border-slate-200 dark:border-slate-800 shadow-subtle bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <Alert className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Configurações" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-full">
        {/* Card de Gerenciamento de Usuários */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-subtle bg-white dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription className="mt-1">
                  Cadastre e gerencie usuários do sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Cadastrar Novo Usuário
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Crie uma nova conta de usuário no sistema. Você pode definir se o usuário será um Operador ou Administrador.
                  </p>
                  <Button
                    onClick={() => setRegisterDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Cadastrar Usuário
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold">Permissões de Administrador</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Cadastrar novos usuários</li>
                    <li>Excluir movimentações</li>
                    <li>Excluir cadastros de pessoas</li>
                    <li>Acesso completo ao sistema</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Cadastro de Usuário */}
      <RegisterUserDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
      />
    </>
  );
}
