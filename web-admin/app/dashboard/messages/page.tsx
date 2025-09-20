'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Star,
  Reply,
  Forward,
  MoreVertical,
  Send,
  Paperclip,
  Clock,
  CheckCheck,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Mock data
const mockMessages = [
  {
    id: '1',
    sender: 'María García',
    senderRole: 'Profesora',
    avatar: '/avatars/maria.jpg',
    subject: 'Reunión de padres próximo viernes',
    preview: 'Estimados padres, les recordamos que este viernes tendremos la reunión mensual...',
    content: `Estimados padres,

Les recordamos que este viernes tendremos la reunión mensual de padres de familia. Es importante su asistencia ya que trataremos temas importantes sobre el próximo período escolar.

Temas a tratar:
- Evaluaciones del primer trimestre
- Actividades extracurriculares
- Excursión educativa programada
- Cuotas y pagos pendientes

Saludos cordiales,
María García`,
    date: '2025-01-15T10:30:00',
    read: false,
    starred: true,
    important: true,
    category: 'academic',
    attachments: 1,
    replies: 3
  },
  {
    id: '2',
    sender: 'Juan Pérez',
    senderRole: 'Padre de Familia',
    avatar: '/avatars/juan.jpg',
    subject: 'Consulta sobre permiso de salida',
    preview: 'Buenos días, necesito solicitar un permiso de salida anticipada para mi hijo...',
    content: `Buenos días,

Necesito solicitar un permiso de salida anticipada para mi hijo el día martes 20 de enero. Tiene una cita médica importante a las 2:00 PM.

Por favor confirmar si es posible.

Gracias,
Juan Pérez`,
    date: '2025-01-14T14:20:00',
    read: true,
    starred: false,
    important: false,
    category: 'permission',
    attachments: 0,
    replies: 1
  },
  {
    id: '3',
    sender: 'Sistema',
    senderRole: 'Notificación Automática',
    avatar: '/avatars/system.jpg',
    subject: 'Recordatorio: Pago de mensualidad',
    preview: 'Le recordamos que la fecha límite para el pago de la mensualidad es el 20 de enero...',
    content: `Estimado usuario,

Le recordamos que la fecha límite para el pago de la mensualidad es el 20 de enero.

Monto pendiente: S/. 850.00
Fecha límite: 20/01/2025

Puede realizar el pago a través de los siguientes medios:
- Transferencia bancaria
- Pago en ventanilla
- App móvil del colegio

Saludos,
Sistema de Cobranzas`,
    date: '2025-01-14T09:00:00',
    read: true,
    starred: false,
    important: true,
    category: 'administrative',
    attachments: 2,
    replies: 0
  },
  {
    id: '4',
    sender: 'Ana Rodríguez',
    senderRole: 'Coordinadora',
    avatar: '/avatars/ana.jpg',
    subject: 'Actualización del calendario escolar',
    preview: 'Se han realizado algunos cambios en el calendario escolar del presente año...',
    content: `Buenos días a todos,

Se han realizado algunos cambios en el calendario escolar del presente año. Por favor tomar nota:

- 15 de febrero: Día no laborable (feriado local)
- 20-22 de marzo: Evaluaciones bimestrales
- 1 de abril: Inicio de vacaciones de medio año

El calendario actualizado está disponible en el portal del colegio.

Saludos,
Ana Rodríguez`,
    date: '2025-01-13T16:45:00',
    read: false,
    starred: true,
    important: false,
    category: 'announcement',
    attachments: 1,
    replies: 5
  },
  {
    id: '5',
    sender: 'Carlos Mendoza',
    senderRole: 'Profesor',
    avatar: '/avatars/carlos.jpg',
    subject: 'Tarea pendiente de matemáticas',
    preview: 'Varios estudiantes no han entregado la tarea asignada la semana pasada...',
    content: `Estimados padres,

Varios estudiantes no han entregado la tarea de matemáticas asignada la semana pasada. Es importante que supervisen el cumplimiento de las tareas en casa.

Estudiantes pendientes:
- Juan Pérez
- María López
- Pedro García

Fecha límite extendida: 18 de enero

Saludos,
Prof. Carlos Mendoza`,
    date: '2025-01-13T11:30:00',
    read: true,
    starred: false,
    important: false,
    category: 'academic',
    attachments: 0,
    replies: 2
  }
]

