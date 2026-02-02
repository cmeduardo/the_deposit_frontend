'use client'

import React from "react"

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, ShoppingCart, User, Search, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { useRouter, useSearchParams } from 'next/navigation'

export function StoreHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('busqueda') || '')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/productos?busqueda=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/productos')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="The Deposit"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="hidden font-mono text-lg font-bold tracking-tight sm:block">
              THE DEPOSIT
            </span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4"
              />
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/productos"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Productos
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/carrito">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
                <span className="sr-only">Carrito</span>
              </Link>
            </Button>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Mi cuenta</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.nombre}</p>
                      <p className="text-xs text-muted-foreground">{user?.correo}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/mi-cuenta">Mi Cuenta</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mis-pedidos">Mis Pedidos</Link>
                    </DropdownMenuItem>
                    {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'VENDEDOR') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Panel de Administración</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link href="/iniciar-sesion">Iniciar Sesión</Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <div className="flex flex-col gap-6 pt-6">
                  {/* Search - Mobile */}
                  <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>

                  {/* User Info */}
                  {isAuthenticated && (
                    <div className="border-b border-border pb-4">
                      <p className="font-medium">{user?.nombre}</p>
                      <p className="text-sm text-muted-foreground">{user?.correo}</p>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-2">
                    <Link
                      href="/productos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      Productos
                    </Link>
                    <Link
                      href="/carrito"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      Carrito {itemCount > 0 && `(${itemCount})`}
                    </Link>
                    {isAuthenticated ? (
                      <>
                        <Link
                          href="/mi-cuenta"
                          onClick={() => setMobileMenuOpen(false)}
                          className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          Mi Cuenta
                        </Link>
                        <Link
                          href="/mis-pedidos"
                          onClick={() => setMobileMenuOpen(false)}
                          className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          Mis Pedidos
                        </Link>
                        {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'VENDEDOR') && (
                          <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                          >
                            Panel de Administración
                          </Link>
                        )}
                        <button
                          onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/iniciar-sesion"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Iniciar Sesión
                      </Link>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
