"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useActivePatio, useDashboardStats, useMovementById } from "@/hooks/use-movements";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Truck, User, Clock, Inbox, Package, LogOut, Eye, ArrowRightCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryDialog } from "@/components/forms/entry-form";
import { ExitDialog } from "@/components/forms/exit-modal";
import { MovementDetailsModal } from "@/components/forms/movement-details-modal";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardPage() {
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [previousMovementId, setPreviousMovementId] = useState<string | null>(null);
  const [entryPrefillData, setEntryPrefillData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data: patioData, isLoading: isLoadingPatio } = useActivePatio({ page, limit });
  const patio = patioData?.data || [];
  const pagination = patioData?.pagination;
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();

  // Buscar movimento anterior quando necessário
  const { data: previousMovement } = useMovementById(previousMovementId);

  const handleExit = (e: React.MouseEvent, movement: any) => {
    e.stopPropagation(); // Prevenir que o clique na linha também seja acionado
    setSelectedMovement(movement);
    setExitDialogOpen(true);
  };

  const handleRowClick = (movement: any) => {
    setSelectedMovement(movement);
    setDetailsDialogOpen(true);
  };

  const handleViewPreviousMovement = (movementId: string) => {
    setPreviousMovementId(movementId);
    setEntryDialogOpen(false);
  };

  const handleQuickEntry = (movement: any) => {
    // Pré-preencher dados da saída parcial para entrada rápida
    setEntryPrefillData({
      document: movement.person?.document || movement.person?.cpf,
      name: movement.person?.name,
      plate: movement.vehicle?.plate,
      vehicleModel: movement.vehicle?.model,
      vehicleColor: movement.vehicle?.color,
      vehicleType: movement.vehicle?.type,
    });
    setEntryDialogOpen(true);
  };

  // Quando movimento anterior for carregado, abrir modal de detalhes
  useEffect(() => {
    if (previousMovement) {
      setSelectedMovement(previousMovement);
      setDetailsDialogOpen(true);
      setPreviousMovementId(null);
    }
  }, [previousMovement]);

  return (
    <>
      <Header
        title="Pátio Ativo"
        actionLabel="NOVA ENTRADA"
        onAction={() => setEntryDialogOpen(true)}
      />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-full">
        {/* Cards de Resumo */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-200 dark:border-slate-800 shadow-subtle hover:shadow-elevated transition-shadow duration-200 bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total no Pátio
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.totalInPatio || 0}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">movimentações ativas</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800 shadow-subtle hover:shadow-elevated transition-shadow duration-200 bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Visitantes/Pedestres
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.peopleInPatio || 0}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">pessoas no pátio</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800 shadow-subtle hover:shadow-elevated transition-shadow duration-200 bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Saída Parcial
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingStats || isLoadingPatio ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {Array.isArray(patio) ? patio.filter((m: any) => m.vehicleStayOpen).length : 0}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">veículos sem motorista</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Pátio Ativo */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-subtle bg-white dark:bg-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Movimentações Ativas</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lista de pessoas e veículos atualmente no pátio</p>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingPatio ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !patio || !Array.isArray(patio) || patio.length === 0 ? (
              <div
                className="text-center py-16 px-4"
                role="status"
                aria-live="polite"
                aria-label="Nenhuma movimentação ativa"
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Inbox className="h-8 w-8 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Nenhuma movimentação ativa
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                      Não há pessoas ou veículos no pátio no momento. Registre uma nova entrada para começar.
                    </p>
                  </div>
                  <Button
                    onClick={() => setEntryDialogOpen(true)}
                    className="mt-4"
                    aria-label="Registrar nova entrada"
                  >
                    <Package className="mr-2 h-4 w-4" aria-hidden="true" />
                    Registrar Primeira Entrada
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table role="table" aria-label="Tabela de movimentações ativas">
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300" scope="col">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300" scope="col">
                          Placa
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300" scope="col">
                          Motorista
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300" scope="col">
                          Entrada
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300" scope="col">
                          Permanência
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300" scope="col">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(patio) && patio.map((movement: any) => {
                        const isPartialExit = movement.vehicleStayOpen && movement.exitedAt;
                        return (
                        <TableRow
                          key={movement.id}
                          className={`transition-all duration-200 cursor-pointer group ${
                            isPartialExit
                              ? "bg-yellow-50/30 dark:bg-yellow-900/10 border-l-4 border-l-yellow-500 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20"
                              : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                          }`}
                          onClick={() => handleRowClick(movement)}
                          aria-label={`Movimentação ${movement.vehicle?.plate || "sem veículo"} - ${movement.person?.name}. Clique para ver detalhes`}
                        >
                          <TableCell>
                            <StatusBadge
                              status={movement.exitedAt ? "EXITED" : "IN_PATIO"}
                              vehicleStayOpen={movement.vehicleStayOpen}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                              {movement.vehicle?.plate || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-2 ring-slate-100 dark:ring-slate-700">
                                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                                  {getInitials(movement.person?.name || "N/A")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-slate-900 dark:text-slate-100">{movement.person?.name || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {format(new Date(movement.enteredAt), "HH:mm")}
                              </span>
                              {isPartialExit && movement.exitedAt && (
                                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                  Saída: {format(new Date(movement.exitedAt), "HH:mm")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isPartialExit ? (
                              <div className="space-y-1">
                                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                  Aguardando retorno
                                </span>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {formatDistanceToNow(new Date(movement.exitedAt), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-400">
                                {formatDistanceToNow(new Date(movement.enteredAt), {
                                  addSuffix: false,
                                  locale: ptBR,
                                })}
                              </span>
                            )}
                          </TableCell>
                          <TableCell
                            className="text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isPartialExit ? (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickEntry(movement);
                                    }}
                                    className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 font-semibold"
                                    aria-label="Registrar entrada rápida para esta saída parcial"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                    Entrada Rápida
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRowClick(movement);
                                    }}
                                    className="h-9 px-3 border-2 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    aria-label="Ver detalhes desta movimentação"
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                    Detalhes
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => handleExit(e, movement)}
                                    className="h-9 px-3 border-2 border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                    aria-label="Registrar saída desta movimentação"
                                  >
                                    <LogOut className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                    Saída
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRowClick(movement);
                                    }}
                                    className="h-9 px-3 border-2 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    aria-label="Ver detalhes desta movimentação"
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                    Detalhes
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {Array.isArray(patio) && patio.map((movement: any) => {
                    const isPartialExit = movement.vehicleStayOpen && movement.exitedAt;
                    return (
                      <Card
                        key={movement.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isPartialExit
                            ? "bg-yellow-50/30 dark:bg-yellow-900/10 border-l-4 border-l-yellow-500"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                        onClick={() => handleRowClick(movement)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10 ring-2 ring-slate-100 dark:ring-slate-700 shrink-0">
                                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                                  {getInitials(movement.person?.name || "N/A")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {movement.person?.name || "N/A"}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {movement.vehicle?.plate || "Pedestre"}
                                </p>
                              </div>
                            </div>
                            <StatusBadge
                              status={movement.exitedAt ? "EXITED" : "IN_PATIO"}
                              vehicleStayOpen={movement.vehicleStayOpen}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">Entrada</p>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {format(new Date(movement.enteredAt), "HH:mm")}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">Permanência</p>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {isPartialExit ? (
                                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                    Aguardando retorno
                                  </span>
                                ) : (
                                  formatDistanceToNow(new Date(movement.enteredAt), {
                                    addSuffix: false,
                                    locale: ptBR,
                                  })
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                            {isPartialExit ? (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickEntry(movement);
                                  }}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <RotateCcw className="h-4 w-4 mr-1.5" />
                                  Entrada Rápida
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(movement);
                                  }}
                                  className="flex-1"
                                >
                                  <Eye className="h-4 w-4 mr-1.5" />
                                  Detalhes
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => handleExit(e, movement)}
                                  className="flex-1 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <LogOut className="h-4 w-4 mr-1.5" />
                                  Saída
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(movement);
                                  }}
                                  className="flex-1"
                                >
                                  <Eye className="h-4 w-4 mr-1.5" />
                                  Detalhes
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1 || isLoadingPatio}
                  className="h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        disabled={isLoadingPatio}
                        className="h-9 w-9 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages || isLoadingPatio}
                  className="h-9 px-3"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <EntryDialog
        open={entryDialogOpen}
        onOpenChange={(open) => {
          setEntryDialogOpen(open);
          if (!open) {
            setEntryPrefillData(null);
          }
        }}
        onViewMovement={handleViewPreviousMovement}
        prefillData={entryPrefillData}
      />
      <ExitDialog
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        movement={selectedMovement}
        onSuccess={() => {
          setExitDialogOpen(false);
          setSelectedMovement(null);
        }}
      />
      <MovementDetailsModal
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        movement={selectedMovement}
      />
    </>
  );
}
