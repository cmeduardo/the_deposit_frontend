'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Package, Minus, Plus, Trash2, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { cart, isLoading, itemCount, subtotal, fetchCart, updateItem, removeItem, clearCart } = useCart()
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId)
      return
    }

    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await updateItem(itemId, { cantidad_unidad_venta: newQuantity })
    } catch (error) {
      toast.error('Error al actualizar cantidad')
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await removeItem(itemId)
      toast.success('Producto eliminado del carrito')
    } catch (error) {
      toast.error('Error al eliminar producto')
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
      toast.success('Carrito vaciado')
    } catch (error) {
      toast.error('Error al vaciar carrito')
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="font-semibold">Inicia sesión para ver tu carrito</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Necesitas una cuenta para agregar productos al carrito
          </p>
          <Button asChild className="mt-4">
            <Link href="/iniciar-sesion">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="font-semibold">Tu carrito está vacío</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrega productos para comenzar tu pedido
          </p>
          <Button asChild className="mt-4">
            <Link href="/productos">
              Ver Productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-mono text-3xl font-bold">Carrito</h1>
            <p className="mt-1 text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <Button variant="outline" onClick={handleClearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Vaciar carrito
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {cart.items.map((item) => {
                  const isUpdating = updatingItems.has(item.id)
                  const quantity = Number(item.cantidad_unidad_venta)
                  const price = Number(item.precio_unitario)
                  const lineTotal = Number(item.subtotal_linea)
                  
                  return (
                    <div key={item.id} className="flex gap-4 p-4">
                      {/* Image */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {item.presentacion?.producto?.url_imagen ? (
                          <Image
                            src={item.presentacion.producto.url_imagen || "/placeholder.svg"}
                            alt={item.presentacion?.producto?.nombre || 'Producto'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-semibold line-clamp-1">
                              {item.presentacion?.producto?.nombre || 'Producto'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.presentacion?.nombre || 'Presentación'}
                            </p>
                            {item.notas && (
                              <p className="mt-1 text-xs text-muted-foreground italic">
                                Nota: {item.notas}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold">Q{lineTotal.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              Q{price.toFixed(2)} c/u
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center rounded-lg border border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                              disabled={isUpdating}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {isUpdating ? (
                                <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                              ) : (
                                quantity
                              )}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                              disabled={isUpdating}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Remove */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount} productos)</span>
                  <span>Q{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-muted-foreground">Se calcula al confirmar</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total estimado</span>
                  <span>Q{subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">
                    Confirmar Pedido
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/productos">
                    Seguir comprando
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
