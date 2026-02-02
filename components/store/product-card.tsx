'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CatalogProduct } from '@/lib/types'

interface ProductCardProps {
  product: CatalogProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: string | null) => {
    if (!price) return null
    return `Q${parseFloat(price).toFixed(2)}`
  }

  return (
    <Link href={`/productos/${product.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:border-primary hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.url_imagen ? (
            <Image
              src={product.url_imagen || "/placeholder.svg"}
              alt={product.nombre}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
          {product.categoria && (
            <Badge
              variant="secondary"
              className="absolute left-2 top-2"
            >
              {product.categoria.nombre}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary">
            {product.nombre}
          </h3>
          {product.marca && (
            <p className="mt-1 text-sm text-muted-foreground">
              {product.marca}
            </p>
          )}
          <div className="mt-2">
            {product.tiene_precio ? (
              <div className="flex items-baseline gap-1">
                {product.precio_desde === product.precio_hasta ? (
                  <span className="text-lg font-bold">
                    {formatPrice(product.precio_desde)}
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">Desde</span>
                    <span className="text-lg font-bold">
                      {formatPrice(product.precio_desde)}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Consultar precio
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
