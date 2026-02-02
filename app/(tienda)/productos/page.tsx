'use client'

import React from "react"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { Loader2, Package, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/store/product-card'
import { catalog, categories } from '@/lib/api'
import type { PaginatedResponse, CatalogProduct, Category } from '@/lib/types'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialCategory = searchParams.get('categoria') || ''
  const initialSearch = searchParams.get('busqueda') || ''
  const initialSort = searchParams.get('sort') || 'created_at'
  const initialOrder = searchParams.get('order') || 'desc'
  const initialPage = parseInt(searchParams.get('page') || '1')

  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState(initialSearch)
  const [sort, setSort] = useState(initialSort)
  const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder as 'asc' | 'desc')
  const [page, setPage] = useState(initialPage)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data: categoriesData } = useSWR<Category[]>(
    'categories',
    () => categories.products.getAll()
  )

  const { data: productsData, isLoading } = useSWR<PaginatedResponse<CatalogProduct>>(
    ['products', category, search, sort, order, page],
    () => catalog.getProducts({
      categoria: category ? parseInt(category) : undefined,
      busqueda: search || undefined,
      sort,
      order,
      page,
      limit: 12,
    })
  )

  const updateURL = (params: Record<string, string>) => {
    const url = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.set(key, value)
    })
    router.push(`/productos?${url.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value)
    setPage(1)
    updateURL({ 
      categoria: value === 'all' ? '' : value, 
      busqueda: search, 
      sort, 
      order 
    })
  }

  const handleSortChange = (value: string) => {
    const [newSort, newOrder] = value.split('-')
    setSort(newSort)
    setOrder(newOrder as 'asc' | 'desc')
    setPage(1)
    updateURL({ 
      categoria: category, 
      busqueda: search, 
      sort: newSort, 
      order: newOrder 
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    updateURL({ 
      categoria: category, 
      busqueda: search, 
      sort, 
      order 
    })
  }

  const clearFilters = () => {
    setCategory('')
    setSearch('')
    setSort('created_at')
    setOrder('desc')
    setPage(1)
    router.push('/productos')
  }

  const hasActiveFilters = category || search

  const activeCategories = categoriesData?.filter(cat => cat.activo) || []
  const selectedCategory = activeCategories.find(cat => cat.id.toString() === category)

  const FilterControls = () => (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <Input
          type="search"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoría</label>
        <Select value={category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {activeCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Ordenar por</label>
        <Select value={`${sort}-${order}`} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Más recientes</SelectItem>
            <SelectItem value="created_at-asc">Más antiguos</SelectItem>
            <SelectItem value="nombre-asc">Nombre A-Z</SelectItem>
            <SelectItem value="nombre-desc">Nombre Z-A</SelectItem>
            <SelectItem value="precio_desde-asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="precio_desde-desc">Precio: mayor a menor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full bg-transparent"
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold tracking-tight">
            Productos
          </h1>
          <p className="mt-1 text-muted-foreground">
            {productsData?.meta.total || 0} productos encontrados
            {selectedCategory && ` en ${selectedCategory.nombre}`}
          </p>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtros activos:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory.nombre}
                <button onClick={() => handleCategoryChange('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="gap-1">
                {`"${search}"`}
                <button onClick={() => { setSearch(''); updateURL({ categoria: category, busqueda: '', sort, order }); }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
              <h2 className="mb-4 font-semibold">Filtros</h2>
              <FilterControls />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        {(category ? 1 : 0) + (search ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterControls />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : productsData && productsData.data.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {productsData.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {productsData.meta.total_pages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => {
                        setPage(page - 1)
                        updateURL({ categoria: category, busqueda: search, sort, order, page: String(page - 1) })
                      }}
                    >
                      Anterior
                    </Button>
                    <span className="px-4 text-sm text-muted-foreground">
                      Página {page} de {productsData.meta.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === productsData.meta.total_pages}
                      onClick={() => {
                        setPage(page + 1)
                        updateURL({ categoria: category, busqueda: search, sort, order, page: String(page + 1) })
                      }}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
                <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="font-semibold">No se encontraron productos</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Intenta con otros filtros de búsqueda
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4 bg-transparent"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
