"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  RefreshCw,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import type { Sale, Expense, Product } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const fetcher = async () => {
  const [sales, expenses, products] = await Promise.all([
    api.sales.getAll(),
    api.expenses.getAll(),
    api.products.getAll(),
  ])
  return {
    sales: sales.data,
    expenses: expenses.data,
    products: products.data,
  }
}

export default function ReportsPage() {
  const { data, error, isLoading, mutate } = useSWR("admin-reports", fetcher)
  const [period, setPeriod] = useState("30")

  const sales = data?.sales || []
  const expenses = data?.expenses || []
  const products = data?.products || []

  const dateRange = useMemo(() => {
    const days = parseInt(period)
    return {
      start: subDays(new Date(), days),
      end: new Date(),
    }
  }, [period])

  const filteredSales = useMemo(() => {
    return sales.filter((sale: Sale) => {
      if (!sale.created_at) return false
      const date = new Date(sale.created_at)
      return date >= dateRange.start && date <= dateRange.end
    })
  }, [sales, dateRange])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense: Expense) => {
      if (!expense.expense_date) return false
      const date = new Date(expense.expense_date)
      return date >= dateRange.start && date <= dateRange.end
    })
  }, [expenses, dateRange])

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum: number, s: Sale) => sum + (s.total || 0), 0)
    const totalExpenses = filteredExpenses.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0)
    const profit = totalRevenue - totalExpenses
    const avgTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0

    return {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
      salesCount: filteredSales.length,
      avgTicket,
      lowStockCount: products.filter((p: Product) => p.stock <= (p.min_stock || 10)).length,
    }
  }, [filteredSales, filteredExpenses, products])

  const salesByDay = useMemo(() => {
    const grouped: Record<string, number> = {}
    filteredSales.forEach((sale: Sale) => {
      if (!sale.created_at) return
      const day = format(new Date(sale.created_at), "dd MMM", { locale: es })
      grouped[day] = (grouped[day] || 0) + (sale.total || 0)
    })
    return Object.entries(grouped).map(([name, total]) => ({ name, total }))
  }, [filteredSales])

  const salesByType = useMemo(() => {
    const inStore = filteredSales.filter((s: Sale) => s.sale_type === "in_store")
    const online = filteredSales.filter((s: Sale) => s.sale_type === "online")
    return [
      { name: "En tienda", value: inStore.reduce((sum: number, s: Sale) => sum + (s.total || 0), 0) },
      { name: "En línea", value: online.reduce((sum: number, s: Sale) => sum + (s.total || 0), 0) },
    ]
  }, [filteredSales])

  const paymentMethods = useMemo(() => {
    const grouped: Record<string, number> = {}
    filteredSales.forEach((sale: Sale) => {
      const method = sale.payment_method || "other"
      grouped[method] = (grouped[method] || 0) + (sale.total || 0)
    })
    const labels: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      other: "Otro",
    }
    return Object.entries(grouped).map(([key, value]) => ({
      name: labels[key] || key,
      value,
    }))
  }, [filteredSales])

  const topProducts = useMemo(() => {
    const productSales: Record<number, { name: string; quantity: number; revenue: number }> = {}
    filteredSales.forEach((sale: Sale) => {
      sale.items?.forEach((item) => {
        const id = item.product_id
        if (!productSales[id]) {
          productSales[id] = {
            name: item.product?.name || `Producto ${id}`,
            quantity: 0,
            revenue: 0,
          }
        }
        productSales[id].quantity += item.quantity || 0
        productSales[id].revenue += (item.quantity || 0) * (item.unit_price || 0)
      })
    })
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filteredSales])

  const COLORS = ["#1a1a1a", "#4a4a4a", "#7a7a7a", "#aaaaaa"]

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Error al cargar los reportes</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis y estadísticas del negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Ingresos
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-2" />
            ) : (
              <p className="mt-2 text-2xl font-bold">
                Q{stats.totalRevenue.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Gastos
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-2" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-destructive">
                Q{stats.totalExpenses.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${stats.profit >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                <TrendingUp className={`h-4 w-4 ${stats.profit >= 0 ? "text-success" : "text-destructive"}`} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Utilidad
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-2" />
            ) : (
              <p className={`mt-2 text-2xl font-bold ${stats.profit >= 0 ? "text-success" : "text-destructive"}`}>
                Q{stats.profit.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Ticket Promedio
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-2" />
            ) : (
              <p className="mt-2 text-2xl font-bold">
                Q{stats.avgTicket.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas por Día</CardTitle>
            <CardDescription>
              Evolución de ventas en el período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : salesByDay.length === 0 ? (
              <div className="flex items-center justify-center h-72 text-muted-foreground">
                No hay datos de ventas en este período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [`Q${value.toFixed(2)}`, "Ventas"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sales by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Canal</CardTitle>
            <CardDescription>
              Distribución entre tienda física y en línea
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={salesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`Q${value.toFixed(2)}`, "Total"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
            <CardDescription>
              Distribución de pagos por método
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`Q${value.toFixed(2)}`, "Total"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>
              Top 5 productos por ingresos generados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay datos de productos vendidos
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "revenue" ? `Q${value.toFixed(2)}` : value,
                      name === "revenue" ? "Ingresos" : "Cantidad",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
