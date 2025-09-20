'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Download,
  Eye,
  Check,
  X,
  FileText,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const mockPermissions = [
  {
    id: '1',
    studentName: 'Juan Pérez García',
    studentGrade: '5to A',
    studentAvatar: '/avatars/student1.jpg',
    parentName: 'María Pérez',
    parentPhone: '+51 999 888 777',
    requestDate: '2025-01-15T09:30:00',
    exitDate: '2025-01-16',
    exitTime: '14:00',
    returnTime: '15:30',
    reason: 'Cita médica con el dentista',
    authorizedPerson: 'María Pérez (Madre)',
    authorizedPersonDNI: '12345678',
    status: 'pending',
    priority: 'normal',
    attachments: ['permiso_medico.pdf'],
    notes: 'Cita programada desde hace un mes'
  },
  {
    id: '2',
    studentName: 'Ana López Martínez',
    studentGrade: '6to B',
    studentAvatar: '/avatars/student2.jpg',
    parentName: 'Carlos López',
    parentPhone: '+51 987 654 321',
    requestDate: '2025-01-14T14:20:00',
    exitDate: '2025-01-15',
    exitTime: '11:00',
    returnTime: 'No retorna',
    reason: 'Viaje familiar urgente',
    authorizedPerson: 'Carlos López (Padre)',
    authorizedPersonDNI: '87654321',
    status: 'approved',
    priority: 'high',
    attachments: [],
    notes: 'Viaje por emergencia familiar',
    approvedBy: 'Director Juan Rodríguez',
    approvedDate: '2025-01-14T16:00:00'
  },
  {
    id: '3',
    studentName: 'Pedro Gonzáles Silva',
    studentGrade: '4to C',
    studentAvatar: '/avatars/student3.jpg',
    parentName: 'Rosa Gonzáles',
    parentPhone: '+51 923 456 789',
    requestDate: '2025-01-13T11:00:00',
    exitDate: '2025-01-14',
    exitTime: '10:00',
    returnTime: '12:00',
    reason: 'Trámite de pasaporte',
    authorizedPerson: 'Rosa Gonzáles (Madre)',
    authorizedPersonDNI: '23456789',
    status: 'rejected',
    priority: 'normal',
    attachments: [],
    notes: '',
    rejectedBy: 'Coordinador Miguel Sánchez',
    rejectedDate: '2025-01-13T15:30:00',
    rejectionReason: 'No se presentó la documentación requerida con anticipación'
  },
  {
    id: '4',
    studentName: 'Lucía Ramírez Torres',
    studentGrade: '3ro A',
    studentAvatar: '/avatars/student4.jpg',
    parentName: 'Jorge Ramírez',
    parentPhone: '+51 912 345 678',
    requestDate: '2025-01-15T08:00:00',
    exitDate: '2025-01-17',
    exitTime: '09:00',
    returnTime: '13:00',
    reason: 'Competencia deportiva regional',
    authorizedPerson: 'Entrenador Luis Vargas',
    authorizedPersonDNI: '34567890',
    status: 'pending',
    priority: 'high',
    attachments: ['invitacion_competencia.pdf', 'autorizacion_padres.pdf'],
    notes: 'Representará al colegio en natación'
  },
  {
    id: '5',
    studentName: 'Diego Fernández Ruiz',
    studentGrade: '2do B',
    studentAvatar: '/avatars/student5.jpg',
    parentName: 'Carmen Fernández',
    parentPhone: '+51 901 234 567',
    requestDate: '2025-01-12T10:30:00',
    exitDate: '2025-01-12',
    exitTime: '15:00',
    returnTime: 'No retorna',
    reason: 'Cita médica de control',
    authorizedPerson: 'Carmen Fernández (Madre)',
    authorizedPersonDNI: '45678901',
    status: 'completed',
    priority: 'normal',
    attachments: ['orden_medica.pdf'],
    notes: 'Control post-operatorio',
    approvedBy: 'Director Juan Rodríguez',
    approvedDate: '2025-01-12T10:45:00',
    completedDate: '2025-01-12T15:05:00'
  }
]

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Aprobado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Completado', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
}

