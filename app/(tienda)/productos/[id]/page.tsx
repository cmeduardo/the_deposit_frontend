'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Package, Minus, Plus, ShoppingCart, ArrowLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { catalog } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'
import type { CatalogProductDetail, ProductPresentation } from '@/lib/types'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addItem, fetchCart } = useCart()
  
  const [selectedPresentation, setSelectedPresentation] = useState<ProductPresentation | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const { data: product, isLoading, error } = useSWR<CatalogProductDetail>(
    `product-${id}`,
    () => catalog.getProduct(parseInt(id))
  )

  useEffect(() => {
    if (product && product.presentaciones.length > 0 && !selectedPresentation) {
      const defaultPresentation = product.presentaciones.find(p => p.activo && p.precio_venta_por_defecto) || product.presentaciones[0]
      setSelectedPresentation(defaultPresentation)
    }
  }, [product, selectedPresentation])

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Consultar'
    return `Q${parseFloat(price).toFixed(2)}`
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar productos al carrito')
      router.push('/iniciar-sesion')
      return
    }

    if (!selectedPresentation) {
      toast.error('Selecciona una presentación')
      return
    }

    setIsAdding(true)
    try {
      await addItem({
        id_presentacion_producto: selectedPresentation.id,
        cantidad_unidad_venta: quantity,
        notas: notes || null,
      })
      await fetchCart()
      toast.success('Producto agregado al carrito')
      setQuantity(1)
      setNotes('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al agregar al carrito')
    } finally {
      setIsAdding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="font-semibold">Producto no encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            El producto que buscas no existe o ha sido eliminado
          </p>
          <Button asChild variant="outline" className="mt-4 bg-transparent">
            <Link href="/productos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const activePresentations = product.presentaciones.filter(p => p.activo)
  const subtotal = selectedPresentation?.precio_venta_por_defecto 
    ? parseFloat(selectedPresentation.precio_venta_por_defecto) * quantity 
    : 0

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link href="/productos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Link>
          </Button>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            {product.url_imagen ? (
              <Image
                src={product.url_imagen || "/placeholder.svg"}
                alt={product.nombre}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.categoria && (
              <Badge variant="secondary" className="mb-2 w-fit">
                {product.categoria.nombre}
              </Badge>
            )}
            
            <h1 className="font-mono text-3xl font-bold">{product.nombre}</h1>
            
            {product.marca && (
              <p className="mt-1 text-lg text-muted-foreground">
                {product.marca}
              </p>
            )}

            {product.descripcion && (
              <p className="mt-4 text-muted-foreground">
                {product.descripcion}
              </p>
            )}

            {/* Presentations */}
            {activePresentations.length > 0 && (
              <div className="mt-6">
                <Label className="text-base font-semibold">Presentación</Label>
                <RadioGroup
                  value={selectedPresentation?.id.toString()}
                  onValueChange={(value) => {
                    const presentation = activePresentations.find(p => p.id.toString() === value)
                    if (presentation) {
                      setSelectedPresentation(presentation)
                      setQuantity(1)
                    }
                  }}
                  className="mt-3 grid gap-3 sm:grid-cols-2"
                >
                  {activePresentations.map((presentation) => (
                    <Label
                      key={presentation.id}
                      htmlFor={`presentation-${presentation.id}`}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        selectedPresentation?.id === presentation.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value={presentation.id.toString()}
                          id={`presentation-${presentation.id}`}
                        />
                        <div>
                          <p className="font-medium">{presentation.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {presentation.unidades_por_unidad_venta} unidades
                          </p>
                        </div>
                      </div>
                      <span className="font-bold">
                        {formatPrice(presentation.precio_venta_por_defecto)}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <Label className="text-base font-semibold">Cantidad</Label>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {subtotal > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Subtotal: <span className="font-bold text-foreground">Q{subtotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <Label htmlFor="notes" className="text-base font-semibold">
                Notas (opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Instrucciones especiales para este producto..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-3"
                rows={2}
              />
            </div>

            {/* Price & Add to Cart */}
            <div className="mt-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">
                  {subtotal > 0 ? `Q${subtotal.toFixed(2)}` : 'Consultar precio'}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdding || activePresentations.length === 0}
                className="gap-2"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Agregar al carrito
                  </>
                )}
              </Button>
            </div>

            {activePresentations.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Este producto no tiene presentaciones disponibles actualmente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
