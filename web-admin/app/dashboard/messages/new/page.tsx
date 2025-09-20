'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Paperclip, X, Users, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Mock data for recipients
const mockRecipients = {
  individual: [
    { id: '1', name: 'Juan Pérez', role: 'Padre de Familia', email: 'juan.perez@email.com', avatar: '/avatars/juan.jpg' },
    { id: '2', name: 'María García', role: 'Profesora', email: 'maria.garcia@email.com', avatar: '/avatars/maria.jpg' },
    { id: '3', name: 'Carlos López', role: 'Estudiante', email: 'carlos.lopez@email.com', avatar: '/avatars/carlos.jpg' },
    { id: '4', name: 'Ana Rodríguez', role: 'Coordinadora', email: 'ana.rodriguez@email.com', avatar: '/avatars/ana.jpg' },
    { id: '5', name: 'Pedro Martínez', role: 'Padre de Familia', email: 'pedro.martinez@email.com', avatar: '/avatars/pedro.jpg' },
  ],
  groups: [
    { id: 'g1', name: 'Todos los Profesores', count: 25, icon: '👨‍🏫' },
    { id: 'g2', name: 'Padres de 5to Grado', count: 45, icon: '👨‍👩‍👧‍👦' },
    { id: 'g3', name: 'Estudiantes de Primaria', count: 180, icon: '🎒' },
    { id: 'g4', name: 'Personal Administrativo', count: 12, icon: '💼' },
    { id: 'g5', name: 'Todos los Padres', count: 350, icon: '👪' },
  ],
  classes: [
    { id: 'c1', name: '5to A', students: 28 },
    { id: 'c2', name: '5to B', students: 30 },
    { id: 'c3', name: '6to A', students: 27 },
    { id: 'c4', name: '6to B', students: 29 },
  ]
}

export default function NewMessagePage() {
  const router = useRouter()
  const [recipientType, setRecipientType] = useState('individual')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')
  const [requestReply, setRequestReply] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [scheduleMessage, setScheduleMessage] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({
      recipientType,
      selectedRecipients,
      subject,
      message,
      priority,
      requestReply,
      attachments,
      scheduleMessage,
      scheduleDate,
      scheduleTime
    })
    router.push('/messages')
  }

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    )
  }

  const handleAddAttachment = () => {
    // Simulate file attachment
    const fileName = `archivo_${attachments.length + 1}.pdf`
    setAttachments([...attachments, fileName])
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const getFilteredRecipients = () => {
    if (recipientType === 'individual') {
      return mockRecipients.individual.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else if (recipientType === 'group') {
      return mockRecipients.groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else {
      return mockRecipients.classes.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  }

  const getSelectedRecipientsCount = () => {
    if (recipientType === 'individual') {
      return selectedRecipients.length
    } else if (recipientType === 'group') {
      return mockRecipients.groups
        .filter(g => selectedRecipients.includes(g.id))
        .reduce((acc, g) => acc + g.count, 0)
    } else {
      return mockRecipients.classes
        .filter(c => selectedRecipients.includes(c.id))
        .reduce((acc, c) => acc + c.students, 0)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/messages')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Mensaje</h1>
          <p className="text-gray-500 mt-1">Redacta y envía un mensaje a la comunidad escolar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipients Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Destinatarios</CardTitle>
            <CardDescription>Selecciona a quién enviar el mensaje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient Type */}
            <div>
              <Label>Tipo de destinatario</Label>
              <RadioGroup value={recipientType} onValueChange={setRecipientType} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="font-normal cursor-pointer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Individual
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="group" id="group" />
                  <Label htmlFor="group" className="font-normal cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Grupos
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="class" id="class" />
                  <Label htmlFor="class" className="font-normal cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Clases
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Buscar ${recipientType === 'individual' ? 'personas' : recipientType === 'group' ? 'grupos' : 'clases'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Recipients List */}
            <ScrollArea className="h-64 border rounded-lg p-4">
              <div className="space-y-2">
                {recipientType === 'individual' && getFilteredRecipients().map((recipient: any) => (
                  <div
                    key={recipient.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedRecipients.includes(recipient.id)}
                      onCheckedChange={() => handleRecipientToggle(recipient.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={recipient.avatar} />
                      <AvatarFallback>{recipient.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{recipient.name}</p>
                      <p className="text-xs text-gray-500">{recipient.role}</p>
                    </div>
                  </div>
                ))}

                {recipientType === 'group' && getFilteredRecipients().map((group: any) => (
                  <div
                    key={group.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedRecipients.includes(group.id)}
                      onCheckedChange={() => handleRecipientToggle(group.id)}
                    />
                    <div className="w-8 h-8 flex items-center justify-center text-lg">
                      {group.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.count} miembros</p>
                    </div>
                  </div>
                ))}

                {recipientType === 'class' && getFilteredRecipients().map((cls: any) => (
                  <div
                    key={cls.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedRecipients.includes(cls.id)}
                      onCheckedChange={() => handleRecipientToggle(cls.id)}
                    />
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded font-semibold text-sm">
                      {cls.name.split(' ')[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Clase {cls.name}</p>
                      <p className="text-xs text-gray-500">{cls.students} estudiantes</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Selected Recipients Count */}
            {selectedRecipients.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  {selectedRecipients.length} {recipientType === 'individual' ? 'destinatarios' : recipientType === 'group' ? 'grupos' : 'clases'} seleccionados
                </span>
                <Badge className="bg-blue-600">
                  {getSelectedRecipientsCount()} receptores totales
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Content */}
        <Card>
          <CardHeader>
            <CardTitle>Contenido del Mensaje</CardTitle>
            <CardDescription>Redacta el mensaje que deseas enviar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div>
              <Label htmlFor="subject">Asunto *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ingresa el asunto del mensaje"
                required
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{message.length} caracteres</p>
            </div>

            {/* Priority */}
            <div>
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attachments */}
            <div>
              <Label>Archivos adjuntos</Label>
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{file}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttachment}
                  className="gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  Adjuntar archivo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Opciones de Envío</CardTitle>
            <CardDescription>Configura opciones adicionales para el mensaje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Request Reply */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="request-reply">Solicitar respuesta</Label>
                <p className="text-sm text-gray-500">Los destinatarios verán que se espera una respuesta</p>
              </div>
              <Switch
                id="request-reply"
                checked={requestReply}
                onCheckedChange={setRequestReply}
              />
            </div>

            {/* Schedule Message */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="schedule">Programar envío</Label>
                  <p className="text-sm text-gray-500">Enviar el mensaje en una fecha y hora específica</p>
                </div>
                <Switch
                  id="schedule"
                  checked={scheduleMessage}
                  onCheckedChange={setScheduleMessage}
                />
              </div>

              {scheduleMessage && (
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div>
                    <Label htmlFor="schedule-date">Fecha</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      required={scheduleMessage}
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-time">Hora</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      required={scheduleMessage}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/messages')}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
          >
            Guardar borrador
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={selectedRecipients.length === 0 || !subject || !message}
          >
            <Send className="h-4 w-4 mr-2" />
            {scheduleMessage ? 'Programar envío' : 'Enviar mensaje'}
          </Button>
        </div>
      </form>
    </div>
  )
}