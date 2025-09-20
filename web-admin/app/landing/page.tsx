'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  GraduationCap,
  Users,
  Calendar,
  MessageSquare,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  Smartphone,
  Monitor,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Users,
      title: 'Gestión de Estudiantes',
      description: 'Administra información completa de estudiantes, padres y personal docente.',
      color: 'text-blue-600'
    },
    {
      icon: Calendar,
      title: 'Eventos y Calendario',
      description: 'Organiza eventos escolares y mantén a todos informados de las actividades.',
      color: 'text-green-600'
    },
    {
      icon: MessageSquare,
      title: 'Comunicación Directa',
      description: 'Sistema de mensajería integrado entre padres, profesores y administración.',
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Permisos de Salida',
      description: 'Gestiona y aprueba permisos de salida de forma segura y eficiente.',
      color: 'text-orange-600'
    },
    {
      icon: BookOpen,
      title: 'Noticias y Anuncios',
      description: 'Publica y comparte noticias importantes con toda la comunidad escolar.',
      color: 'text-red-600'
    },
    {
      icon: TrendingUp,
      title: 'Reportes y Análisis',
      description: 'Genera reportes detallados y obtén insights sobre el rendimiento escolar.',
      color: 'text-indigo-600'
    }
  ]

  const testimonials = [
    {
      name: 'María García',
      role: 'Directora',
      school: 'Colegio San José',
      content: 'ColeApp ha transformado completamente la forma en que gestionamos nuestro colegio. La comunicación con los padres nunca fue tan eficiente.',
      rating: 5
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Padre de Familia',
      school: 'Instituto Educativo Los Andes',
      content: 'Como padre, puedo estar al tanto de todo lo que sucede con mis hijos en el colegio. La app móvil es increíblemente útil.',
      rating: 5
    },
    {
      name: 'Ana Martínez',
      role: 'Profesora',
      school: 'Escuela Nacional',
      content: 'La plataforma simplifica mi trabajo diario. Puedo gestionar asistencias, enviar tareas y comunicarme con padres desde un solo lugar.',
      rating: 5
    }
  ]

  const stats = [
    { value: '50+', label: 'Colegios Activos' },
    { value: '10,000+', label: 'Estudiantes' },
    { value: '95%', label: 'Satisfacción' },
    { value: '24/7', label: 'Soporte' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ColeApp
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Características
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">
                Testimonios
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Precios
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contacto
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Registrar Colegio
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                Características
              </a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                Testimonios
              </a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                Precios
              </a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                Contacto
              </a>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Registrar Colegio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                La plataforma escolar
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  todo en uno
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Simplifica la gestión escolar, mejora la comunicación y optimiza los procesos educativos
                con nuestra plataforma integral diseñada para colegios modernos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
                    Comienza Gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Ver Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white" />
                  ))}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">+10,000</span> usuarios activos
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl transform rotate-3 opacity-20" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Panel de Control</p>
                    <p className="font-semibold">Colegio San Martín</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {['Estudiantes: 1,250', 'Profesores: 85', 'Eventos activos: 12', 'Mensajes nuevos: 24'].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{item.split(':')[0]}</span>
                      <span className="font-semibold">{item.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tu colegio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma completa que integra todas las herramientas necesarias para la administración escolar moderna
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Accede desde cualquier dispositivo
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Nuestra plataforma está disponible en web y móvil, permitiendo a padres, profesores y
                administradores acceder a la información cuando la necesiten.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Monitor className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Panel Web Administrativo</h3>
                    <p className="text-gray-600">
                      Gestión completa del colegio desde cualquier navegador web
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">App Móvil para Padres</h3>
                    <p className="text-gray-600">
                      Mantén a los padres informados con notificaciones en tiempo real
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Award className="h-8 w-8 text-yellow-500 mb-3" />
                    <p className="font-semibold">Certificado ISO</p>
                    <p className="text-sm text-gray-600">Seguridad garantizada</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Clock className="h-8 w-8 text-green-500 mb-3" />
                    <p className="font-semibold">Ahorro de tiempo</p>
                    <p className="text-sm text-gray-600">-70% en tareas admin</p>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4 mt-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Globe className="h-8 w-8 text-blue-500 mb-3" />
                    <p className="font-semibold">Multi-idioma</p>
                    <p className="text-sm text-gray-600">Español, Inglés y más</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-purple-500 mb-3" />
                    <p className="font-semibold">Multi-tenant</p>
                    <p className="text-sm text-gray-600">Un colegio por cuenta</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600">
              Miles de colegios confían en ColeApp para su gestión diaria
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.school}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tu colegio?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a miles de colegios que ya están usando ColeApp para mejorar su gestión educativa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
                Empieza tu prueba gratis
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                Hablar con ventas
              </Button>
            </Link>
          </div>
          <p className="text-white/80 mt-6 text-sm">
            Sin tarjeta de crédito • 30 días gratis • Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-8 w-8" />
                <span className="text-2xl font-bold">ColeApp</span>
              </div>
              <p className="text-gray-400">
                La plataforma de gestión escolar más completa y fácil de usar.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 ColeApp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}