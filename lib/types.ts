export type UserRole = 'ADMINISTRADOR' | 'VENDEDOR' | 'CLIENTE'

export interface User {
  id: number
  nombre: string
  correo: string
  rol: UserRole
  activo?: boolean
  telefono?: string | null
  nit?: string
  direccion?: string | null
  dpi?: string | null
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  mensaje: string
  token: string
  usuario: User
}

export interface LoginInput {
  correo: string
  contrasena: string
}

export interface RegisterInput {
  nombre: string
  correo: string
  contrasena: string
}

export interface ProfileUpdateInput {
  nombre?: string
  correo?: string
  telefono?: string | null
  nit?: string | null
  direccion?: string | null
  dpi?: string | null
  contrasena?: string
}

// ==================== Pagination ====================
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
  sort?: string
  order?: string
  filtros?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta
  data: T[]
}

// ==================== Categories ====================
export interface Category {
  id: number
  nombre: string
  descripcion?: string | null
  activo: boolean
}

export interface ExpenseCategory extends Category {
  tipo_por_defecto?: 'FIJO' | 'VARIABLE' | null
}

// ==================== Products ====================
export interface Product {
  id: number
  nombre: string
  descripcion?: string | null
  marca?: string | null
  url_imagen?: string | null
  stock_minimo: number
  id_categoria?: number | null
  activo: boolean
  categoria?: Category | null
  created_at?: string
  updated_at?: string
}

export interface ProductPresentation {
  id: number
  id_producto: number
  nombre: string
  url_imagen?: string | null
  codigo_barras?: string | null
  id_unidad_venta: number
  unidades_por_unidad_venta: number
  precio_venta_por_defecto?: string | null
  precio_minimo?: string | null
  activo: boolean
}

// ==================== Catalog (Public) ====================
export interface CatalogProduct {
  id: number
  nombre: string
  descripcion?: string | null
  marca?: string | null
  url_imagen?: string | null
  stock_minimo: number
  categoria?: Category | null
  precio_desde?: string | null
  precio_hasta?: string | null
  tiene_precio: boolean
}

export interface CatalogProductDetail extends Omit<CatalogProduct, 'precio_desde' | 'precio_hasta' | 'tiene_precio'> {
  presentaciones: ProductPresentation[]
}

// ==================== Cart ====================
export type CartStatus = 'ACTIVO' | 'CONVERTIDO' | 'CANCELADO'

export interface CartItem {
  id: number
  id_carrito: number
  id_presentacion_producto: number
  cantidad_unidad_venta: string
  precio_unitario: string
  subtotal_linea: string
  notas?: string | null
  presentacion?: ProductPresentation & { producto?: Product }
  createdAt?: string
  updatedAt?: string
}

export interface Cart {
  id: number
  id_usuario_cliente: number
  estado: CartStatus
  notas?: string | null
  items: CartItem[]
  createdAt?: string
  updatedAt?: string
}

export interface CartItemInput {
  id_presentacion_producto: number
  cantidad_unidad_venta: number
  notas?: string | null
}

export interface ConfirmCartInput {
  id_ubicacion_salida: number
  cargo_envio?: number | null
  descuento_total?: number | null
  notas_cliente?: string | null
}

// ==================== Orders ====================
export type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'EN_PROCESO' | 'LISTO' | 'ENTREGADO' | 'CANCELADO'

export interface OrderItem {
  id: number
  id_pedido: number
  id_presentacion_producto: number
  cantidad_unidad_venta: string
  precio_unitario: string
  subtotal_linea: string
  notas?: string | null
  presentacion?: ProductPresentation & { producto?: Product }
}

export interface Order {
  id: number
  id_usuario_cliente: number
  id_ubicacion_salida: number
  estado: OrderStatus
  fecha_pedido: string
  subtotal: string
  cargo_envio: string
  descuento_total: string
  total_general: string
  notas_cliente?: string | null
  notas_internas?: string | null
  cliente?: User
  ubicacion_salida?: InventoryLocation
  detalles?: OrderItem[]
  created_at?: string
  updated_at?: string
}

// ==================== Sales ====================
export type PaymentStatus = 'PENDIENTE' | 'PARCIAL' | 'PAGADO'
export type SaleType = 'MOSTRADOR' | 'PEDIDO'

export interface SaleItem {
  id: number
  id_venta: number
  id_presentacion_producto: number
  cantidad_unidad_venta: string
  precio_unitario: string
  subtotal_linea: string
  notas?: string | null
  presentacion?: ProductPresentation & { producto?: Product }
}

export interface Sale {
  id: number
  id_usuario_cliente?: number | null
  id_usuario_vendedor: number
  id_pedido?: number | null
  id_ubicacion: number
  tipo_venta: SaleType
  fecha_venta: string
  subtotal: string
  impuestos: string
  descuento_total: string
  cargo_envio: string
  total_general: string
  estado_pago: PaymentStatus
  notas?: string | null
  cliente?: User | null
  vendedor?: User
  ubicacion?: InventoryLocation
  pedido?: Order | null
  detalles?: SaleItem[]
  created_at?: string
  updated_at?: string
}

