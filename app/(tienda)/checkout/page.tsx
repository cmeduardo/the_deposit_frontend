'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, ShoppingCart, Loader2, MapPin, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { locations } from '@/lib/api'
import { toast } from 'sonner'
import type { InventoryLocation } from '@/lib/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { cart, isLoading: cartLoading, itemCount, subtotal, fetchCart, confirmCart } = useCart()
  
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState<{ pedido_id: number; total: number } | null>(null)

  const { data: locationsData, isLoading: locationsLoading } = useSWR<InventoryLocation[]>(
    'locations',
    () => locations.getAll()
  )

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  useEffect(() => {
    if (locationsData && locationsData.length > 0 && !selectedLocation) {
      const defaultLocation = locationsData.find(l => l.activo) || locationsData[0]
      setSelectedLocation(defaultLocation.id.toString())
    }
  }, [locationsData, selectedLocation])

  const handleConfirmOrder = async () => {
    if (!selectedLocation) {
      toast.error('Selecciona una ubicación para recoger o enviar')
      return
    }

    setIsConfirming(true)
    try {
      const result = await confirmCart({
        id_ubicacion_salida: parseInt(selectedLocation),
        notas_cliente: notes || undefined,
      })
      setOrderConfirmed({ pedido_id: result.pedido_id, total: result.total_general })
      toast.success('Pedido confirmado exitosamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al confirmar pedido')
    } finally {
      setIsConfirming(false)
    }
  }

  if (authLoading || cartLoading || locationsLoading) {
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
          <h3 className="font-semibold">Inicia sesión para continuar</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Necesitas una cuenta para completar tu pedido
          </p>
          <Button asChild className="mt-4">
            <Link href="/iniciar-sesion">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (orderConfirmed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-mono text-2xl font-bold">Pedido Confirmado</h1>
            <p className="mt-2 text-muted-foreground">
              Tu pedido ha sido registrado exitosamente
            </p>
            <div className="mt-6 rounded-lg bg-muted p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número de pedido</span>
                <span className="font-mono font-bold">#{orderConfirmed.pedido_id}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">Q{orderConfirmed.total.toFixed(2)}</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Te contactaremos pronto para coordinar el pago y la entrega de tu pedido.
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-3 pb-8">
            <Button asChild className="w-full">
              <Link href="/mis-pedidos">Ver Mis Pedidos</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/productos">Seguir Comprando</Link>
            </Button>
          </CardFooter>
        </Card>
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
            Agrega productos antes de continuar
          </p>
          <Button asChild className="mt-4">
            <Link href="/productos">Ver Productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const activeLocations = locationsData?.filter(l => l.activo) || []

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link href="/carrito">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al carrito
            </Link>
          </Button>
          <h1 className="mt-4 font-mono text-3xl font-bold">Confirmar Pedido</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos de contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-medium">{user?.nombre}</p>
                  <p className="text-sm text-muted-foreground">{user?.correo}</p>
                  {user?.telefono && (
                    <p className="text-sm text-muted-foreground">{user.telefono}</p>
                  )}
                  {user?.direccion && (
                    <p className="text-sm text-muted-foreground">{user.direccion}</p>
                  )}
                </div>
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm">
                  <Link href="/mi-cuenta">Editar datos de contacto</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pickup Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Punto de entrega</CardTitle>
              </CardHeader>
              <CardContent>
                {activeLocations.length > 0 ? (
                  <RadioGroup
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                    className="space-y-3"
                  >
                    {activeLocations.map((location) => (
                      <Label
                        key={location.id}
                        htmlFor={`location-${location.id}`}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                          selectedLocation === location.id.toString()
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem
                          value={location.id.toString()}
                          id={`location-${location.id}`}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium">{location.nombre}</span>
                          </div>
                          {location.direccion && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {location.direccion}
                            </p>
                          )}
                          {location.tipo && (
                            <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs">
                              {location.tipo}
                            </span>
                          )}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="text-muted-foreground">No hay ubicaciones disponibles</p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notas del pedido (opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Instrucciones especiales para tu pedido..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Summary */}
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground line-clamp-1">
                        {item.presentacion?.producto?.nombre || 'Producto'} x{Number(item.cantidad_unidad_venta)}
                      </span>
                      <span>Q{Number(item.subtotal_linea).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount} productos)</span>
                  <span>Q{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-muted-foreground">Por confirmar</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Q{subtotal.toFixed(2)}</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  * El costo de envío se calculará y confirmará por nuestro equipo
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmOrder}
                  disabled={isConfirming || !selectedLocation}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
