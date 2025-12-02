"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteMovement } from "@/hooks/use-movements";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  Clock,
  FileText,
  History,
  Loader2,
  RefreshCcw,
  Search,
  Trash2,
  Truck,
  User,
  UserCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { data: user } = useAuth();
  const deleteMovement = useDeleteMovement();
  const { toast } = useToast();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<string | null>(null);
  const [detailedMovements, setDetailedMovements] = useState<any[]>(cycle?.movements || []);
  const isAdmin = user?.role === "ADMIN";

  const handleDeleteClick = (movementId: string) => {
    setMovementToDelete(movementId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!movementToDelete) return;

    try {
      await deleteMovement.mutateAsync(movementToDelete);
      toast({
        title: "Sucesso",
        description: "Movimento excluído com sucesso",
      });
      setShowDeleteDialog(false);
      setMovementToDelete(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao excluir movimento",
        variant: "destructive",
      });
    }
  };

  if (!cycle) return null;

  // Enriquecer movimentos com histórico quando abrirmos o modal
  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      if (!open || !cycle?.movements) {
        setDetailedMovements(cycle?.movements || []);
        return;
      }

      const needHistory = cycle.movements.filter((m: any) => !m.history || m.history.length === 0);
      if (needHistory.length === 0) {
        setDetailedMovements(cycle.movements);
        return;
      }

      try {
        const responses = await Promise.all(
          needHistory.map((m: any) => api.get(`/movements/${m.id}`))
        );
        const map = new Map<string, any>();
        cycle.movements.forEach((m: any) => map.set(m.id, m));
        responses.forEach((res: any) => {
          if (res?.data?.id) {
            map.set(res.data.id, { ...map.get(res.data.id), ...res.data });
          }
        });
        if (isMounted) {
          setDetailedMovements(Array.from(map.values()));
        }
      } catch (error) {
        setDetailedMovements(cycle.movements);
      }
    }
    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [cycle, open]);

  const buildEvents = (movement: any) => {
    // Priorizar o campo 'history' do backend
    if (movement?.history && Array.isArray(movement.history) && movement.history.length > 0) {
      return movement.history;
    }

    // Fallback para compatibilidade: campo 'events' antigo
    if (movement?.events && Array.isArray(movement.events) && movement.events.length > 0) {
      return movement.events;
    }

    // Fallback: sintetiza eventos básicos a partir dos campos principais
    const events: any[] = [];
    if (movement.enteredAt) {
      events.push({
        action: "ENTRY",
        performedAt: movement.enteredAt,
        person: movement.person,
        vehicle: movement.vehicle,
      });
    }

    const isPartial = movement.exitType === "PARTIAL_EXIT" || (movement.vehicleStayOpen && movement.exitedAt);
    if (isPartial && movement.exitedAt) {
      events.push({
        action: "PARTIAL_EXIT",
        performedAt: movement.exitedAt,
        exitReason: movement.exitReason,
        person: movement.person,
        vehicle: movement.vehicle,
      });
    }

    const isFullExit =
      movement.exitType === "FULL_EXIT" ||
      movement.exitType === "FULL_EXIT_WITH_INVOICE" ||
      (!movement.vehicleStayOpen && movement.exitedAt);
    if (isFullExit && movement.exitedAt) {
      events.push({
        action: "FULL_EXIT",
        performedAt: movement.exitedAt,
        invoiceNumbers: movement.invoiceNumbers,
        sealNumber: movement.sealNumber,
        person: movement.person,
        vehicle: movement.vehicle,
        exitReason: movement.exitReason,
      });
    }

    return events;
  };

  const renderEventCard = (event: any, idx: number) => {
    const action = event.action || event.type;
    const ts = event.performedAt || event.createdAt;
    const personName = event.personNameSnapshot || event.person?.name || cycle.person?.name;
    const vehiclePlate = event.vehiclePlateSnapshot || event.vehicle?.plate || cycle.vehicle?.plate;
    const performedBy = event.performedBy?.name || event.performedBy?.username;

    const getLabel = () => {
      switch (action) {
        case "ENTRY":
          return "Entrada";
        case "PARTIAL_EXIT":
          return "Saída Parcial";
        case "RETURN":
          return "Retorno de Saída Parcial";
        case "DRIVER_CHANGE":
          return "Troca de Motorista";
        case "FULL_EXIT":
          return "Saída Completa";
        case "FULL_EXIT_WITH_INVOICE":
          return "Saída Completa c/ NF";
        default:
          return action || "Evento";
      }
    };

    const getIcon = () => {
      switch (action) {
        case "ENTRY":
          return <ArrowRight className="h-4 w-4 text-green-600" />;
        case "RETURN":
          return <RefreshCcw className="h-4 w-4 text-green-600" />;
        case "DRIVER_CHANGE":
          return <User className="h-4 w-4 text-blue-600" />;
        case "PARTIAL_EXIT":
          return <Clock className="h-4 w-4 text-yellow-600" />;
        case "FULL_EXIT":
        case "FULL_EXIT_WITH_INVOICE":
          return <ArrowLeft className="h-4 w-4 text-red-600" />;
        default:
          return <History className="h-4 w-4 text-slate-500" />;
      }
    };

    return (
      <div
        key={`${action}-${idx}-${ts || ""}`}
        className="flex items-start gap-3 p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40"
      >
        <div className="mt-0.5">{getIcon()}</div>
        <div className="space-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {getLabel()}
            </span>
            {ts && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {format(new Date(ts), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>
          {personName && (
            <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{personName}</span>
            </div>
          )}
          {vehiclePlate && (
            <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              <span>{vehiclePlate}</span>
            </div>
          )}
          {performedBy && (
            <div className="text-slate-600 dark:text-slate-400 text-xs flex items-center gap-1">
              <UserCircle className="h-3 w-3" />
              <span>Por: {performedBy}</span>
            </div>
          )}
          {event.exitReason && (
            <div className="text-slate-700 dark:text-slate-300">Motivo: {event.exitReason}</div>
          )}
          {event.invoiceNumbers && event.invoiceNumbers.length > 0 && (
            <div className="text-slate-700 dark:text-slate-300">
              NFs: {event.invoiceNumbers.join(", ")}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
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
          {/* Alerta sobre ciclos separados quando há troca de motorista */}
          {cycle.vehicle && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                    <p className="font-medium mb-1">ℹ️ Sobre Ciclos e Trocas de Motorista</p>
                    <p className="text-xs mb-2">
                      Um ciclo agrupa movimentações de <strong>uma pessoa específica com um veículo</strong>.
                      Quando há troca de motorista, um novo ciclo é criado para o novo motorista.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/history?plate=${cycle.vehicle.plate}`);
                }}
              >
                <Search className="h-4 w-4 mr-2" />
                Ver Todos os Ciclos da Placa {cycle.vehicle.plate}
              </Button>
            </div>
          )}

          {/* Resumo Consolidado do Ciclo */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Movimentos</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {detailedMovements.length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Saídas Parciais</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {detailedMovements.reduce((acc, m) => {
                  const partialExits = m.history?.filter((e: any) => e.action === 'PARTIAL_EXIT').length || 0;
                  return acc + partialExits;
                }, 0)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Trocas</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {detailedMovements.reduce((acc, m) => {
                  const driverChanges = m.history?.filter((e: any) => e.action === 'DRIVER_CHANGE').length || 0;
                  return acc + driverChanges;
                }, 0)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Com NF</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {detailedMovements.filter(m => m.exitType === 'FULL_EXIT_WITH_INVOICE' || (m.invoiceNumbers && m.invoiceNumbers.length > 0)).length}
              </p>
            </div>
          </div>

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
                  <span className="text-slate-500 dark:text-slate-400">Documento:</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {cycle.person?.document || cycle.person?.cpf || "-"}
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
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-lg">
                      {cycle.vehicle.plate}
                    </p>
                  </div>
                  {cycle.vehicle.model && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Modelo:</span>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {cycle.vehicle.model}
                      </p>
                    </div>
                  )}
                  {cycle.vehicle.type && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Tipo:</span>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {cycle.vehicle.type === "CAR" && "Carro"}
                        {cycle.vehicle.type === "TRUCK" && "Caminhão"}
                        {cycle.vehicle.type === "MOTORCYCLE" && "Moto"}
                        {cycle.vehicle.type === "OTHER" && "Outros"}
                      </p>
                    </div>
                  )}
                  {cycle.trailerPlate && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Carreta:</span>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {cycle.trailerPlate}
                      </p>
                    </div>
                  )}
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
              {detailedMovements?.map((movement: any, index: number) => (
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
                    {isAdmin && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(movement.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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

                  {/* Timeline de eventos da movimentação */}
                  {buildEvents(movement).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Histórico da Movimentação
                      </h4>
                      <div className="space-y-2">
                        {buildEvents(movement)
                          .slice()
                          .sort(
                            (a: any, b: any) =>
                              new Date(b.performedAt || b.createdAt || 0).getTime() -
                              new Date(a.performedAt || a.createdAt || 0).getTime()
                          )
                          .map((event: any, idx: number) => renderEventCard(event, idx))}
                      </div>
                    </div>
                  )}

                  {/* Fotos do Movimento */}
                  {(movement.person?.photoUrl || movement.exitPhotos?.length > 0 || movement.photos?.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                        <Camera className="h-4 w-4" />
                        Fotos
                      </h4>
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {movement.person?.photoUrl && (
                          <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Foto de Entrada</p>
                            <img
                              src={movement.person.photoUrl}
                              alt="Foto de entrada"
                              className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                        )}
                        {(movement.exitPhotos || movement.photos || [])?.map((photo: string, photoIndex: number) => (
                          <div key={photoIndex}>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                              Foto de Saída {photoIndex + 1}
                              {movement.exitPhotos && movement.exitPhotos.length > 1 && (
                                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                  (Lacre, NF ou Veículo)
                                </span>
                              )}
                            </p>
                            <img
                              src={photo}
                              alt={`Foto de saída ${photoIndex + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Movimento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este movimento do ciclo? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMovement.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMovement.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
