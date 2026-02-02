'use client'

import useSWR from 'swr'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { kpi, orders } from '@/lib/api'
import type { FinancialSummary, DailySales, TopProduct, LowStockItem, PaginatedResponse, Order } from '@/lib/types'
import { SalesChart } from '@/components/admin/dashboard/sales-chart'
import { TopProductsTable } from '@/components/admin/dashboard/top-products-table'
import { LowStockAlert } from '@/components/admin/dashboard/low-stock-alert'
import { RecentOrdersTable } from '@/components/admin/dashboard/recent-orders-table'

// Get date range for current month
const now = new Date()
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

export default function AdminDashboardPage() {
  const { data: financialData, isLoading: financialLoading } = useSWR<FinancialSummary>(
    ['financial-summary', startOfMonth, endOfMonth],
    () => kpi.getFinancialSummary({ desde: startOfMonth, hasta: endOfMonth })
  )

  const { data: dailySales, isLoading: salesLoading } = useSWR<DailySales[]>(
    ['daily-sales', startOfMonth, endOfMonth],
    () => kpi.getDailySales({ desde: startOfMonth, hasta: endOfMonth })
  )

  const { data: topProducts, isLoading: topProductsLoading } = useSWR<TopProduct[]>(
    ['top-products', startOfMonth, endOfMonth],
    () => kpi.getTopProducts({ desde: startOfMonth, hasta: endOfMonth, limit: 5 })
  )

  const { data: lowStockItems, isLoading: lowStockLoading } = useSWR<LowStockItem[]>(
    'low-stock',
    () => kpi.getLowStockItems()
  )

  const { data: recentOrders, isLoading: ordersLoading } = useSWR<PaginatedResponse<Order>>(
    'recent-orders',
    () => orders.getAll({ limit: 5, sort: 'created_at', order: 'desc' })
  )

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'Q0.00'
    return `Q${value.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
  }

  const pendingOrders = recentOrders?.data?.filter(o => o.estado === 'PENDIENTE').length || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h2>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu negocio este mes
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(financialData?.total_ventas)}
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-success" />
                  Periodo actual
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(financialData?.total_gastos)}
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                  Egresos totales
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Bruta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${(financialData?.utilidad_bruta || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(financialData?.utilidad_bruta)}
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3" />
                  Ventas - Gastos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {pendingOrders > 0 ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-warning" />
                      Requieren atención
                    </>
                  ) : (
                    <>
                      <Package className="h-3 w-3" />
                      Todo al día
                    </>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Ventas del Mes</CardTitle>
            <CardDescription>
              Ventas diarias del periodo actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={dailySales} isLoading={salesLoading} />
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>
              Top 5 productos del mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsTable data={topProducts} isLoading={topProductsLoading} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Últimos pedidos recibidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable data={recentOrders?.data} isLoading={ordersLoading} />
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Inventario Bajo
            </CardTitle>
            <CardDescription>
              Productos por debajo del stock mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LowStockAlert data={lowStockItems} isLoading={lowStockLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
