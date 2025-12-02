"use client";

export const dynamic = "force-dynamic";

import { CycleDetailsModal } from "@/components/forms/cycle-details-modal";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MovementsHistoryFilters,
  useMovementsHistory,
} from "@/hooks/use-movements";
import { maskCPF, maskPlate, unmaskCPF, unmaskPlate } from "@/lib/masks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  Search,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type SearchType = "document" | "plate" | "invoice" | null;

function detectSearchType(value: string): SearchType {
  if (!value.trim()) return null;

  const clean = value.replace(/\D/g, "");
  const plateClean = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const hasLetters = /[A-Z]/i.test(value);

  // Se tem letras, provavelmente é placa
  if (hasLetters && plateClean.length >= 3) {
    // Formato de placa: 3 letras seguidas de números/letras
    if (/^[A-Z]{3}/.test(plateClean)) {
      return "plate";
    }
  }

  // Documento: números (pode ser CPF, RG, etc.)
  if (clean.length >= 8 && !hasLetters) {
    return "document";
  }

  // NF: números menores que 8 dígitos
  if (clean.length > 0 && clean.length < 8 && !hasLetters) {
    return "invoice";
  }

  return null;
}

export default function HistoryPage() {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [filters, setFilters] = useState<MovementsHistoryFilters>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedSearchType, setSelectedSearchType] =
    useState<SearchType>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: historyData, isLoading } = useMovementsHistory(filters);

  // Agora a API retorna ciclos, não movimentos individuais
  const cycles = historyData?.data || [];
  const pagination = historyData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  // Usa o tipo selecionado manualmente ou detecta automaticamente
  const searchType = useMemo(() => {
    return selectedSearchType || detectSearchType(searchValue);
  }, [selectedSearchType, searchValue]);

  const handleSearchInput = (value: string) => {
    let formatted = value;
    // Usa o tipo selecionado manualmente ou detecta automaticamente
    const currentType = selectedSearchType || detectSearchType(value);

    // Aplica máscara baseada no tipo
    if (currentType === "document") {
      // Aplica máscara de CPF apenas se parecer com CPF (11 dígitos)
      const numbers = value.replace(/\D/g, "");
      if (numbers.length === 11) {
        formatted = maskCPF(value);
      } else {
        formatted = value;
      }
    } else if (currentType === "plate") {
      formatted = maskPlate(value);
    } else {
      // Para NF ou valores sem tipo definido, mantém como está
      formatted = value;
    }

    setSearchValue(formatted);
  };

  const handleSearchTypeSelect = (type: SearchType) => {
    setSelectedSearchType(type);
    // Se já tem valor digitado, reformata com o novo tipo
    if (searchValue) {
      handleSearchInput(searchValue);
    }
  };

  const performSearch = useCallback(() => {
    if (!searchValue.trim()) {
    setFilters((prev) => ({
      ...prev,
      document: undefined,
      plate: undefined,
      invoiceNumber: undefined,
      page: 1,
    }));
      return;
    }

    // Usa o tipo selecionado manualmente ou detecta automaticamente
    const type = selectedSearchType || detectSearchType(searchValue);

    setFilters((prev) => ({
      ...prev,
      document: type === "document" ? searchValue.replace(/\D/g, "") : undefined,
      plate: type === "plate" ? searchValue.replace(/[^A-Z0-9]/gi, "").toUpperCase() : undefined,
      invoiceNumber:
        type === "invoice" ? searchValue.replace(/\D/g, "") : undefined,
      page: 1,
    }));
  }, [searchValue, selectedSearchType]);

  // Debounce para busca automática
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchValue, performSearch]);

  const handleFilterChange = (
    key: keyof MovementsHistoryFilters,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page on filter change
    }));
  };

  const clearFilters = () => {
    setSearchValue("");
    setSelectedSearchType(null);
    setFilters({
      page: 1,
      limit: 20,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRowClick = (cycle: any) => {
    setSelectedCycle(cycle);
    setDetailsDialogOpen(true);
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.document ||
      filters.plate ||
      filters.invoiceNumber ||
      filters.status ||
      filters.personType ||
      filters.vehicleType ||
      filters.startDate ||
      filters.endDate
    );
  }, [filters]);

  const getSearchPlaceholder = () => {
    if (searchType === "document") return "Documento (CPF, Passaporte, etc.)";
    if (searchType === "plate") return "ABC-1234 ou ABC1D23";
    if (searchType === "invoice") return "00192";
    return "Documento, Placa ou Número da NF";
  };

  const getSearchIcon = () => {
    if (searchType === "document") return <User className="h-4 w-4" />;
    if (searchType === "plate") return <Car className="h-4 w-4" />;
    if (searchType === "invoice") return <FileText className="h-4 w-4" />;
    return <Search className="h-4 w-4" />;
  };

  const getSearchLabel = () => {
    if (searchType === "document") return "Buscando por Documento";
    if (searchType === "plate") return "Buscando por Placa";
    if (searchType === "invoice") return "Buscando por Número da NF";
    return "Buscar";
  };

  return (
    <>
      <Header title="Histórico de Movimentações" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-full">
        {/* Filtros */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-subtle bg-white dark:bg-slate-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                Buscar e Filtrar
              </CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 sm:flex-initial"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {showFilters ? "Ocultar" : "Mostrar"} Filtros
                  </span>
                  <span className="sm:hidden">Filtros</span>
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex-1 sm:flex-initial"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca Principal - Campo Único Inteligente */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="smartSearch">Buscar</Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={
                      selectedSearchType === "document" ? "default" : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      handleSearchTypeSelect(
                        selectedSearchType === "document" ? null : "document"
                      )
                    }
                  >
                    <User className="h-3 w-3 mr-1" />
                    Documento
                  </Button>
                  <Button
                    type="button"
                    variant={
                      selectedSearchType === "plate" ? "default" : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      handleSearchTypeSelect(
                        selectedSearchType === "plate" ? null : "plate"
                      )
                    }
                  >
                    <Car className="h-3 w-3 mr-1" />
                    Placa
                  </Button>
                  <Button
                    type="button"
                    variant={
                      selectedSearchType === "invoice" ? "default" : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      handleSearchTypeSelect(
                        selectedSearchType === "invoice" ? null : "invoice"
                      )
                    }
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    NF
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  {getSearchIcon()}
                </div>
                <Input
                  id="smartSearch"
                  placeholder={getSearchPlaceholder()}
                  value={searchValue}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="pl-10 pr-24"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      performSearch();
                    }
                    if (e.key === "Escape") {
                      setSearchValue("");
                      setSelectedSearchType(null);
                    }
                  }}
                />
                {searchValue && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchType && !selectedSearchType && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                        {getSearchLabel()}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setSearchValue("");
                        setSelectedSearchType(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {searchType && !selectedSearchType && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  {getSearchIcon()}
                  <span>{getSearchLabel()}</span>
                </p>
              )}
            </div>

            {/* Filtros Avançados */}
            {showFilters && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "status",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativas (No Pátio)</SelectItem>
                      <SelectItem value="closed">Encerradas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personType">Tipo de Pessoa</Label>
                  <Select
                    value={filters.personType || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "personType",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger id="personType">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="EMPLOYEE">Funcionário</SelectItem>
                      <SelectItem value="VISITOR">Visitante</SelectItem>
                      <SelectItem value="DRIVER">Motorista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                  <Select
                    value={filters.vehicleType || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "vehicleType",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger id="vehicleType">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="CAR">Carro</SelectItem>
                      <SelectItem value="TRUCK">Caminhão</SelectItem>
                      <SelectItem value="MOTORCYCLE">Moto</SelectItem>
                      <SelectItem value="OTHER">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">Itens por página</Label>
                  <Select
                    value={filters.limit?.toString() || "20"}
                    onValueChange={(value) =>
                      handleFilterChange("limit", parseInt(value))
                    }
                  >
                    <SelectTrigger id="limit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={
                      filters.startDate
                        ? format(new Date(filters.startDate), "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined;
                      handleFilterChange("startDate", date);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={
                      filters.endDate
                        ? format(new Date(filters.endDate), "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value + "T23:59:59").toISOString()
                        : undefined;
                      handleFilterChange("endDate", date);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Movimentações */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-subtle bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>
              Ciclos de Movimentação
              {pagination.total > 0 && (
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                  ({pagination.total}{" "}
                  {pagination.total === 1 ? "ciclo" : "ciclos"})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : cycles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                  {hasActiveFilters
                    ? "Nenhum ciclo encontrado com os filtros aplicados."
                    : "Nenhum ciclo encontrado."}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pessoa</TableHead>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Saída</TableHead>
                        <TableHead>NFs</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cycles.map((cycle: any) => {
                        // Coletar todas as NFs de todos os movimentos do ciclo
                        const allInvoiceNumbers =
                          cycle.movements?.flatMap(
                            (m: any) => m.invoiceNumbers || []
                          ) || [];

                        return (
                          <TableRow
                            key={cycle.cycleId}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50"
                            onClick={() => handleRowClick(cycle)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700">
                                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                                    {getInitials(cycle.person?.name || "N/A")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {cycle.person?.name || "N/A"}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {cycle.person?.document || cycle.person?.cpf || "-"}
                                  </p>
                                  {cycle.movements &&
                                    cycle.movements.length > 1 && (
                                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                        {cycle.movements.length} movimentações
                                      </p>
                                    )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {cycle.vehicle ? (
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                                    {cycle.vehicle.plate}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {cycle.vehicle.type === "CAR" && "Carro"}
                                    {cycle.vehicle.type === "TRUCK" &&
                                      "Caminhão"}
                                    {cycle.vehicle.type === "MOTORCYCLE" &&
                                      "Moto"}
                                    {cycle.vehicle.type === "OTHER" && "Outros"}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">
                                  Pedestre
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge cycleStatus={cycle.status} />
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="text-slate-900 dark:text-slate-100">
                                  {format(
                                    new Date(cycle.firstEntryAt),
                                    "dd/MM/yyyy",
                                    { locale: ptBR }
                                  )}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400">
                                  {format(
                                    new Date(cycle.firstEntryAt),
                                    "HH:mm",
                                    {
                                      locale: ptBR,
                                    }
                                  )}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {cycle.lastExitAt ? (
                                <div className="text-sm">
                                  <p className="text-slate-900 dark:text-slate-100">
                                    {format(
                                      new Date(cycle.lastExitAt),
                                      "dd/MM/yyyy",
                                      { locale: ptBR }
                                    )}
                                  </p>
                                  <p className="text-slate-500 dark:text-slate-400">
                                    {format(
                                      new Date(cycle.lastExitAt),
                                      "HH:mm",
                                      { locale: ptBR }
                                    )}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">
                                  Em andamento
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {allInvoiceNumbers.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {allInvoiceNumbers
                                    .slice(0, 2)
                                    .map((nf: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                                      >
                                        {nf}
                                      </span>
                                    ))}
                                  {allInvoiceNumbers.length > 2 && (
                                    <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                                      +{allInvoiceNumbers.length - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(cycle);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {cycles.map((cycle: any) => {
                    const allInvoiceNumbers =
                      cycle.movements?.flatMap(
                        (m: any) => m.invoiceNumbers || []
                      ) || [];

                    return (
                      <Card
                        key={cycle.cycleId}
                        className="cursor-pointer border-slate-200 dark:border-slate-800"
                        onClick={() => handleRowClick(cycle)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700 shrink-0">
                                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                                  {getInitials(cycle.person?.name || "N/A")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {cycle.person?.name || "N/A"}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {cycle.person?.cpf || "-"}
                                </p>
                                {cycle.movements &&
                                  cycle.movements.length > 1 && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                      {cycle.movements.length} movimentações
                                    </p>
                                  )}
                              </div>
                            </div>
                            <StatusBadge cycleStatus={cycle.status} />
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">
                                Veículo
                              </p>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {cycle.vehicle ? (
                                  <>
                                    {cycle.vehicle.plate}
                                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      {cycle.vehicle.type === "CAR" && "Carro"}
                                      {cycle.vehicle.type === "TRUCK" &&
                                        "Caminhão"}
                                      {cycle.vehicle.type === "MOTORCYCLE" &&
                                        "Moto"}
                                      {cycle.vehicle.type === "OTHER" &&
                                        "Outros"}
                                    </span>
                                  </>
                                ) : (
                                  "Pedestre"
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">
                                Entrada
                              </p>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {format(
                                  new Date(cycle.firstEntryAt),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                )}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {format(new Date(cycle.firstEntryAt), "HH:mm", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                          </div>

                          {cycle.lastExitAt && (
                            <div className="text-sm">
                              <p className="text-slate-500 dark:text-slate-400">
                                Saída
                              </p>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {format(
                                  new Date(cycle.lastExitAt),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                )}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {format(new Date(cycle.lastExitAt), "HH:mm", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                          )}

                          {allInvoiceNumbers.length > 0 && (
                            <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                NFs
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {allInvoiceNumbers
                                  .slice(0, 3)
                                  .map((nf: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                                    >
                                      {nf}
                                    </span>
                                  ))}
                                {allInvoiceNumbers.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                                    +{allInvoiceNumbers.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div
                            className="pt-2 border-t border-slate-200 dark:border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(cycle);
                              }}
                              className="w-full"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Página {pagination.page} de {pagination.totalPages}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="flex-1 sm:flex-initial"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="flex-1 sm:flex-initial"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
            </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedCycle && (
        <CycleDetailsModal
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          cycle={selectedCycle}
        />
      )}
    </>
  );
}
