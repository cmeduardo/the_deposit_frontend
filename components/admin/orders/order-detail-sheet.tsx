"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order } from "@/lib/types"

interface OrderDetailSheetProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (status: string) => void
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "outline" },
  confirmed: { label: "Confirmado", variant: "secondary" },
  processing: { label: "Procesando", variant: "default" },
  shipped: { label: "Enviado", variant: "default" },
  delivered: { label: "Entregado", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  onStatusChange,
}: OrderDetailSheetProps) {
  if (!order) return null

  const status = statusConfig[order.status] || statusConfig.pending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Pedido #{order.id}
            <Badge variant={status.variant}>{status.label}</Badge>
          </SheetTitle>
          <SheetDescription>
            {order.created_at
              ? format(new Date(order.created_at), "EEEE, dd 'de' MMMM yyyy 'a las' HH:mm", {
                  locale: es,
                })
              : "Fecha no disponible"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Cliente
            </h3>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer?.name || "Cliente"}</span>
              </div>
              {order.customer?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </div>
              )}
              {order.customer?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              {order.order_type === "delivery" ? (
                <Truck className="h-4 w-4" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              {order.order_type === "delivery" ? "Información de Envío" : "Recoger en Tienda"}
            </h3>
            <div className="rounded-lg border p-4">
              {order.order_type === "delivery" ? (
                <div className="space-y-2">
                  {order.shipping_address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{order.shipping_address}</span>
                    </div>
                  )}
                  {order.delivery_notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{order.delivery_notes}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  El cliente recogerá el pedido en la tienda
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos ({order.items?.length || 0})
            </h3>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cant.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product?.name || "Producto"}</p>
                          <p className="text-sm text-muted-foreground">
                            Q{item.unit_price?.toFixed(2)} c/u
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        Q{((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Q{order.subtotal?.toFixed(2) || "0.00"}</span>
            </div>
            {order.discount && order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span className="text-success">-Q{order.discount.toFixed(2)}</span>
              </div>
            )}
            {order.shipping_cost && order.shipping_cost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span>Q{order.shipping_cost.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>Q{order.total?.toFixed(2) || "0.00"}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pago
            </h3>
            <div className="rounded-lg border p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Método de pago</span>
                <Badge variant="outline">
                  {order.payment_method === "cash"
                    ? "Efectivo"
                    : order.payment_method === "card"
                      ? "Tarjeta"
                      : order.payment_method === "transfer"
                        ? "Transferencia"
                        : order.payment_method || "No especificado"}
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Estado del pago</span>
                <Badge variant={order.payment_status === "paid" ? "secondary" : "outline"}>
                  {order.payment_status === "paid"
                    ? "Pagado"
                    : order.payment_status === "pending"
                      ? "Pendiente"
                      : "No pagado"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4">
            {order.status === "pending" && (
              <Button onClick={() => onStatusChange("confirmed")} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Pedido
              </Button>
            )}
            {order.status === "confirmed" && (
              <Button onClick={() => onStatusChange("processing")} className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Procesar Pedido
              </Button>
            )}
            {order.status === "processing" && order.order_type === "delivery" && (
              <Button onClick={() => onStatusChange("shipped")} className="w-full">
                <Truck className="mr-2 h-4 w-4" />
                Marcar como Enviado
              </Button>
            )}
            {(order.status === "processing" || order.status === "shipped") && (
              <Button onClick={() => onStatusChange("delivered")} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como Entregado
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
