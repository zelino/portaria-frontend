"use client";

import { WebcamCapture } from "@/components/shared/webcam-capture";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useCreateExit } from "@/hooks/use-movements";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Camera,
  FileText,
  Info,
  Loader2,
  Plus,
  Truck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const exitSchema = z.object({
  sealNumber: z.string().optional(),
  photos: z.array(z.string()).optional(),
  exitReason: z.string().optional(),
});

type ExitForm = z.infer<typeof exitSchema>;

interface ExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: any;
  onSuccess?: () => void;
}

export function ExitDialog({
  open,
  onOpenChange,
  movement,
  onSuccess,
}: ExitDialogProps) {
  const [exitType, setExitType] = useState<"FULL_EXIT" | "PARTIAL_EXIT">(
    "FULL_EXIT"
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [invoiceNumbers, setInvoiceNumbers] = useState<string[]>([]);
  const [newInvoiceNumber, setNewInvoiceNumber] = useState("");
  const { data: user } = useAuth();
  const { toast } = useToast();
  const createExit = useCreateExit();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExitForm>({
    resolver: zodResolver(exitSchema),
  });

  const exitReason = watch("exitReason");

  const onSubmit = async (data: ExitForm) => {
    if (!user || !movement) return;

    // Validação manual para exitReason quando é saída parcial
    if (exitType === "PARTIAL_EXIT" && !data.exitReason?.trim()) {
      toast({
        title: "Erro",
        description: "O motivo da saída parcial é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        movementId: movement.id,
        type: exitType,
        invoiceNumbers:
          exitType === "FULL_EXIT" && invoiceNumbers.length > 0
            ? invoiceNumbers
            : undefined,
        sealNumber: data.sealNumber,
        photos: photos.length > 0 ? photos : undefined,
        exitReason: data.exitReason?.trim() || undefined,
        closedById: user.id,
      };

      await createExit.mutateAsync(payload);
      toast({
        title: "Sucesso",
        description: "Saída registrada com sucesso",
      });
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao registrar saída",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    setPhotos([]);
    setInvoiceNumbers([]);
    setNewInvoiceNumber("");
    setExitType("FULL_EXIT");
    onOpenChange(false);
  };

  const handlePhotoCapture = (imageSrc: string) => {
    setPhotos((prev) => [...prev, imageSrc]);
  };

  const handleAddInvoiceNumber = () => {
    if (newInvoiceNumber.trim()) {
      setInvoiceNumbers((prev) => [...prev, newInvoiceNumber.trim()]);
      setNewInvoiceNumber("");
    }
  };

  const handleRemoveInvoiceNumber = (index: number) => {
    setInvoiceNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  if (!movement) return null;

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Registrar Saída
          </DialogTitle>
          <DialogDescription className="text-base">
            Complete o registro de saída da movimentação
          </DialogDescription>
        </DialogHeader>

        {/* Resumo da Movimentação */}
        <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-700">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                {getInitials(movement.person?.name || "N/A")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {movement.person?.name || "N/A"}
                </span>
              </div>
              {movement.vehicle?.plate && (
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {movement.vehicle.plate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs
          value={exitType}
          onValueChange={(v) => setExitType(v as any)}
          className="mt-6"
        >
          <TabsList className="grid w-full grid-cols-2 h-11 sm:h-12 bg-slate-100 dark:bg-slate-900/50">
            <TabsTrigger
              value="FULL_EXIT"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-semibold"
            >
              Saída Completa
            </TabsTrigger>
            <TabsTrigger
              value="PARTIAL_EXIT"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-semibold"
            >
              Saída Parcial
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <TabsContent value="FULL_EXIT" className="space-y-6 mt-6">
              <Alert className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 font-medium">
                  O motorista e o veículo sairão do pátio. Esta ação finalizará
                  a movimentação.
                </AlertDescription>
              </Alert>

              {/* Campo: Motivo da Saída (Opcional) */}
              <div className="space-y-2">
                <Label
                  htmlFor="exitReasonFull"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Motivo da Saída{" "}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    (Opcional)
                  </span>
                </Label>
                <Input
                  id="exitReasonFull"
                  {...register("exitReason")}
                  placeholder="Ex: Entrega concluída, Retirada de carga, etc."
                  className="w-full"
                />
                {errors.exitReason && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.exitReason.message}
                  </p>
                )}
              </div>

              {/* Seção: Documentos */}
              <div className="space-y-4 p-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="invoiceNumbers"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Números das NFs{" "}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        (Opcional)
                      </span>
                    </Label>
                    {invoiceNumbers.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[60px]">
                        {invoiceNumbers.map((nf, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1.5 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                          >
                            {nf}
                            <button
                              type="button"
                              onClick={() => handleRemoveInvoiceNumber(index)}
                              className="ml-2 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              aria-label={`Remover NF ${nf}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        id="invoiceNumbers"
                        value={newInvoiceNumber}
                        onChange={(e) => setNewInvoiceNumber(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddInvoiceNumber();
                          }
                        }}
                        placeholder="Digite o número da NF (opcional)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddInvoiceNumber}
                        disabled={!newInvoiceNumber.trim()}
                        className="px-4 border-2 border-slate-300 dark:border-slate-600"
                        aria-label="Adicionar NF"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Adicionar
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pressione Enter ou clique em "Adicionar" para incluir
                      múltiplas NFs (opcional)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="sealNumber"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Número do Lacre
                    </Label>
                    <Input
                      id="sealNumber"
                      {...register("sealNumber")}
                      placeholder="Digite o número do lacre (opcional)"
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Fotos */}
              <div className="space-y-4 p-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Fotos da Carga/Lacre
                </h3>
                {photos.length > 0 && (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPhotos((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remover foto ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <WebcamCapture onCapture={handlePhotoCapture} />
                {photos.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Capture fotos da carga e/ou lacre para documentação
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="PARTIAL_EXIT" className="space-y-6 mt-6">
              <Alert className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200 font-medium">
                  A pessoa sairá, mas o veículo permanecerá no pátio. Use esta
                  opção quando apenas a pessoa sair temporariamente.
                </AlertDescription>
              </Alert>

              <div className="p-5 rounded-lg border-2 border-dashed border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold">Saída Parcial</p>
                    <p>
                      O veículo{" "}
                      <span className="font-semibold">
                        {movement.vehicle?.plate || "vinculado"}
                      </span>{" "}
                      permanecerá no pátio. A pessoa poderá retornar e
                      revincular-se ao veículo posteriormente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo: Motivo da Saída Parcial (Obrigatório) */}
              <div className="space-y-2">
                <Label
                  htmlFor="exitReasonPartial"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Motivo da Saída Parcial{" "}
                  <span className="text-red-500" aria-label="obrigatório">
                    *
                  </span>
                </Label>
                <Input
                  id="exitReasonPartial"
                  {...register("exitReason", {
                    required:
                      exitType === "PARTIAL_EXIT"
                        ? "O motivo da saída parcial é obrigatório"
                        : false,
                  })}
                  placeholder="Ex: Almoço, Almoço - retorno às 13h, etc."
                  className={`w-full ${
                    errors.exitReason
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : ""
                  }`}
                  aria-required={exitType === "PARTIAL_EXIT"}
                  aria-invalid={errors.exitReason ? "true" : "false"}
                />
                {errors.exitReason && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {errors.exitReason.message}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Informe o motivo da saída parcial (ex: Almoço, Almoço -
                  retorno às 13h)
                </p>
              </div>
            </TabsContent>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t-2 border-slate-200 dark:border-slate-700 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto min-w-[100px] border-2 border-slate-300 dark:border-slate-600"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createExit.isPending ||
                  (exitType === "PARTIAL_EXIT" && !exitReason?.trim())
                }
                variant={
                  exitType === "PARTIAL_EXIT" ? "default" : "destructive"
                }
                className={`w-full sm:w-auto min-w-[180px] ${
                  exitType === "PARTIAL_EXIT"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white border-2 border-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white border-2 border-red-600"
                }`}
              >
                {createExit.isPending ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Registrando...
                  </>
                ) : exitType === "PARTIAL_EXIT" ? (
                  "Registrar Saída de Pessoa"
                ) : (
                  "Finalizar Acesso"
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
