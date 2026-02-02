'use client'

import React from "react"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { auth } from '@/lib/api'
import { toast } from 'sonner'

export default function MyAccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    nit: '',
    direccion: '',
    dpi: '',
    contrasena: '',
    confirmarContrasena: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
        nit: user.nit || '',
        direccion: user.direccion || '',
        dpi: user.dpi || '',
        contrasena: '',
        confirmarContrasena: '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.contrasena && formData.contrasena !== formData.confirmarContrasena) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.contrasena && formData.contrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      const updateData: Record<string, string | null> = {
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono || null,
        nit: formData.nit || null,
        direccion: formData.direccion || null,
        dpi: formData.dpi || null,
      }
      
      if (formData.contrasena) {
        updateData.contrasena = formData.contrasena
      }

      await auth.updateProfile(updateData)
      await refreshUser()
      toast.success('Perfil actualizado correctamente')
      setFormData(prev => ({ ...prev, contrasena: '', confirmarContrasena: '' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar perfil')
    } finally {
      setIsLoading(false)
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
    router.push('/iniciar-sesion')
    return null
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold">Mi Cuenta</h1>
          <p className="mt-1 text-muted-foreground">
            Administra tu información personal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tus datos de contacto y facturación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo electrónico *</Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    disabled={isLoading}
                    placeholder="Ej: 5555-5555"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT</Label>
                  <Input
                    id="nit"
                    value={formData.nit}
                    onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                    disabled={isLoading}
                    placeholder="CF o número de NIT"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Tu dirección de entrega"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dpi">DPI</Label>
                <Input
                  id="dpi"
                  value={formData.dpi}
                  onChange={(e) => setFormData(prev => ({ ...prev, dpi: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Número de DPI"
                />
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-semibold">Cambiar Contraseña</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Deja estos campos vacíos si no deseas cambiar tu contraseña
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contrasena">Nueva contraseña</Label>
                    <Input
                      id="contrasena"
                      type="password"
                      value={formData.contrasena}
                      onChange={(e) => setFormData(prev => ({ ...prev, contrasena: e.target.value }))}
                      disabled={isLoading}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmarContrasena">Confirmar contraseña</Label>
                    <Input
                      id="confirmarContrasena"
                      type="password"
                      value={formData.confirmarContrasena}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmarContrasena: e.target.value }))}
                      disabled={isLoading}
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button asChild variant="outline">
                  <Link href="/">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
