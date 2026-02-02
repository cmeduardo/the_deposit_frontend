'use client'

import { Loader2 } from 'lucide-react'
import type { TopProduct } from '@/lib/types'

interface TopProductsTableProps {
  data?: TopProduct[]
  isLoading: boolean
}

export function TopProductsTable({ data, isLoading }: TopProductsTableProps) {
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
        No hay productos vendidos en este periodo
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((product, index) => (
        <div key={product.id_producto} className="flex items-center gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium">{product.nombre}</p>
            <p className="text-sm text-muted-foreground">
              {product.cantidad_vendida} unidades
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">Q{product.total_vendido.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
