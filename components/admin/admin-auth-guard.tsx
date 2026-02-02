'use client'

import React from "react"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const isAdmin = user?.rol === 'ADMINISTRADOR'
  const isVendedor = user?.rol === 'VENDEDOR'
  const hasAccess = isAdmin || isVendedor

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/iniciar-sesion')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!hasAccess) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Acceso Denegado</h1>
        <p className="max-w-md text-muted-foreground">
          No tienes permisos para acceder al panel de administración.
          Solo los administradores y vendedores pueden acceder a esta sección.
        </p>
        <Button asChild>
          <Link href="/">Volver a la tienda</Link>
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
