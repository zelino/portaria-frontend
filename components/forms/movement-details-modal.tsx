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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useDeleteMovement, useMovementById } from "@/hooks/use-movements";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowRightCircle,
    Calendar,
    Camera,
    Clock,
    FileText,
    History,
    Loader2,
    LogOut,
    RefreshCcw,
    Trash2,
    Truck,
    User,
    UserCircle
} from "lucide-react";
import { useMemo, useState } from "react";

interface MovementDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: any;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MovementDetailsModal({
  open,
  onOpenChange,
  movement,
}: MovementDetailsModalProps) {
  const { data: user } = useAuth();
  const deleteMovement = useDeleteMovement();
  const { data: movementFromApi } = useMovementById(open ? movement?.id ?? null : null);
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const resolvedMovement = useMemo(() => movementFromApi || movement, [movementFromApi, movement]);

  const handleDelete = async () => {
    if (!resolvedMovement?.id) return;

    try {
      await deleteMovement.mutateAsync(resolvedMovement.id);
      toast({
        title: "Sucesso",
        description: "Movimento excluído com sucesso",
      });
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao excluir movimento",
        variant: "destructive",
      });
    }
  };

  if (!movement) return null;
  if (!resolvedMovement) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Detalhes da Movimentação
              </DialogTitle>
              <DialogDescription>
                Informações completas da movimentação
              </DialogDescription>
            </div>
            {isAdmin && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status e Informações Principais */}
          <div className="flex items-start justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={resolvedMovement.exitedAt ? "EXITED" : "IN_PATIO"}
                  vehicleStayOpen={resolvedMovement.vehicleStayOpen}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Entrada: {format(new Date(resolvedMovement.enteredAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              {resolvedMovement.exitedAt && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Saída: {format(new Date(resolvedMovement.exitedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Dados Pessoais */}
            <div className="space-y-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-700">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold text-lg">
                        {getInitials(resolvedMovement.person?.name || "N/A")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {resolvedMovement.person?.name || "N/A"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {resolvedMovement.person?.type === "EMPLOYEE" && "Funcionário"}
                        {resolvedMovement.person?.type === "VISITOR" && "Visitante"}
                        {resolvedMovement.person?.type === "DRIVER" && "Motorista"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Documento:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {resolvedMovement.person?.document || resolvedMovement.person?.cpf || "-"}
                      </span>
                    </div>
                  {resolvedMovement.person?.rg && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">RG:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {resolvedMovement.person.rg}
                      </span>
                    </div>
                  )}
                  {resolvedMovement.person?.company && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Empresa:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {resolvedMovement.person.company}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dados do Veículo */}
            {resolvedMovement.vehicle ? (
              <div className="space-y-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Dados do Veículo
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {resolvedMovement.vehicle.plate}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    {resolvedMovement.vehicle.model && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Modelo:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {resolvedMovement.vehicle.model}
                        </span>
                      </div>
                    )}
                    {resolvedMovement.vehicle.color && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Cor:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {resolvedMovement.vehicle.color}
                        </span>
                      </div>
                    )}
                    {resolvedMovement.vehicle.type && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Tipo:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {resolvedMovement.vehicle.type === "CAR" && "Carro"}
                          {resolvedMovement.vehicle.type === "TRUCK" && "Caminhão"}
                          {resolvedMovement.vehicle.type === "MOTORCYCLE" && "Moto"}
                          {resolvedMovement.vehicle.type === "OTHER" && "Outros"}
                        </span>
                      </div>
                    )}
                    {resolvedMovement.trailerPlate && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Carreta:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {resolvedMovement.trailerPlate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Pedestre
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Entrada sem veículo
                </p>
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="space-y-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informações Adicionais
            </h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 text-sm">
              {movement.reason && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Motivo: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resolvedMovement.reason}
                  </span>
                </div>
              )}
              {resolvedMovement.invoiceNumbers && resolvedMovement.invoiceNumbers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Notas Fiscais: </span>
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {resolvedMovement.invoiceNumbers.length} NF{resolvedMovement.invoiceNumbers.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resolvedMovement.invoiceNumbers.map((nf: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="font-mono text-xs">
                        {nf}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* Fallback para compatibilidade com dados antigos (invoiceNumber singular) */}
              {(!resolvedMovement.invoiceNumbers || resolvedMovement.invoiceNumbers.length === 0) && resolvedMovement.invoiceNumber && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">NF: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resolvedMovement.invoiceNumber}
                  </span>
                </div>
              )}
              {resolvedMovement.sealNumber && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Lacre: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resolvedMovement.sealNumber}
                  </span>
                </div>
              )}
              {resolvedMovement.exitReason && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Motivo da Saída: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resolvedMovement.exitReason}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-600 dark:text-slate-400">Permanência: </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatDistanceToNow(new Date(resolvedMovement.enteredAt), {
                    addSuffix: false,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Auditoria */}
          {(resolvedMovement.createdBy || resolvedMovement.closedBy) && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              {resolvedMovement.createdBy && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <UserCircle className="h-4 w-4" />
                    <span>Entrada registrada por</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 pl-6">
                    {resolvedMovement.createdBy.name}
                  </p>
                  {resolvedMovement.createdBy.username && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                      @{resolvedMovement.createdBy.username}
                    </p>
                  )}
                </div>
              )}
              {resolvedMovement.closedBy && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <UserCircle className="h-4 w-4" />
                    <span>Saída registrada por</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 pl-6">
                    {resolvedMovement.closedBy.name}
                  </p>
                  {resolvedMovement.closedBy.username && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                      @{resolvedMovement.closedBy.username}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Timeline de Eventos */}
          {resolvedMovement.events && Array.isArray(resolvedMovement.events) && resolvedMovement.events.length > 0 && (
            <div className="space-y-3 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico da Movimentação
              </h3>
              <div className="space-y-2">
                {resolvedMovement.events
                  .slice()
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.performedAt || b.createdAt || 0).getTime() -
                      new Date(a.performedAt || a.createdAt || 0).getTime()
                  )
                  .map((event: any, idx: number) => {
                    const action = event.action || event.type;
                    const ts = event.performedAt || event.createdAt || movement.enteredAt;
                    const personName = event.person?.name || movement.person?.name;
                    const vehiclePlate = event.vehicle?.plate || movement.vehicle?.plate;
                    const getActionLabel = () => {
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
                        default:
                          return action || "Evento";
                      }
                    };
                    const getIcon = () => {
                      switch (action) {
                        case "ENTRY":
                          return <ArrowRightCircle className="h-4 w-4 text-green-600" />;
                        case "RETURN":
                          return <RefreshCcw className="h-4 w-4 text-green-600" />;
                        case "DRIVER_CHANGE":
                          return <User className="h-4 w-4 text-blue-600" />;
                        case "PARTIAL_EXIT":
                          return <Clock className="h-4 w-4 text-yellow-600" />;
                        case "FULL_EXIT":
                          return <LogOut className="h-4 w-4 text-red-600" />;
                        default:
                          return <History className="h-4 w-4 text-slate-500" />;
                      }
                    };
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded border ${
                          action === "DRIVER_CHANGE"
                            ? "border-blue-300 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-900/40"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40"
                        }`}
                      >
                        <div className="mt-0.5">{getIcon()}</div>
                        <div className="space-y-1 text-sm">
                          {action === "DRIVER_CHANGE" && (
                            <div className="mb-1 px-2 py-0.5 rounded bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold inline-block">
                              ⚠️ TROCA DE MOTORISTA
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {getActionLabel()}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {ts ? format(new Date(ts), "dd/MM/yyyy HH:mm", { locale: ptBR }) : ""}
                            </span>
                          </div>
                          {personName && (
                            <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>{personName}</span>
                              {event.person?.document && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                  ({event.person.document})
                                </span>
                              )}
                            </div>
                          )}
                          {vehiclePlate && (
                            <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Truck className="h-3.5 w-3.5" />
                              <span>{vehiclePlate}</span>
                              {event.vehicle?.model && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                  - {event.vehicle.model}
                                </span>
                              )}
                            </div>
                          )}
                          {event.trailerPlate && (
                            <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs">
                              <Truck className="h-3 w-3" />
                              <span>Carreta: {event.trailerPlate}</span>
                            </div>
                          )}
                          {event.exitReason && (
                            <div className="text-slate-700 dark:text-slate-300">
                              Motivo: {event.exitReason}
                            </div>
                          )}
                          {event.invoiceNumbers && event.invoiceNumbers.length > 0 && (
                            <div className="text-slate-700 dark:text-slate-300 flex flex-wrap gap-1 items-center">
                              <span>NFs:</span>
                              {event.invoiceNumbers.map((nf: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs h-5">{nf}</Badge>
                              ))}
                            </div>
                          )}
                          {event.sealNumber && (
                            <div className="text-slate-700 dark:text-slate-300 text-xs">
                              Lacre: {event.sealNumber}
                            </div>
                          )}
                          {(event.createdBy || event.closedBy) && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <UserCircle className="h-3 w-3" />
                              <span>Por: {event.createdBy?.name || event.closedBy?.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Fotos */}
          {(movement.person?.photoUrl || movement.exitPhotos?.length > 0) && (
            <div className="space-y-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fotos
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {movement.person?.photoUrl && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Foto da Pessoa</p>
                    <img
                      src={movement.person.photoUrl}
                      alt="Foto da pessoa"
                      className="w-full h-48 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}
                {movement.exitPhotos && movement.exitPhotos.length > 0 && (
                  <>
                    <div className="col-span-full">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                        Fotos da Saída ({movement.exitPhotos.length})
                      </p>
                    </div>
                    {movement.exitPhotos.map((photo: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Foto da saída ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                          Foto {index + 1}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Movimento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este movimento? Esta ação não pode ser desfeita.
            {movement?.person?.name && (
              <span className="block mt-2 font-medium">
                Movimento de: {movement.person.name}
              </span>
            )}
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
