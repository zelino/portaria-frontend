"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertTriangle,
  User,
  Truck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

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
  onViewPreviousMovement?: (movementId: string) => void;
  onContinue?: () => void;
}

export function VehicleAbandonedWarningModal({
  open,
  onOpenChange,
  data,
  onViewPreviousMovement,
  onContinue,
}: VehicleAbandonedWarningModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleClosePrevious = async () => {
    setIsClosing(true);
    try {
      // Tentar fechar o movimento anterior
      // Primeiro tenta PATCH (se API suportar)
      try {
        await api.patch(`/movements/${data.previousMovementId}`, {
          vehicleStayOpen: false,
        });
      } catch (patchError: any) {
        // Se PATCH não funcionar, tenta usar endpoint de saída com tipo especial
        // ou informa que precisa fechar manualmente
        if (patchError.response?.status === 404 || patchError.response?.status === 405) {
          // API não suporta PATCH, precisa fechar via saída completa
          toast({
            title: "Ação Necessária",
            description:
              "Por favor, feche o movimento anterior manualmente através da opção 'Saída Completa' no histórico ou pátio ativo.",
            variant: "default",
          });
          // Não fecha o modal para que o usuário possa ver o movimento anterior
          setIsClosing(false);
          return;
        }
        throw patchError;
      }

      // Invalidar queries para atualizar dados
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast({
        title: "Sucesso",
        description: "Movimento anterior foi fechado com sucesso",
      });

      // Fechar modal e continuar
      onOpenChange(false);
      onContinue?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Erro ao fechar movimento anterior. Por favor, feche manualmente através da opção 'Saída Completa'.",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleViewPrevious = () => {
    onViewPreviousMovement?.(data.previousMovementId);
    onOpenChange(false);
  };

  const handleContinue = () => {
    onOpenChange(false);
    onContinue?.();
  };

  if (data.isSameDriver) {
    // Cenário A: Mesmo Motorista Retornou
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Motorista Retornou
            </DialogTitle>
            <DialogDescription>
              O motorista retornou após a saída parcial
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="space-y-3">
                <p className="font-medium">
                  O motorista retornou após a saída parcial.
                </p>
                <p>
                  O movimento anterior foi fechado automaticamente pelo sistema.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4" />
                  <span className="font-semibold">
                    Veículo: {data.existingVehiclePlate}
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 pt-4">
            {onViewPreviousMovement && (
              <Button
                variant="outline"
                onClick={handleViewPrevious}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Movimento Anterior
              </Button>
            )}
            <Button onClick={handleContinue}>Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Cenário B: Motorista Diferente
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-5 w-5" />
            ATENÇÃO: Veículo estava com outro motorista!
          </DialogTitle>
          <DialogDescription>
            Ação necessária para fechar o movimento anterior
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">
                  Um motorista diferente está retirando o veículo que estava com
                  outro motorista.
                </p>
              </div>

              <div className="space-y-2 text-sm bg-white/50 dark:bg-slate-800/50 p-3 rounded border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>
                    <strong>Veículo:</strong> {data.existingVehiclePlate}
                  </span>
                </div>
                {data.previousDriverName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      <strong>Motorista anterior:</strong>{" "}
                      {data.previousDriverName}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 p-3 rounded border border-yellow-200 dark:border-yellow-700">
                <p className="font-medium mb-2">Ação necessária:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    Verificar se o motorista anterior autorizou a retirada
                  </li>
                  <li>
                    Fazer saída completa do movimento anterior (com NF, lacre,
                    etc)
                  </li>
                  <li>Ou confirmar que o veículo foi transferido corretamente</li>
                </ol>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          {onViewPreviousMovement && (
            <Button
              variant="outline"
              onClick={handleViewPrevious}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Movimento Anterior
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleClosePrevious}
            disabled={isClosing}
            className="flex items-center gap-2"
          >
            {isClosing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fechando...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Fechar Movimento Anterior Agora
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={handleContinue}>
            Continuar sem fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
