'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  Store,
  ChevronRight,
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
  BarChart3,
  Tags,
  Building2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'POS', href: '/admin/pos', icon: Store },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Envíos', href: '/admin/envios', icon: Truck },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Categorías', href: '/admin/categorias', icon: Tags },
  { name: 'Inventario', href: '/admin/inventario', icon: Boxes },
  { name: 'Proveedores', href: '/admin/proveedores', icon: Building2 },
  { name: 'Compras', href: '/admin/compras', icon: Receipt },
  { name: 'Ventas', href: '/admin/ventas', icon: CreditCard },
  { name: 'Cobros', href: '/admin/cobros', icon: Wallet },
  { name: 'Gastos', href: '/admin/gastos', icon: Receipt },
  { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
  { name: 'Facturas', href: '/admin/facturas', icon: FileText },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users, adminOnly: true },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings, adminOnly: true },
]

const pathTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/pos': 'Punto de Venta',
  '/admin/pedidos': 'Pedidos Online',
  '/admin/envios': 'Envíos',
  '/admin/productos': 'Productos',
  '/admin/categorias': 'Categorías',
  '/admin/inventario': 'Inventario',
  '/admin/proveedores': 'Proveedores',
  '/admin/compras': 'Compras',
  '/admin/ventas': 'Ventas',
  '/admin/cobros': 'Cobros',
  '/admin/gastos': 'Gastos',
  '/admin/reportes': 'Reportes',
  '/admin/facturas': 'Facturas',
  '/admin/usuarios': 'Usuarios',
  '/admin/configuracion': 'Configuración',
}

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = user?.rol === 'ADMINISTRADOR'
  const currentTitle = pathTitles[pathname] || 'Admin'

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      {/* Mobile Menu + Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
              <Image
                src="/logo.png"
                alt="The Deposit"
                width={32}
                height={32}
                className="rounded-full bg-sidebar-foreground p-0.5"
              />
              <span className="font-mono text-sm font-bold text-sidebar-foreground">
                THE DEPOSIT
              </span>
            </div>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <nav className="space-y-1 p-4">
                {navigation.map((item) => {
                  if (item.adminOnly && !isAdmin) return null
                  const isActive = pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
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
                  )
                })}
                <div className="my-4 border-t border-sidebar-border" />
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                >
                  <Store className="h-4 w-4 shrink-0" />
                  Ir a la tienda
                </Link>
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Page Title */}
        <div>
          <h1 className="font-semibold">{currentTitle}</h1>
          <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>{currentTitle}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium">{user?.nombre}</p>
                <p className="text-xs text-muted-foreground">{user?.rol}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground">{user?.correo}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/mi-cuenta">
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin/configuracion">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <Store className="mr-2 h-4 w-4" />
                Ir a la tienda
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
