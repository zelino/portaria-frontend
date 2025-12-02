"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  Trash2,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteMovement } from "@/hooks/use-movements";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const handleDelete = async () => {
    if (!movement?.id) return;

    try {
      await deleteMovement.mutateAsync(movement.id);
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
                  status={movement.exitedAt ? "EXITED" : "IN_PATIO"}
                  vehicleStayOpen={movement.vehicleStayOpen}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Entrada: {format(new Date(movement.enteredAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              {movement.exitedAt && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Saída: {format(new Date(movement.exitedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
                      {getInitials(movement.person?.name || "N/A")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {movement.person?.name || "N/A"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {movement.person?.type === "EMPLOYEE" && "Funcionário"}
                      {movement.person?.type === "VISITOR" && "Visitante"}
                      {movement.person?.type === "DRIVER" && "Motorista"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Documento:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {movement.person?.document || movement.person?.cpf || "-"}
                    </span>
                  </div>
                  {movement.person?.rg && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">RG:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {movement.person.rg}
                      </span>
                    </div>
                  )}
                  {movement.person?.company && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Empresa:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {movement.person.company}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dados do Veículo */}
            {movement.vehicle ? (
              <div className="space-y-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Dados do Veículo
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {movement.vehicle.plate}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    {movement.vehicle.model && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Modelo:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {movement.vehicle.model}
                        </span>
                      </div>
                    )}
                    {movement.vehicle.color && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Cor:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {movement.vehicle.color}
                        </span>
                      </div>
                    )}
                    {movement.vehicle.type && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Tipo:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {movement.vehicle.type === "CAR" && "Carro"}
                          {movement.vehicle.type === "TRUCK" && "Caminhão"}
                          {movement.vehicle.type === "MOTORCYCLE" && "Moto"}
                          {movement.vehicle.type === "OTHER" && "Outros"}
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
                    {movement.reason}
                  </span>
                </div>
              )}
              {movement.invoiceNumbers && movement.invoiceNumbers.length > 0 && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">NFs: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {movement.invoiceNumbers.join(", ")}
                  </span>
                </div>
              )}
              {/* Fallback para compatibilidade com dados antigos (invoiceNumber singular) */}
              {(!movement.invoiceNumbers || movement.invoiceNumbers.length === 0) && movement.invoiceNumber && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">NF: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {movement.invoiceNumber}
                  </span>
                </div>
              )}
              {movement.sealNumber && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Lacre: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {movement.sealNumber}
                  </span>
                </div>
              )}
              {movement.exitReason && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Motivo da Saída: </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {movement.exitReason}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-600 dark:text-slate-400">Permanência: </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatDistanceToNow(new Date(movement.enteredAt), {
                    addSuffix: false,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Fotos */}
          {(movement.person?.photoUrl || movement.exitPhotos?.length > 0 || movement.photos?.length > 0) && (
            <div className="space-y-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fotos
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {movement.person?.photoUrl && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Foto de Entrada</p>
                    <img
                      src={movement.person.photoUrl}
                      alt="Foto de entrada"
                      className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}
                {(movement.exitPhotos || movement.photos || [])?.map((photo: string, index: number) => (
                  <div key={index}>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Foto de Saída {index + 1}
                      {movement.exitPhotos && movement.exitPhotos.length > 1 && (
                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                          (Lacre, NF ou Veículo)
                        </span>
                      )}
                    </p>
                    <img
                      src={photo}
                      alt={`Foto de saída ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                ))}
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