const priorityConfig = {
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
}

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [selectedPermission, setSelectedPermission] = useState<typeof mockPermissions[0] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [actionReason, setActionReason] = useState('')

  const filteredPermissions = mockPermissions.filter(permission => {
    const matchesSearch =
      permission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || permission.status === statusFilter
    const matchesGrade = gradeFilter === 'all' || permission.studentGrade === gradeFilter

    return matchesSearch && matchesStatus && matchesGrade
  })

  const pendingCount = mockPermissions.filter(p => p.status === 'pending').length
  const approvedCount = mockPermissions.filter(p => p.status === 'approved').length
  const rejectedCount = mockPermissions.filter(p => p.status === 'rejected').length
  const completedCount = mockPermissions.filter(p => p.status === 'completed').length

  const handleAction = (permission: typeof mockPermissions[0], action: 'approve' | 'reject') => {
    setSelectedPermission(permission)
    setActionType(action)
    setDialogOpen(true)
  }

  const confirmAction = () => {
    console.log(`${actionType} permission ${selectedPermission?.id} with reason: ${actionReason}`)
    setDialogOpen(false)
    setActionReason('')
    setSelectedPermission(null)
    setActionType(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permisos de Salida</h1>
          <p className="text-gray-500 mt-2">
            Gestiona y aprueba los permisos de salida de estudiantes
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Permiso
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-800">{pendingCount}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-100 text-green-800">{approvedCount}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Aprobados</p>
            <p className="text-2xl font-bold">{approvedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <XCircle className="h-5 w-5 text-red-600" />
              <Badge className="bg-red-100 text-red-800">{rejectedCount}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Rechazados</p>
            <p className="text-2xl font-bold">{rejectedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <Badge variant="secondary">{completedCount}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Completados</p>
            <p className="text-2xl font-bold">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por estudiante, padre o motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grados</SelectItem>
                <SelectItem value="1ro A">1ro A</SelectItem>
                <SelectItem value="2do B">2do B</SelectItem>
                <SelectItem value="3ro A">3ro A</SelectItem>
                <SelectItem value="4to C">4to C</SelectItem>
                <SelectItem value="5to A">5to A</SelectItem>
                <SelectItem value="6to B">6to B</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Fecha Salida</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Autorizado por</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map((permission) => {
                const StatusIcon = statusConfig[permission.status as keyof typeof statusConfig].icon
                return (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={permission.studentAvatar} />
                          <AvatarFallback>
                            {permission.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{permission.studentName}</p>
                          <p className="text-sm text-gray-500">{permission.studentGrade}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(permission.exitDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Salida: {permission.exitTime}</p>
                        <p className="text-gray-500">Retorno: {permission.returnTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-xs truncate">{permission.reason}</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{permission.authorizedPerson}</p>
                        <p className="text-gray-500">DNI: {permission.authorizedPersonDNI}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[permission.status as keyof typeof statusConfig].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[permission.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityConfig[permission.priority as keyof typeof priorityConfig].color}>
                        {priorityConfig[permission.priority as keyof typeof priorityConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {permission.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleAction(permission, 'approve')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleAction(permission, 'reject')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Ver adjuntos
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Descargar permiso
                            </DropdownMenuItem>
                            {permission.status === 'approved' && (
                              <DropdownMenuItem>
                                <XCircle className="h-4 w-4 mr-2" />
                                Revocar permiso
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Aprobar Permiso' : 'Rechazar Permiso'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Estás por aprobar este permiso de salida. Puedes agregar observaciones si lo deseas.'
                : 'Por favor indica el motivo del rechazo del permiso.'}
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedPermission.studentAvatar} />
                    <AvatarFallback>
                      {selectedPermission.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedPermission.studentName}</p>
                    <p className="text-sm text-gray-500">{selectedPermission.studentGrade}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha:</span>
                    <span>{formatDate(selectedPermission.exitDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Horario:</span>
                    <span>{selectedPermission.exitTime} - {selectedPermission.returnTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Motivo:</span>
                    <span className="text-right max-w-xs">{selectedPermission.reason}</span>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="reason">
                  {actionType === 'approve' ? 'Observaciones (opcional)' : 'Motivo del rechazo *'}
                </Label>
                <Textarea
                  id="reason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={actionType === 'approve'
                    ? 'Agregar observaciones...'
                    : 'Ingrese el motivo del rechazo...'}
                  rows={3}
                  required={actionType === 'reject'}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={actionType === 'reject' && !actionReason}
            >
              {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}