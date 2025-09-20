'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gql, useMutation } from '@apollo/client'
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Phone,
  School,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const REGISTER_WITH_TENANT = gql`
  mutation RegisterWithTenant($input: RegisterWithTenantInput!) {
    registerWithTenant(input: $input) {
      accessToken
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`

const CHECK_SUBDOMAIN = gql`
  query CheckSubdomainAvailability($subdomain: String!) {
    checkSubdomainAvailability(subdomain: $subdomain)
  }
`

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1 - Información del Colegio
    schoolName: '',
    subdomain: '',
    schoolWebsite: '',

    // Paso 2 - Información del Administrador
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)

  const [registerWithTenant, { loading, error }] = useMutation(REGISTER_WITH_TENANT, {
    onCompleted: (data) => {
      // Guardar token y redirigir
      localStorage.setItem('token', data.registerWithTenant.accessToken)
      localStorage.setItem('user', JSON.stringify(data.registerWithTenant.user))
      router.push('/dashboard')
    },
    onError: (error) => {
      console.error('Registration error:', error)
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Formatear subdomain
    if (name === 'subdomain') {
      const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
      setFormData(prev => ({
        ...prev,
        subdomain: formatted
      }))
      setSubdomainAvailable(null)
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'El nombre del colegio es requerido'
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'El subdominio es requerido'
    } else if (formData.subdomain.length < 3) {
      newErrors.subdomain = 'El subdominio debe tener al menos 3 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 2 && validateStep2()) {
      try {
        await registerWithTenant({
          variables: {
            input: {
              schoolName: formData.schoolName,
              subdomain: formData.subdomain,
              schoolWebsite: formData.schoolWebsite || null,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password
            }
          }
        })
      } catch (err) {
        console.error('Error during registration:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Registra tu Colegio en ColeApp
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Únete a la plataforma de gestión escolar más completa
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información del Colegio</h3>

                  <div>
                    <Label htmlFor="schoolName">
                      <School className="inline h-4 w-4 mr-2" />
                      Nombre del Colegio *
                    </Label>
                    <Input
                      id="schoolName"
                      name="schoolName"
                      type="text"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                      placeholder="Ej: Colegio San Martín"
                      className={errors.schoolName ? 'border-red-500' : ''}
                    />
                    {errors.schoolName && (
                      <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subdomain">
                      <Globe className="inline h-4 w-4 mr-2" />
                      Subdominio *
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="subdomain"
                        name="subdomain"
                        type="text"
                        value={formData.subdomain}
                        onChange={handleInputChange}
                        placeholder="mi-colegio"
                        className={`flex-1 ${errors.subdomain ? 'border-red-500' : ''}`}
                      />
                      <span className="text-gray-500">.coleapp.com</span>
                    </div>
                    {errors.subdomain && (
                      <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>
                    )}
                    {formData.subdomain && subdomainAvailable === false && (
                      <p className="text-red-500 text-sm mt-1">Este subdominio ya está en uso</p>
                    )}
                    {formData.subdomain && subdomainAvailable === true && (
                      <p className="text-green-500 text-sm mt-1">¡Subdominio disponible!</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="schoolWebsite">
                      <Globe className="inline h-4 w-4 mr-2" />
                      Sitio Web (opcional)
                    </Label>
                    <Input
                      id="schoolWebsite"
                      name="schoolWebsite"
                      type="url"
                      value={formData.schoolWebsite}
                      onChange={handleInputChange}
                      placeholder="https://www.mi-colegio.edu"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link href="/landing">
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información del Administrador</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">
                        <User className="inline h-4 w-4 mr-2" />
                        Nombre *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Juan"
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">
                        <User className="inline h-4 w-4 mr-2" />
                        Apellido *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Pérez"
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@mi-colegio.edu"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Teléfono *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+51 999 999 999"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">
                        <Lock className="inline h-4 w-4 mr-2" />
                        Contraseña *
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">
                        <Lock className="inline h-4 w-4 mr-2" />
                        Confirmar Contraseña *
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error.message || 'Error al registrar el colegio. Por favor intenta nuevamente.'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? 'Registrando...' : 'Crear Cuenta'}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}