const categories = {
  academic: { label: 'Académico', color: 'bg-blue-100 text-blue-800' },
  administrative: { label: 'Administrativo', color: 'bg-purple-100 text-purple-800' },
  permission: { label: 'Permisos', color: 'bg-yellow-100 text-yellow-800' },
  announcement: { label: 'Anuncios', color: 'bg-green-100 text-green-800' },
}

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('inbox')

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === 'inbox') return matchesSearch
    if (activeTab === 'starred') return matchesSearch && message.starred
    if (activeTab === 'important') return matchesSearch && message.important
    if (activeTab === 'sent') return false // No sent messages in mock

    return matchesSearch
  })

  const unreadCount = mockMessages.filter(m => !m.read).length
  const starredCount = mockMessages.filter(m => m.starred).length
  const importantCount = mockMessages.filter(m => m.important).length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Ayer'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('es-PE', { weekday: 'long' })
    } else {
      return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
    }
  }

  const getStatusIcon = (message: typeof mockMessages[0]) => {
    if (!message.read) return <Mail className="h-4 w-4 text-blue-500" />
    if (message.replies > 0) return <CheckCheck className="h-4 w-4 text-green-500" />
    return <Check className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-gray-500 mt-2">
            {unreadCount > 0 ? `${unreadCount} mensajes sin leer` : 'Todos los mensajes leídos'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Mensaje
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Mail className="h-5 w-5 text-blue-600" />
              <Badge variant="secondary">{mockMessages.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Total Mensajes</p>
            <p className="text-2xl font-bold">{mockMessages.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <MailOpen className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-100 text-green-800">{unreadCount}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Sin Leer</p>
            <p className="text-2xl font-bold">{unreadCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Star className="h-5 w-5 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-800">{starredCount}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Destacados</p>
            <p className="text-2xl font-bold">{starredCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Send className="h-5 w-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800">0</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Enviados Hoy</p>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages Interface */}
      <Card className="h-[700px]">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-96 border-r flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b h-auto p-0">
                <TabsTrigger
                  value="inbox"
                  className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Entrada
                  {unreadCount > 0 && (
                    <Badge className="ml-2 h-5 px-1" variant="secondary">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="starred"
                  className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Destacados
                </TabsTrigger>
                <TabsTrigger
                  value="important"
                  className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Importante
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                >
                  Enviados
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors mb-2",
                        "hover:bg-gray-50",
                        selectedMessage?.id === message.id && "bg-blue-50",
                        !message.read && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.avatar} />
                          <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "text-sm",
                                !message.read ? "font-semibold" : "font-medium"
                              )}>
                                {message.sender}
                              </p>
                              {message.starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(message)}
                              <span className="text-xs text-gray-500">{formatDate(message.date)}</span>
                            </div>
                          </div>
                          <p className={cn(
                            "text-sm mb-1",
                            !message.read ? "font-semibold text-gray-900" : "text-gray-700"
                          )}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{message.preview}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="secondary"
                              className={cn("text-xs", categories[message.category as keyof typeof categories].color)}
                            >
                              {categories[message.category as keyof typeof categories].label}
                            </Badge>
                            {message.attachments > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Paperclip className="h-3 w-3" />
                                {message.attachments}
                              </div>
                            )}
                            {message.replies > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Reply className="h-3 w-3" />
                                {message.replies}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Message Content */}
          {selectedMessage ? (
            <div className="flex-1 flex flex-col">
              {/* Message Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedMessage.avatar} />
                      <AvatarFallback>{selectedMessage.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedMessage.sender}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {selectedMessage.senderRole}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedMessage.date).toLocaleString('es-PE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Star className={cn(
                        "h-4 w-4",
                        selectedMessage.starred && "text-yellow-500 fill-yellow-500"
                      )} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Reply className="h-4 w-4 mr-2" />
                          Responder
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Forward className="h-4 w-4 mr-2" />
                          Reenviar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Marcar como no leído
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Mover a carpeta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <ScrollArea className="flex-1 p-6">
                <h2 className="text-xl font-semibold mb-4">{selectedMessage.subject}</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.content}</p>
                </div>

                {selectedMessage.attachments > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Archivos adjuntos ({selectedMessage.attachments})
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-white rounded border">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">documento.pdf</span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Reply Section */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Reply className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
                  <Button variant="outline">
                    <Forward className="h-4 w-4 mr-2" />
                    Reenviar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona un mensaje para ver su contenido</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}