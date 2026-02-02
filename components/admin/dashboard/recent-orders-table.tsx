'use client'

import Link from 'next/link'
import { Loader2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Order } from '@/lib/types'

interface RecentOrdersTableProps {
  data?: Order[]
  isLoading: boolean
}

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

export function RecentOrdersTable({ data, isLoading }: RecentOrdersTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No hay pedidos recientes
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((order) => (
        <div key={order.id} className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-mono font-medium">#{order.id}</p>
              <Badge
                variant="outline"
                className={statusColors[order.estado] || ''}
              >
                {statusLabels[order.estado] || order.estado}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.cliente?.nombre || 'Cliente'} - {new Date(order.fecha_pedido).toLocaleDateString('es-GT')}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">Q{Number(order.total_general).toFixed(2)}</p>
          </div>
          <Button asChild variant="ghost" size="icon">
            <Link href={`/admin/pedidos/${order.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ))}
      <Button asChild variant="outline" className="w-full bg-transparent">
        <Link href="/admin/pedidos">Ver todos los pedidos</Link>
      </Button>
    </div>
  )
}
