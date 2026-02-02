'use client'

import useSWR from 'swr'
import { Loader2 } from 'lucide-react'
import { catalog } from '@/lib/api'
import { ProductCard } from './product-card'
import type { PaginatedResponse, CatalogProduct } from '@/lib/types'

export function FeaturedProducts() {
  const { data, isLoading, error } = useSWR<PaginatedResponse<CatalogProduct>>(
    'featured-products',
    () => catalog.getProducts({ limit: 8, sort: 'created_at', order: 'desc' })
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No se pudieron cargar los productos</p>
      </div>
    )
  }

  if (data.data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
