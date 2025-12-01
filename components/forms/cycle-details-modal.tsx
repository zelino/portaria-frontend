"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  Truck,
  Building,
  FileText,
  Camera,
  UserCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface CycleDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: any;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CycleDetailsModal({
  open,
  onOpenChange,
  cycle,
}: CycleDetailsModalProps) {
  if (!cycle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Detalhes do Ciclo de Movimentação
          </DialogTitle>
          <DialogDescription>
            Todas as movimentações de {cycle.person?.name || "N/A"} com o veículo{" "}
            {cycle.vehicle?.plate || "sem veículo"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status e Informações Principais do Ciclo */}
          <div className="flex items-start justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <StatusBadge cycleStatus={cycle.status} />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {cycle.movements?.length || 0} movimentação(ões) neste ciclo
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Primeira entrada:{" "}
                  {format(new Date(cycle.firstEntryAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              {cycle.lastExitAt && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Última saída:{" "}
                    {format(new Date(cycle.lastExitAt), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Informações da Pessoa e Veículo */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Dados Pessoais */}
            <div className="space-y-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Nome:</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {cycle.person?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">CPF:</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {cycle.person?.cpf || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Tipo:</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {cycle.person?.type === "EMPLOYEE" && "Funcionário"}
                    {cycle.person?.type === "VISITOR" && "Visitante"}
                    {cycle.person?.type === "DRIVER" && "Motorista"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dados do Veículo */}
            {cycle.vehicle && (
              <div className="space-y-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Dados do Veículo
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Placa:</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {cycle.vehicle.plate}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Tipo:</span>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {cycle.vehicle.type === "CAR" && "Carro"}
                      {cycle.vehicle.type === "TRUCK" && "Caminhão"}
                      {cycle.vehicle.type === "MOTORCYCLE" && "Moto"}
                      {cycle.vehicle.type === "OTHER" && "Outros"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Movimentações do Ciclo */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Movimentações do Ciclo
            </h3>
            <div className="space-y-3">
              {cycle.movements?.map((movement: any, index: number) => (
                <div
                  key={movement.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge exitType={movement.exitType} />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Movimentação {index + 1} de {cycle.movements.length}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                        <ArrowRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">Entrada</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {format(new Date(movement.enteredAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                      {movement.createdBy && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Registrado por: {movement.createdBy.name}
                        </p>
                      )}
                    </div>

                    {movement.exitedAt && (
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                          <ArrowLeft className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="font-medium">Saída</span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {format(new Date(movement.exitedAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                        {movement.closedBy && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Registrado por: {movement.closedBy.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Informações específicas da saída */}
                  {movement.exitedAt && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      {movement.exitType === "PARTIAL_EXIT" && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                            <Clock className="h-4 w-4" />
                            <span>Saída Parcial - Veículo permaneceu no pátio</span>
                          </div>
                          {movement.exitReason && (
                            <div className="text-sm text-slate-600 dark:text-slate-400 pl-6">
                              <span className="font-medium">Motivo:</span> {movement.exitReason}
                            </div>
                          )}
                        </div>
                      )}
                      {movement.exitReason && movement.exitType !== "PARTIAL_EXIT" && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Motivo da saída:</span> {movement.exitReason}
                        </div>
                      )}
                      {movement.invoiceNumbers && movement.invoiceNumbers.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Notas Fiscais:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {movement.invoiceNumbers.map((nf: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800"
                              >
                                {nf}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {movement.sealNumber && (
                        <div className="mt-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Lacre:{" "}
                          </span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {movement.sealNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