export interface SaleInput {
  id_usuario_cliente?: number | null
  id_pedido?: number | null
  id_ubicacion: number
  tipo_venta: SaleType
  fecha_venta: string
  descuento_total?: number
  cargo_envio?: number
  notas?: string | null
  detalles: {
    id_presentacion_producto: number
    cantidad_unidad_venta: number
    precio_unitario: number
    notas?: string | null
  }[]
}

// ==================== Shipments ====================
export type ShipmentStatus = 'PENDIENTE' | 'EN_TRANSITO' | 'ENTREGADO' | 'CANCELADO'

export interface Shipment {
  id: number
  id_venta: number
  id_pedido?: number | null
  estado: ShipmentStatus
  direccion_entrega: string
  fecha_programada?: string | null
  fecha_envio?: string | null
  fecha_entrega?: string | null
  costo_envio: string
  notas?: string | null
  venta?: Sale
  pedido?: Order
  created_at?: string
  updated_at?: string
}

// ==================== Invoices ====================
export type InvoiceStatus = 'EMITIDA' | 'ANULADA'

export interface Invoice {
  id: number
  id_venta: number
  numero_factura: string
  serie?: string | null
  fecha_emision: string
  nit_receptor: string
  nombre_receptor: string
  direccion_receptor?: string | null
  total: string
  estado: InvoiceStatus
  notas?: string | null
  venta?: Sale
  created_at?: string
  updated_at?: string
}

// ==================== Payments/Collections ====================
export interface Payment {
  id: number
  id_venta: number
  id_usuario_registro: number
  fecha_cobro: string
  monto: string
  metodo_pago?: string | null
  referencia_pago?: string | null
  notas?: string | null
  venta?: Sale
  usuario_registro?: User
}

export interface AccountReceivable {
  id_venta: number
  fecha_venta: string
  cliente?: User | null
  total_venta: number
  total_cobrado: number
  saldo_pendiente: number
  estado_pago: PaymentStatus
}

// ==================== Expenses ====================
export type ExpenseType = 'FIJO' | 'VARIABLE'

export interface Expense {
  id: number
  id_categoria_gasto: number
  id_usuario_registro: number
  fecha_gasto: string
  monto: string
  tipo: ExpenseType
  descripcion?: string | null
  notas?: string | null
  categoria?: ExpenseCategory
  usuario_registro?: User
  created_at?: string
  updated_at?: string
}

// ==================== Inventory ====================
export type LocationType = 'TIENDA' | 'BODEGA' | 'OTRO'

export interface InventoryLocation {
  id: number
  nombre: string
  tipo?: LocationType | null
  direccion?: string | null
  activo: boolean
}

export interface InventoryItem {
  id_presentacion_producto: number
  id_ubicacion: number
  cantidad_disponible: string
  cantidad_reservada: string
  presentacion?: ProductPresentation & { producto?: Product }
  ubicacion?: InventoryLocation
}

// ==================== Suppliers ====================
export interface Supplier {
  id: number
  nombre: string
  nit?: string | null
  telefono?: string | null
  correo?: string | null
  direccion?: string | null
  notas?: string | null
  activo: boolean
  created_at?: string
  updated_at?: string
}

// ==================== Purchases ====================
export interface PurchaseItem {
  id: number
  id_compra: number
  id_presentacion_producto: number
  cantidad_unidad_venta: number
  cantidad_unidad_base: number
  costo_unitario_unidad_venta: string
  costo_unitario_unidad_base: string
  precio_referencia?: string | null
  precio_competencia?: string | null
  fecha_vencimiento?: string | null
  presentacion?: ProductPresentation & { producto?: Product }
}

export interface Purchase {
  id: number
  id_proveedor: number
  id_ubicacion: number
  fecha_compra: string
  numero_documento?: string | null
  subtotal: string
  impuestos: string
  costos_adicionales: string
  total: string
  notas?: string | null
  proveedor?: Supplier
  ubicacion?: InventoryLocation
  detalles?: PurchaseItem[]
  created_at?: string
  updated_at?: string
}

// ==================== Units ====================
export interface Unit {
  id: number
  nombre: string
  abreviatura: string
  activo: boolean
}

// ==================== KPI ====================
export interface FinancialSummary {
  total_ventas: number
  total_gastos: number
  total_compras: number
  utilidad_bruta: number
  periodo: {
    desde: string
    hasta: string
  }
}

export interface DailySales {
  fecha: string
  total: number
  cantidad_ventas: number
}

export interface CategorySales {
  categoria: string
  total: number
  cantidad: number
}

export interface TopProduct {
  id_producto: number
  nombre: string
  cantidad_vendida: number
  total_vendido: number
}

export interface LowStockItem {
  id_producto: number
  nombre: string
  stock_actual: number
  stock_minimo: number
}
