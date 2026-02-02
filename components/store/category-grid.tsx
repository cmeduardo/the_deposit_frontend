'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { Package, Loader2 } from 'lucide-react'
import { categories } from '@/lib/api'
import type { Category } from '@/lib/types'

export function CategoryGrid() {
  const { data, isLoading, error } = useSWR<Category[]>(
    'categories',
    () => categories.products.getAll()
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
        <p className="text-muted-foreground">No se pudieron cargar las categorías</p>
      </div>
    )
  }

  const activeCategories = data.filter(cat => cat.activo)

  if (activeCategories.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No hay categorías disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {activeCategories.slice(0, 8).map((category) => (
        <Link
          key={category.id}
          href={`/productos?categoria=${category.id}`}
          className="group relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-center font-semibold">{category.nombre}</h3>
          {category.descripcion && (
            <p className="mt-1 text-center text-sm text-muted-foreground line-clamp-2">
              {category.descripcion}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
