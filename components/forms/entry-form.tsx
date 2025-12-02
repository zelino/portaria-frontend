"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateEntrance, usePersonByDocument, useVehicleByPlate } from "@/hooks/use-movements";
import { useAuth } from "@/hooks/use-auth";
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
import { WebcamCapture } from "@/components/shared/webcam-capture";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Search, Loader2, AlertCircle, ArrowRightCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { maskCPF, unmaskCPF, maskPlate, unmaskPlate } from "@/lib/masks";
import { VehicleAbandonedWarningModal } from "./vehicle-abandoned-warning-modal";
import { MovementDetailsModal } from "./movement-details-modal";
import { useMovementById } from "@/hooks/use-movements";

const entrySchema = z.object({
  document: z.string().min(1, "Documento é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres"),
  rg: z.string().optional(),
  company: z.string().optional(),
  personType: z.enum(["EMPLOYEE", "VISITOR", "DRIVER"]),
  plate: z.string().optional(),
  trailerPlate: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleColor: z.string().optional(),
  vehicleType: z.enum(["CAR", "TRUCK", "MOTORCYCLE", "OTHER"]).optional(),
  reason: z.string().optional(),
  photoUrl: z.string().optional(),
});

type EntryForm = z.infer<typeof entrySchema>;

interface EntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewMovement?: (movementId: string) => void;
  prefillData?: {
    document?: string;
    name?: string;
    plate?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehicleType?: string;
  };
}

