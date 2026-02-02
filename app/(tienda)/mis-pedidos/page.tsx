'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Package, Loader2, Eye, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { orders } from '@/lib/api'
import type { PaginatedResponse, Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  PENDIENTE: 'bg-warning/20 text-warning-foreground border-warning',
  CONFIRMADO: 'bg-primary/20 text-primary border-primary',
  EN_PROCESO: 'bg-primary/20 text-primary border-primary',
  LISTO: 'bg-success/20 text-success-foreground border-success',
  ENTREGADO: 'bg-success/20 text-success-foreground border-success',
  CANCELADO: 'bg-destructive/20 text-destructive border-destructive',
}

const statusLabels: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PROCESO: 'En Proceso',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export default function MyOrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const { data, isLoading, error } = useSWR<PaginatedResponse<Order>>(
    isAuthenticated && user ? ['my-orders', user.id] : null,
    () => orders.getAll({ id_cliente: user!.id, sort: 'created_at', order: 'desc' })
  )

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/iniciar-sesion')
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold">Mis Pedidos</h1>
          <p className="mt-1 text-muted-foreground">
            Historial de pedidos realizados
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Error al cargar los pedidos</p>
            </CardContent>
          </Card>
        ) : !data || data.data.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="font-semibold">No tienes pedidos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tus pedidos aparecerán aquí una vez que realices una compra
              </p>
              <Button asChild className="mt-4">
                <Link href="/productos">Ver Productos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.data.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 font-mono text-lg">
                        Pedido #{order.id}
                        <Badge
                          variant="outline"
                          className={statusColors[order.estado] || ''}
                        >
                          {statusLabels[order.estado] || order.estado}
                        </Badge>
                      </CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.fecha_pedido)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(order.fecha_pedido)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">
                        Q{Number(order.total_general).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {order.detalles && order.detalles.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {order.detalles.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.presentacion?.producto?.nombre || 'Producto'} x{Number(item.cantidad_unidad_venta)}
                          </span>
                          <span>Q{Number(item.subtotal_linea).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.detalles.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.detalles.length - 3} productos más
                        </p>
                      )}
                    </div>
                  )}
                  {order.notas_cliente && (
                    <p className="mb-4 text-sm text-muted-foreground italic">
                      Nota: {order.notas_cliente}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/mis-pedidos/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalle
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
