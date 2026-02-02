"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Search,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import type { Sale } from "@/lib/types"

const fetcher = () => api.sales.getAll().then((res) => res.data)

export default function SalesPage() {
  const { data: sales, error, isLoading, mutate } = useSWR<Sale[]>("admin-sales", fetcher)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const filteredSales = sales?.filter((sale) => {
    const matchesSearch =
      sale.id.toString().includes(searchTerm) ||
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || sale.sale_type === typeFilter
    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter
    return matchesSearch && matchesType && matchesPayment
  })

  const stats = {
    total: sales?.length || 0,
    totalRevenue: sales?.reduce((sum, s) => sum + (s.total || 0), 0) || 0,
    inStore: sales?.filter((s) => s.sale_type === "in_store").length || 0,
    online: sales?.filter((s) => s.sale_type === "online").length || 0,
  }

  const paymentMethodLabel: Record<string, string> = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
  }

  const saleTypeLabel: Record<string, string> = {
    in_store: "En tienda",
    online: "En línea",
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Error al cargar las ventas</p>
          <Button onClick={() => mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground">
            Historial de ventas realizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Ventas</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ingresos Totales</span>
            </div>
            <p className="mt-1 text-2xl font-bold">Q{stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ventas en Tienda</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.inStore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ventas en Línea</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.online}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in_store">En tienda</SelectItem>
                <SelectItem value="online">En línea</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredSales?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No se encontraron ventas
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">#{sale.id}</TableCell>
                    <TableCell>
                      {sale.created_at
                        ? format(new Date(sale.created_at), "dd MMM yyyy HH:mm", { locale: es })
                        : "-"}
                    </TableCell>
                    <TableCell>{sale.customer_name || "Cliente general"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {saleTypeLabel[sale.sale_type] || sale.sale_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {paymentMethodLabel[sale.payment_method] || sale.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Q{sale.total?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sale Detail Sheet */}
      <Sheet open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Venta #{selectedSale?.id}</SheetTitle>
            <SheetDescription>
              {selectedSale?.created_at
                ? format(new Date(selectedSale.created_at), "EEEE, dd 'de' MMMM yyyy 'a las' HH:mm", {
                    locale: es,
                  })
                : ""}
            </SheetDescription>
          </SheetHeader>

          {selectedSale && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Información</h4>
                <div className="rounded-lg border p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente</span>
                    <span>{selectedSale.customer_name || "Cliente general"}</span>
                  </div>
                  {selectedSale.customer_phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teléfono</span>
                      <span>{selectedSale.customer_phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <Badge variant="outline">
                      {saleTypeLabel[selectedSale.sale_type] || selectedSale.sale_type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método de pago</span>
                    <Badge variant="secondary">
                      {paymentMethodLabel[selectedSale.payment_method] || selectedSale.payment_method}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Productos</h4>
                <div className="rounded-lg border divide-y">
                  {selectedSale.items?.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.product?.name || "Producto"}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} x Q{item.unit_price?.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-medium">
                        Q{((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Q{selectedSale.subtotal?.toFixed(2) || "0.00"}</span>
                </div>
                {selectedSale.discount && selectedSale.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Descuento</span>
                    <span>-Q{selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Q{selectedSale.total?.toFixed(2) || "0.00"}</span>
                </div>
                {selectedSale.amount_received && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recibido</span>
                      <span>Q{selectedSale.amount_received.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cambio</span>
                      <span>Q{selectedSale.change?.toFixed(2) || "0.00"}</span>
                    </div>
                  </>
                )}
              </div>

              {selectedSale.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notas</h4>
                  <p className="text-sm text-muted-foreground rounded-lg border p-3">
                    {selectedSale.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