export function EntryDialog({ open, onOpenChange, onViewMovement, prefillData }: EntryDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"document" | "plate">("document");
  const [photo, setPhoto] = useState<string | null>(null);
  const [vehicleAbandonedData, setVehicleAbandonedData] = useState<any>(null);
  const [showVehicleWarning, setShowVehicleWarning] = useState(false);
  const [previousMovementId, setPreviousMovementId] = useState<string | null>(null);
  const [showPreviousMovement, setShowPreviousMovement] = useState(false);
  const { data: user } = useAuth();
  const { toast } = useToast();
  const createEntrance = useCreateEntrance();

  // Buscar movimento anterior quando necessário
  const { data: previousMovement } = useMovementById(previousMovementId);

  const { data: personData } = usePersonByDocument(
    searchType === "document" && searchQuery.length > 0 ? searchQuery : null
  );
  const { data: vehicleData } = useVehicleByPlate(
    searchType === "plate" && searchQuery.length > 0 ? searchQuery : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
    trigger,
  } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      personType: "DRIVER",
    },
    mode: "onChange", // Validação em tempo real
  });

  const plate = watch("plate");
  const personType = watch("personType");
  const document = watch("document");

  // Preencher dados quando encontrar pessoa ou veículo
  useEffect(() => {
    if (personData) {
      setValue("document", personData.document || personData.cpf || "", { shouldValidate: true });
      setValue("name", personData.name, { shouldValidate: true });
      setValue("rg", personData.rg || "");
      setValue("company", personData.company || "");
      setValue("personType", personData.type);
      if (personData.photoUrl) setPhoto(personData.photoUrl);
    }
  }, [personData, setValue]);

  // Preencher dados quando prefillData for fornecido
  useEffect(() => {
    if (prefillData && open) {
      if (prefillData.document) {
        setValue("document", prefillData.document, { shouldValidate: true });
        setSearchQuery(prefillData.document);
        setSearchType("document");
      }
      if (prefillData.name) {
        setValue("name", prefillData.name, { shouldValidate: true });
      }
      if (prefillData.plate) {
        setValue("plate", prefillData.plate, { shouldValidate: true });
        if (!prefillData.document) {
          setSearchQuery(prefillData.plate);
          setSearchType("plate");
        }
      }
      if (prefillData.vehicleModel) {
        setValue("vehicleModel", prefillData.vehicleModel);
      }
      if (prefillData.vehicleColor) {
        setValue("vehicleColor", prefillData.vehicleColor);
      }
      if (prefillData.vehicleType) {
        setValue("vehicleType", prefillData.vehicleType as any);
      }
    }
  }, [prefillData, open, setValue]);

  useEffect(() => {
    if (vehicleData) {
      setValue("plate", vehicleData.plate, { shouldValidate: true });
      setValue("vehicleModel", vehicleData.model || "");
      setValue("vehicleColor", vehicleData.color || "");
      setValue("vehicleType", vehicleData.type);
    }
  }, [vehicleData, setValue]);

  // Aplicar máscaras nos inputs (opcional, apenas para formatação visual)
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Aplica máscara de CPF apenas se parecer com CPF (11 dígitos numéricos)
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      const masked = maskCPF(value);
      setValue("document", numbers, { shouldValidate: true });
      e.target.value = masked;
    } else {
      // Para outros documentos, mantém como está
      setValue("document", value, { shouldValidate: true });
    }
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Remove caracteres especiais mas mantém o valor original para placas internacionais
    const cleaned = value.replace(/[^A-Z0-9]/gi, "");
    setValue("plate", cleaned, { shouldValidate: true });
    e.target.value = value;
  };

  // Verificar veículo abandonado
  useEffect(() => {
    if (plate && personData) {
      // Aqui você poderia fazer uma busca adicional na API
      // Por enquanto, vamos apenas mostrar um aviso genérico se necessário
    }
  }, [plate, personData]);

  const onSubmit = async (data: EntryForm) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...data,
        document: data.document.replace(/\D/g, ""), // Remove formatação mas mantém o valor
        plate: data.plate ? data.plate.replace(/[^A-Z0-9]/gi, "").toUpperCase() : undefined,
        trailerPlate: data.trailerPlate ? data.trailerPlate.replace(/[^A-Z0-9]/gi, "").toUpperCase() : undefined,
        photoUrl: photo || undefined,
        createdById: user.id,
      };

      const result = await createEntrance.mutateAsync(payload);

      // Verificar se há warning de veículo abandonado
      if (result.data?.vehicleStayOpenWarning) {
        setVehicleAbandonedData({
          vehicleStayOpenWarning: true,
          existingVehiclePlate: result.data.existingVehiclePlate,
          previousMovementId: result.data.previousMovementId,
          isSameDriver: result.data.isSameDriver,
          previousDriverName: result.data.previousDriverName,
          newMovementId: result.data.movement?.id,
        });
        setShowVehicleWarning(true);
      } else {
        toast({
          title: "Sucesso",
          description: "Entrada registrada com sucesso",
        });
        handleClose();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao registrar entrada",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset({
      personType: "DRIVER",
      ...(prefillData && {
        document: prefillData.document || "",
        name: prefillData.name || "",
        plate: prefillData.plate || "",
        vehicleModel: prefillData.vehicleModel || "",
        vehicleColor: prefillData.vehicleColor || "",
        vehicleType: prefillData.vehicleType as any || undefined,
      }),
    });
    setSearchQuery("");
    setPhoto(null);
    setVehicleAbandonedData(null);
    setShowVehicleWarning(false);
    setPreviousMovementId(null);
    setShowPreviousMovement(false);
    onOpenChange(false);
  };

  const handleViewPreviousMovement = (movementId: string) => {
    if (onViewMovement) {
      // Se callback foi fornecido, usar ele
      onViewMovement(movementId);
    } else {
      // Caso contrário, abrir modal de detalhes aqui mesmo
      setPreviousMovementId(movementId);
      setShowPreviousMovement(true);
    }
    setShowVehicleWarning(false);
  };

  const handleContinueAfterWarning = () => {
    setShowVehicleWarning(false);
    setVehicleAbandonedData(null);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {prefillData ? "Entrada Rápida - Retorno" : "Nova Entrada"}
          </DialogTitle>
          <DialogDescription>
            {prefillData
              ? "Registre o retorno após saída parcial. Os dados foram pré-preenchidos."
              : "Registre uma nova entrada de pessoa e/ou veículo"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
          aria-label="Formulário de nova entrada"
        >
          {/* Alerta de Entrada Rápida */}
          {prefillData && (
            <Alert className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 animate-in slide-in-from-top-2 duration-300">
              <ArrowRightCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200 font-medium">
                <div className="flex items-center justify-between">
                  <span>Entrada rápida ativada - Dados pré-preenchidos para retorno</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      reset({
                        personType: "DRIVER",
                      });
                      setSearchQuery("");
                    }}
                    className="h-7 px-2 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
                  >
                    Limpar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Passo 1: Busca */}
          <div
            className={`space-y-4 p-4 rounded-lg border transition-all duration-200 ${
              prefillData
                ? "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
            }`}
            role="search"
            aria-label="Buscar pessoa ou veículo existente"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Buscar Cadastro Existente
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={searchType}
                onValueChange={(v: "document" | "plate") => setSearchType(v)}
                aria-label="Tipo de busca"
              >
                <SelectTrigger className="w-full sm:w-36 h-11 border-2 border-slate-300 dark:border-slate-600" aria-label="Selecione tipo de busca">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="plate">Placa</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <Input
                  placeholder={`Digite ${searchType === "document" ? "Documento (CPF, Passaporte, etc.)" : "Placa"}`}
                  value={searchQuery}
                  onChange={(e) => {
                    const value = searchType === "document"
                      ? e.target.value
                      : e.target.value.toUpperCase();
                    setSearchQuery(value);
                  }}
                  className="pl-11"
                  aria-label={`Campo de busca por ${searchType === "document" ? "Documento" : "Placa"}`}
                />
              </div>
            </div>
          </div>

          {/* Passo 2: Dados */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <fieldset className="space-y-5 p-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <legend className="px-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                Dados Pessoais
              </legend>
              <div className="space-y-2">
                <Label htmlFor="document" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Documento <span className="text-red-500" aria-label="obrigatório">*</span>
                </Label>
                <Input
                  id="document"
                  {...register("document")}
                  onChange={(e) => {
                    handleDocumentChange(e);
                    register("document").onChange(e);
                  }}
                  placeholder="CPF, Passaporte, RG, etc."
                  aria-label="Campo de documento"
                  aria-required="true"
                  aria-invalid={errors.document ? "true" : "false"}
                  aria-describedby={errors.document ? "document-error" : "document-help"}
                  className={errors.document ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
                />
                {errors.document ? (
                  <p
                    id="document-error"
                    className="text-sm text-destructive flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {errors.document.message}
                  </p>
                ) : (
                  <p id="document-help" className="text-xs text-slate-500 dark:text-slate-400">
                    CPF, Passaporte, RG ou outro documento de identificação
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nome <span className="text-red-500" aria-label="obrigatório">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  aria-label="Campo de nome"
                  aria-required="true"
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={errors.name ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="text-sm text-destructive flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg" className="text-sm font-medium text-slate-700 dark:text-slate-300">RG</Label>
                <Input
                  id="rg"
                  {...register("rg")}
                  aria-label="Campo de RG"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-slate-700 dark:text-slate-300">Empresa</Label>
                <Input
                  id="company"
                  {...register("company")}
                  aria-label="Campo de empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tipo <span className="text-red-500" aria-label="obrigatório">*</span>
                </Label>
                <Select
                  value={personType}
                  onValueChange={(v) => setValue("personType", v as any, { shouldValidate: true })}
                  aria-label="Tipo de pessoa"
                  aria-required="true"
                >
                  <SelectTrigger
                    aria-label="Selecione o tipo de pessoa"
                    className="h-11 border-2 border-slate-300 dark:border-slate-600"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Funcionário</SelectItem>
                    <SelectItem value="VISITOR">Visitante</SelectItem>
                    <SelectItem value="DRIVER">Motorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            <fieldset className="space-y-5 p-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 border-dashed">
              <legend className="px-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                Dados do Veículo <span className="text-sm font-normal text-slate-500 dark:text-slate-400">(Opcional)</span>
              </legend>
              <div className="space-y-2">
                <Label htmlFor="plate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Placa do Veículo</Label>
                <Input
                  id="plate"
                  {...register("plate")}
                  onChange={(e) => {
                    handlePlateChange(e);
                    register("plate").onChange(e);
                  }}
                  placeholder="Ex: ABC1234, ABC-1234, ABC1D23 (aceita placas internacionais)"
                  aria-label="Campo de placa do veículo"
                  aria-invalid={errors.plate ? "true" : "false"}
                  className="uppercase"
                />
                <p id="plate-help" className="text-xs text-slate-500 dark:text-slate-400">
                  Placa do veículo (aceita formatos brasileiros e internacionais)
                </p>
              </div>
              {plate && (
                <div className="space-y-2">
                  <Label htmlFor="trailerPlate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Placa da Carreta</Label>
                  <Input
                    id="trailerPlate"
                    {...register("trailerPlate")}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      const cleaned = value.replace(/[^A-Z0-9]/gi, "");
                      setValue("trailerPlate", cleaned, { shouldValidate: true });
                      e.target.value = value;
                    }}
                    placeholder="Ex: CARRETA123 (opcional)"
                    aria-label="Campo de placa da carreta"
                    className="uppercase"
                  />
                  <p id="trailerPlate-help" className="text-xs text-slate-500 dark:text-slate-400">
                    Placa da carreta quando houver (opcional)
                  </p>
                </div>
              )}
              {plate && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel" className="text-sm font-medium text-slate-700 dark:text-slate-300">Modelo</Label>
                    <Input
                      id="vehicleModel"
                      {...register("vehicleModel")}
                      aria-label="Modelo do veículo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleColor" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cor</Label>
                    <Input
                      id="vehicleColor"
                      {...register("vehicleColor")}
                      aria-label="Cor do veículo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Tipo</Label>
                    <Select
                      onValueChange={(v) => setValue("vehicleType", v as any)}
                      aria-label="Tipo de veículo"
                    >
                      <SelectTrigger
                        aria-label="Selecione o tipo de veículo"
                        className="h-11 border-2 border-slate-300 dark:border-slate-600"
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAR">Carro</SelectItem>
                        <SelectItem value="TRUCK">Caminhão</SelectItem>
                        <SelectItem value="MOTORCYCLE">Moto</SelectItem>
                        <SelectItem value="OTHER">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-slate-700 dark:text-slate-300">Motivo</Label>
                <Input
                  id="reason"
                  {...register("reason")}
                  aria-label="Motivo da entrada"
                />
              </div>
            </fieldset>
          </div>

          {/* Passo 3: Foto */}
          <div className="space-y-4 p-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">Foto</h3>
            <WebcamCapture
              onCapture={setPhoto}
              initialImage={photo}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t-2 border-slate-200 dark:border-slate-700 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              aria-label="Cancelar registro de entrada"
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createEntrance.isPending}
              className="w-full sm:w-auto min-w-[140px]"
              aria-label={createEntrance.isPending ? "Registrando entrada..." : "Registrar entrada"}
            >
              {createEntrance.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Registrando...
                </>
              ) : (
                "Registrar Entrada"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal de Warning de Veículo Abandonado */}
      {vehicleAbandonedData && (
        <VehicleAbandonedWarningModal
          open={showVehicleWarning}
          onOpenChange={setShowVehicleWarning}
          data={vehicleAbandonedData}
          onViewPreviousMovement={handleViewPreviousMovement}
          onContinue={handleContinueAfterWarning}
        />
      )}

      {/* Modal de Detalhes do Movimento Anterior */}
      {previousMovement && (
        <MovementDetailsModal
          open={showPreviousMovement}
          onOpenChange={(open) => {
            setShowPreviousMovement(open);
            if (!open) {
              setPreviousMovementId(null);
            }
          }}
          movement={previousMovement}
        />
      )}
    </Dialog>
  );
}
