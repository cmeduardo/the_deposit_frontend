import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  ProfileUpdateInput,
  User,
  PaginatedResponse,
  Category,
  ExpenseCategory,
  Product,
  ProductPresentation,
  CatalogProduct,
  CatalogProductDetail,
  Cart,
  CartItemInput,
  ConfirmCartInput,
  Order,
  Sale,
  SaleInput,
  Shipment,
  Invoice,
  Payment,
  AccountReceivable,
  Expense,
  InventoryLocation,
  InventoryItem,
  Supplier,
  Purchase,
  Unit,
  FinancialSummary,
  DailySales,
  CategorySales,
  TopProduct,
  LowStockItem,
} from './types'

const API_BASE_URL = 'https://the-deposit-backend.onrender.com'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  const data = await response.json().catch(() => ({}))
  
  if (!response.ok) {
    throw new ApiError(response.status, data.mensaje || 'Error en la solicitud')
  }
  
  return data as T
}

// ==================== Auth ====================
export const auth = {
  register: (data: RegisterInput) =>
    request<AuthResponse>('/api/autenticacion/registro', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  login: (data: LoginInput) =>
    request<AuthResponse>('/api/autenticacion/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getProfile: () =>
    request<{ usuario: User }>('/api/autenticacion/perfil'),
    
  updateProfile: (data: ProfileUpdateInput) =>
    request<{ mensaje: string; usuario: User }>('/api/autenticacion/perfil', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ==================== Catalog (Public) ====================
export const catalog = {
  getProducts: (params?: {
    page?: number
    limit?: number
    categoria?: number
    busqueda?: string
    marca?: string
    sort?: string
    order?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<CatalogProduct>>(
      `/api/catalogo/productos?${searchParams.toString()}`
    )
  },
  
  getProduct: (id: number) =>
    request<CatalogProductDetail>(`/api/catalogo/productos/${id}`),
    
  getPresentation: (id: number) =>
    request<ProductPresentation>(`/api/catalogo/presentaciones/${id}`),
}

// ==================== Cart ====================
export const cart = {
  getCart: () =>
    request<Cart>('/api/carrito/mi-carrito'),
    
  addItem: (data: CartItemInput) =>
    request<{ mensaje: string; carrito: Cart }>('/api/carrito/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateItem: (id: number, data: Partial<CartItemInput>) =>
    request<{ mensaje: string; carrito: Cart }>(`/api/carrito/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  removeItem: (id: number) =>
    request<{ mensaje: string }>(`/api/carrito/items/${id}`, {
      method: 'DELETE',
    }),
    
  clearCart: () =>
    request<{ mensaje: string }>('/api/carrito/mi-carrito/items', {
      method: 'DELETE',
    }),
    
  confirm: (data: ConfirmCartInput) =>
    request<{ mensaje: string; pedido_id: number; total_general: number }>(
      '/api/carrito/confirmar',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
}

// ==================== Categories ====================
export const categories = {
  products: {
    getAll: () =>
      request<Category[]>('/api/categorias-productos'),
    get: (id: number) =>
      request<Category>(`/api/categorias-productos/${id}`),
    create: (data: { nombre: string; descripcion?: string; activo?: boolean }) =>
      request<{ mensaje: string; categoria: Category }>('/api/categorias-productos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<{ nombre: string; descripcion: string; activo: boolean }>) =>
      request<{ mensaje: string; categoria: Category }>(`/api/categorias-productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ mensaje: string }>(`/api/categorias-productos/${id}`, {
        method: 'DELETE',
      }),
  },
  expenses: {
    getAll: () =>
      request<ExpenseCategory[]>('/api/categorias-gastos'),
    get: (id: number) =>
      request<ExpenseCategory>(`/api/categorias-gastos/${id}`),
    create: (data: { nombre: string; descripcion?: string; tipo_por_defecto?: 'FIJO' | 'VARIABLE'; activo?: boolean }) =>
      request<{ mensaje: string; categoria: ExpenseCategory }>('/api/categorias-gastos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<{ nombre: string; descripcion: string; tipo_por_defecto: 'FIJO' | 'VARIABLE'; activo: boolean }>) =>
      request<{ mensaje: string; categoria: ExpenseCategory }>(`/api/categorias-gastos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ mensaje: string }>(`/api/categorias-gastos/${id}`, {
        method: 'DELETE',
      }),
  },
}

// ==================== Products ====================
export const products = {
  getAll: (params?: {
    page?: number
    limit?: number
    categoria?: number
    busqueda?: string
    activo?: boolean
    sort?: string
    order?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Product>>(
      `/api/productos?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Product>(`/api/productos/${id}`),
  create: (data: Partial<Product>) =>
    request<{ mensaje: string; producto: Product }>('/api/productos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Product>) =>
    request<{ mensaje: string; producto: Product }>(`/api/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ mensaje: string }>(`/api/productos/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== Presentations ====================
export const presentations = {
  getAll: (params?: {
    page?: number
    limit?: number
    id_producto?: number
    activo?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<ProductPresentation>>(
      `/api/presentaciones-productos?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<ProductPresentation>(`/api/presentaciones-productos/${id}`),
  create: (data: Partial<ProductPresentation>) =>
    request<{ mensaje: string; presentacion: ProductPresentation }>('/api/presentaciones-productos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ProductPresentation>) =>
    request<{ mensaje: string; presentacion: ProductPresentation }>(`/api/presentaciones-productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ mensaje: string }>(`/api/presentaciones-productos/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== Orders ====================
export const orders = {
  getAll: (params?: {
    page?: number
    limit?: number
    estado?: string
    id_cliente?: number
    desde?: string
    hasta?: string
    sort?: string
    order?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Order>>(
      `/api/pedidos?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Order>(`/api/pedidos/${id}`),
  cancel: (id: number, notas?: string) =>
    request<{ mensaje: string; pedido: Order }>(`/api/pedidos/${id}/cancelar`, {
      method: 'POST',
      body: JSON.stringify({ notas }),
    }),
}

// ==================== Sales ====================
export const sales = {
  getAll: (params?: {
    page?: number
    limit?: number
    tipo_venta?: 'MOSTRADOR' | 'PEDIDO'
    estado_pago?: string
    id_cliente?: number
    desde?: string
    hasta?: string
    sort?: string
    order?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Sale>>(
      `/api/ventas?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Sale>(`/api/ventas/${id}`),
  create: (data: SaleInput) =>
    request<{ mensaje: string; venta: Sale }>('/api/ventas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== Shipments ====================
export const shipments = {
  getAll: (params?: {
    page?: number
    limit?: number
    estado?: string
    desde?: string
    hasta?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Shipment>>(
      `/api/envios?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Shipment>(`/api/envios/${id}`),
  create: (data: Partial<Shipment>) =>
    request<{ mensaje: string; envio: Shipment }>('/api/envios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Shipment>) =>
    request<{ mensaje: string; envio: Shipment }>(`/api/envios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ==================== Invoices ====================
export const invoices = {
  getAll: (params?: {
    page?: number
    limit?: number
    estado?: string
    desde?: string
    hasta?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Invoice>>(
      `/api/facturas?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Invoice>(`/api/facturas/${id}`),
  getByVenta: (idVenta: number) =>
    request<Invoice>(`/api/facturas/venta/${idVenta}`),
  create: (data: Partial<Invoice>) =>
    request<{ mensaje: string; factura: Invoice }>('/api/facturas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (id: number, motivo?: string) =>
    request<{ mensaje: string; factura: Invoice }>(`/api/facturas/${id}/anular`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    }),
}

// ==================== Payments ====================
export const payments = {
  getAll: (params?: {
    page?: number
    limit?: number
    id_venta?: number
    desde?: string
    hasta?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Payment>>(
      `/api/cobros?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Payment>(`/api/cobros/${id}`),
  create: (data: { id_venta: number; fecha_cobro: string; monto: number; metodo_pago?: string; referencia_pago?: string; notas?: string }) =>
    request<{ mensaje: string; cobro: Payment }>('/api/cobros', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== Accounts Receivable ====================
export const accountsReceivable = {
  getAll: (params?: {
    id_cliente?: number
    estado_pago?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<{ cantidad_ventas: number; total_saldo_pendiente: number; cuentas: AccountReceivable[] }>(
      `/api/cuentas-por-cobrar?${searchParams.toString()}`
    )
  },
}

// ==================== Expenses ====================
export const expenses = {
  getAll: (params?: {
    page?: number
    limit?: number
    id_categoria?: number
    tipo?: 'FIJO' | 'VARIABLE'
    desde?: string
    hasta?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Expense>>(
      `/api/gastos?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Expense>(`/api/gastos/${id}`),
  create: (data: { id_categoria_gasto: number; fecha_gasto: string; monto: number; tipo: 'FIJO' | 'VARIABLE'; descripcion?: string; notas?: string }) =>
    request<{ mensaje: string; gasto: Expense }>('/api/gastos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Expense>) =>
    request<{ mensaje: string; gasto: Expense }>(`/api/gastos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ mensaje: string }>(`/api/gastos/${id}`, {
      method: 'DELETE',
    }),
  getMonthlySummary: (params?: { mes?: number; anio?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<{ mes: number; anio: number; total: number; por_categoria: { categoria: string; total: number }[] }>(
      `/api/gastos/resumen-mensual?${searchParams.toString()}`
    )
  },
}

// ==================== Inventory ====================
export const inventory = {
  getAll: (params?: {
    page?: number
    limit?: number
    id_ubicacion?: number
    id_producto?: number
    bajo_minimo?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<InventoryItem>>(
      `/api/inventario?${searchParams.toString()}`
    )
  },
  adjust: (data: { id_presentacion_producto: number; id_ubicacion: number; cantidad: number; motivo: string }) =>
    request<{ mensaje: string }>('/api/inventario/ajuste', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== Locations ====================
export const locations = {
  getAll: () =>
    request<InventoryLocation[]>('/api/ubicaciones-inventario'),
  get: (id: number) =>
    request<InventoryLocation>(`/api/ubicaciones-inventario/${id}`),
  create: (data: { nombre: string; tipo?: 'TIENDA' | 'BODEGA' | 'OTRO'; direccion?: string; activo?: boolean }) =>
    request<{ mensaje: string; ubicacion: InventoryLocation }>('/api/ubicaciones-inventario', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<InventoryLocation>) =>
    request<{ mensaje: string; ubicacion: InventoryLocation }>(`/api/ubicaciones-inventario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ mensaje: string }>(`/api/ubicaciones-inventario/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== Suppliers ====================
export const suppliers = {
  getAll: (params?: {
    page?: number
    limit?: number
    busqueda?: string
    activo?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Supplier>>(
      `/api/proveedores?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Supplier>(`/api/proveedores/${id}`),
  getByNit: (nit: string) =>
    request<Supplier>(`/api/proveedores/nit/${nit}`),
  create: (data: Partial<Supplier>) =>
    request<{ mensaje: string; proveedor: Supplier }>('/api/proveedores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Supplier>) =>
    request<{ mensaje: string; proveedor: Supplier }>(`/api/proveedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ mensaje: string }>(`/api/proveedores/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== Purchases ====================
export const purchases = {
  getAll: (params?: {
    page?: number
    limit?: number
    id_proveedor?: number
    desde?: string
    hasta?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<Purchase>>(
      `/api/compras?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<Purchase>(`/api/compras/${id}`),
  create: (data: Partial<Purchase> & { detalles: Array<{ id_presentacion_producto: number; cantidad_unidad_venta: number; costo_unitario_unidad_venta: number; precio_referencia?: number; precio_competencia?: number; fecha_vencimiento?: string }> }) =>
    request<{ mensaje: string; compra: Purchase }>('/api/compras', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== Units ====================
export const units = {
  getAll: () =>
    request<Unit[]>('/api/unidades'),
  get: (id: number) =>
    request<Unit>(`/api/unidades/${id}`),
  create: (data: { nombre: string; abreviatura: string; activo?: boolean }) =>
    request<{ mensaje: string; unidad: Unit }>('/api/unidades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Unit>) =>
    request<{ mensaje: string; unidad: Unit }>(`/api/unidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ mensaje: string }>(`/api/unidades/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== Users ====================
export const users = {
  getAll: (params?: {
    page?: number
    limit?: number
    rol?: string
    activo?: boolean
    busqueda?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<PaginatedResponse<User>>(
      `/api/usuarios?${searchParams.toString()}`
    )
  },
  get: (id: number) =>
    request<User>(`/api/usuarios/${id}`),
  create: (data: { nombre: string; correo: string; contrasena: string; rol: string; telefono?: string; nit?: string; direccion?: string; dpi?: string }) =>
    request<{ mensaje: string; usuario: User }>('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<User & { contrasena?: string }>) =>
    request<{ mensaje: string; usuario: User }>(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleStatus: (id: number, activo: boolean) =>
    request<{ mensaje: string; usuario: User }>(`/api/usuarios/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    }),
}

// ==================== KPI ====================
export const kpi = {
  getFinancialSummary: (params?: { desde?: string; hasta?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<FinancialSummary>(
      `/api/kpi/resumen-financiero?${searchParams.toString()}`
    )
  },
  getDailySales: (params?: { desde?: string; hasta?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<DailySales[]>(
      `/api/kpi/ventas-diarias?${searchParams.toString()}`
    )
  },
  getSalesByCategory: (params?: { desde?: string; hasta?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<CategorySales[]>(
      `/api/kpi/ventas-por-categoria?${searchParams.toString()}`
    )
  },
  getTopProducts: (params?: { desde?: string; hasta?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<TopProduct[]>(
      `/api/kpi/top-productos?${searchParams.toString()}`
    )
  },
  getLowStockItems: () =>
    request<LowStockItem[]>('/api/kpi/inventario-bajo-minimo'),
  getExpensesByCategory: (params?: { desde?: string; hasta?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<CategorySales[]>(
      `/api/kpi/gastos-por-categoria?${searchParams.toString()}`
    )
  },
  getInventoryRotation: (params?: { desde?: string; hasta?: string }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return request<{ productos: Array<{ id_producto: number; nombre: string; rotacion: number }> }>(
      `/api/kpi/rotacion-inventario?${searchParams.toString()}`
    )
  },
}

// ==================== Health ====================
export const health = {
  check: () =>
    request<{ status: string; database: string }>('/api/health'),
}

// ==================== Combined API Object ====================
export const api = {
  auth,
  catalog,
  cart,
  categories: categories.products,
  expenseCategories: categories.expenses,
  products,
  presentations,
  orders,
  sales,
  shipments,
  invoices,
  payments,
  accountsReceivable,
  expenses,
  inventory,
  locations,
  suppliers,
  purchases,
  units,
  users,
  kpi,
  health,
}
