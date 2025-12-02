"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    Truck,
    User,
} from "lucide-react";

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
  const handleViewPrevious = () => {
    onOpenChange(false);
    onViewPreviousMovement?.(data.previousMovementId);
  };

  const handleContinue = () => {
    onOpenChange(false);
    onContinue?.();
  };

  if (data.isSameDriver) {
    // Cenário A: Mesmo Motorista Retornou
    // O backend JÁ fechou o movimento anterior automaticamente
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
                  {data.previousDriverName || "O motorista"} retornou após a saída parcial.
                </p>
                <p>
                  O movimento anterior foi fechado automaticamente pelo sistema.
                </p>
                {data.existingVehiclePlate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4" />
                    <span className="font-semibold">
                      Veículo: {data.existingVehiclePlate}
                    </span>
                  </div>
                )}
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
  // O backend FECHA o ciclo anterior e CRIA um NOVO ciclo para o novo motorista
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-5 w-5" />
            ATENÇÃO: Motorista Diferente Detectado
          </DialogTitle>
          <DialogDescription>
            Um motorista diferente está tentando pegar o veículo
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">
                  Um motorista diferente está tentando pegar o veículo que estava com outro motorista.
                </p>
                <p className="text-sm">
                  O sistema fechou o ciclo do motorista anterior e criou um novo ciclo para este motorista.
                </p>
              </div>

              <div className="space-y-2 text-sm bg-white/50 dark:bg-slate-800/50 p-3 rounded border border-yellow-200 dark:border-yellow-700">
                {data.existingVehiclePlate && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>
                      <strong>Veículo:</strong> {data.existingVehiclePlate}
                    </span>
                  </div>
                )}
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
                <p className="font-medium mb-2">⚠️ Confirme com o motorista:</p>
                <p className="text-sm">
                  Valide que o novo motorista está autorizado a retirar o veículo. O histórico foi atualizado com DRIVER_CHANGE.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button onClick={handleContinue}>
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
