'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    if (!email || !password || !userType) {
      setErrorMessage('Completa todos los campos para iniciar sesión.')
      setIsLoading(false)
      return
    }

    try {
      const { data: users, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)

      if (fetchError) {
        setErrorMessage('Error al buscar usuario.')
        setIsLoading(false)
        return
      }
      if (!users || users.length === 0) {
        setErrorMessage('Usuario no encontrado.')
        setIsLoading(false)
        return
      }

      const user = users[0]
      if (!user.hashed_password) {
        setErrorMessage('No se encontró contraseña almacenada.')
        setIsLoading(false)
        return
      }

      const passwordMatch = await bcrypt.compare(password, user.hashed_password)
      if (!passwordMatch) {
        setErrorMessage('Contraseña incorrecta.')
        setIsLoading(false)
        return
      }

      if (user.user_type !== userType) {
        setErrorMessage('El tipo de usuario no coincide.')
        setIsLoading(false)
        return
      }

      // Guardar sesión manualmente
      localStorage.setItem('user_id', user.id)

      switch (user.user_type) {
        case 'patient':
          router.push('/dashboard/patient')
          break
        case 'psychologist':
          router.push('/dashboard/psychologist')
          break
        case 'admin':
          router.push('/dashboard/admin')
          break
        default:
          router.push('/')
      }

    } catch (err) {
      console.error(err)
      setErrorMessage('Ocurrió un error al iniciar sesión.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Eunonia</span>
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta para continuar con tu bienestar</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">Tipo de Usuario</Label>
              <Select value={userType} onValueChange={setUserType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Paciente</SelectItem>
                  <SelectItem value="psychologist">Psicólogo</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-purple-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">¿No tienes cuenta? </span>
            <Link href="/auth/register" className="text-sm text-purple-600 hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
