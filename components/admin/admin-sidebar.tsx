'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  CreditCard,
  Wallet,
  Users,
  Truck,
  FileText,
  Settings,
  Store,
  BarChart3,
  Tags,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { ScrollArea } from '@/components/ui/scroll-area'

const navigation = [
  {
    title: 'Principal',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'POS', href: '/admin/pos', icon: Store },
    ],
  },
  {
    title: 'Pedidos',
    items: [
      { name: 'Pedidos Online', href: '/admin/pedidos', icon: ShoppingCart },
      { name: 'Envíos', href: '/admin/envios', icon: Truck },
    ],
  },
  {
    title: 'Inventario',
    items: [
      { name: 'Productos', href: '/admin/productos', icon: Package },
      { name: 'Categorías', href: '/admin/categorias', icon: Tags },
      { name: 'Inventario', href: '/admin/inventario', icon: Boxes },
      { name: 'Proveedores', href: '/admin/proveedores', icon: Building2 },
      { name: 'Compras', href: '/admin/compras', icon: Receipt },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { name: 'Ventas', href: '/admin/ventas', icon: CreditCard },
      { name: 'Cobros', href: '/admin/cobros', icon: Wallet },
      { name: 'Gastos', href: '/admin/gastos', icon: Receipt },
      { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
      { name: 'Facturas', href: '/admin/facturas', icon: FileText },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { name: 'Usuarios', href: '/admin/usuarios', icon: Users, adminOnly: true },
      { name: 'Configuración', href: '/admin/configuracion', icon: Settings, adminOnly: true },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const isAdmin = user?.rol === 'ADMINISTRADOR'

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Image
          src="/logo.png"
          alt="The Deposit"
          width={32}
          height={32}
          className="rounded-full bg-sidebar-foreground p-0.5"
        />
        <div>
          <span className="font-mono text-sm font-bold text-sidebar-foreground">
            THE DEPOSIT
          </span>
          <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.adminOnly || isAdmin
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={group.title}>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/admin' && pathname.startsWith(item.href))
                    
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
        >
          <Store className="h-4 w-4" />
          Ir a la tienda
        </Link>
      </div>
    </aside>
  )
}
