import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Header({ title, actionLabel, onAction }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 py-4 sm:py-5 shadow-sm lg:ml-0">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gerencie as movimentações do pátio</p>
      </div>
      {onAction && (
        <Button
          onClick={onAction}
          size="default"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">{actionLabel || "Nova Entrada"}</span>
        </Button>
      )}
    </div>
  );
}
