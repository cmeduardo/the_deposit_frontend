'use client'

import Link from 'next/link'
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LowStockItem } from '@/lib/types'

interface LowStockAlertProps {
  data?: LowStockItem[]
  isLoading: boolean
}

export function LowStockAlert({ data, isLoading }: LowStockAlertProps) {
  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2">
        <CheckCircle2 className="h-8 w-8 text-success" />
        <p className="text-muted-foreground">Todo el inventario está OK</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.slice(0, 5).map((item) => {
        const percentage = Math.round((item.stock_actual / item.stock_minimo) * 100)
        const isVeryLow = percentage < 25
        
        return (
          <div key={item.id_producto} className="flex items-center gap-4">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isVeryLow ? 'bg-destructive/20' : 'bg-warning/20'}`}>
              <AlertTriangle className={`h-4 w-4 ${isVeryLow ? 'text-destructive' : 'text-warning'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{item.nombre}</p>
              <p className="text-sm text-muted-foreground">
                Stock: {item.stock_actual} / Mín: {item.stock_minimo}
              </p>
            </div>
            <Badge variant={isVeryLow ? 'destructive' : 'secondary'}>
              {percentage}%
            </Badge>
          </div>
        )
      })}
      {data.length > 5 && (
        <Button asChild variant="outline" className="w-full bg-transparent">
          <Link href="/admin/inventario?bajo_minimo=true">
            Ver todos ({data.length} productos)
          </Link>
        </Button>
      )}
    </div>
  )
}
