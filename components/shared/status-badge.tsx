import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react";

interface StatusBadgeProps {
  status?: "IN_PATIO" | "LUNCH" | "EXITED";
  vehicleStayOpen?: boolean;
  exitType?: "ACTIVE" | "PARTIAL_EXIT" | "FULL_EXIT" | "FULL_EXIT_WITH_INVOICE";
  cycleStatus?: "active" | "closed";
}

export function StatusBadge({
  status,
  vehicleStayOpen,
  exitType,
  cycleStatus
}: StatusBadgeProps) {
  // Se exitType for fornecido, usar ele (nova API)
  if (exitType) {
    switch (exitType) {
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 font-semibold shadow-sm"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            No Pátio
          </Badge>
        );
      case "PARTIAL_EXIT":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800 font-semibold shadow-sm"
          >
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Saída Parcial
          </Badge>
        );
      case "FULL_EXIT":
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold shadow-sm"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Finalizado
          </Badge>
        );
      case "FULL_EXIT_WITH_INVOICE":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800 font-semibold shadow-sm"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Finalizado c/ NF
          </Badge>
        );
    }
  }

  // Se cycleStatus for fornecido, usar ele para mostrar status do ciclo
  if (cycleStatus) {
    if (cycleStatus === "active") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 font-semibold shadow-sm"
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Ativo
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold shadow-sm"
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Encerrado
        </Badge>
      );
    }
  }

  // Fallback para código antigo (compatibilidade)
  if (vehicleStayOpen) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800 font-semibold shadow-sm"
      >
        <Clock className="mr-1.5 h-3.5 w-3.5" />
        Saída Parcial
      </Badge>
    );
  }

  if (status === "EXITED") {
    return (
      <Badge
        variant="outline"
        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-semibold shadow-sm"
      >
        <XCircle className="mr-1.5 h-3.5 w-3.5" />
        Finalizado
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 font-semibold shadow-sm"
    >
      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
      No Pátio
    </Badge>
  );
}
