'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, User, FileText, AlertCircle, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

// Mock data for students
const mockStudents = [
  { id: '1', name: 'Juan Pérez García', grade: '5to A', dni: '12345678' },
  { id: '2', name: 'Ana López Martínez', grade: '6to B', dni: '23456789' },
  { id: '3', name: 'Pedro Gonzáles Silva', grade: '4to C', dni: '34567890' },
  { id: '4', name: 'Lucía Ramírez Torres', grade: '3ro A', dni: '45678901' },
  { id: '5', name: 'Diego Fernández Ruiz', grade: '2do B', dni: '56789012' },
]

export default function NewPermissionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    studentId: '',
    exitDate: '',
    exitTime: '',
    returnType: 'returns',
    returnTime: '',
    reason: '',
    reasonCategory: '',
    authorizedPersonName: '',
    authorizedPersonRelation: '',
    authorizedPersonDNI: '',
    authorizedPersonPhone: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    priority: 'normal',
    attachments: [] as string[],
    additionalNotes: '',
    notifyParent: true,
    requireMedicalCertificate: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    router.push('/permissions')
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addAttachment = () => {
    const fileName = `documento_${formData.attachments.length + 1}.pdf`
    handleInputChange('attachments', [...formData.attachments, fileName])
  }

  const removeAttachment = (index: number) => {
    handleInputChange('attachments', formData.attachments.filter((_, i) => i !== index))
  }

  const selectedStudent = mockStudents.find(s => s.id === formData.studentId)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/permissions')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Permiso de Salida</h1>
          <p className="text-gray-500 mt-1">Registra una solicitud de permiso de salida para un estudiante</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Estudiante</CardTitle>
            <CardDescription>Selecciona el estudiante que solicita el permiso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="student">Estudiante *</Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => handleInputChange('studentId', value)}
                required
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{student.name}</span>
                        <Badge variant="secondary" className="ml-2">{student.grade}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p><strong>Estudiante:</strong> {selectedStudent.name}</p>
                    <p><strong>Grado:</strong> {selectedStudent.grade}</p>
                    <p><strong>DNI:</strong> {selectedStudent.dni}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Exit Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Salida</CardTitle>
            <CardDescription>Especifica la fecha, hora y motivo de la salida</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exitDate">Fecha de salida *</Label>
                <Input
                  id="exitDate"
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => handleInputChange('exitDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="exitTime">Hora de salida *</Label>
                <Input
                  id="exitTime"
                  type="time"
                  value={formData.exitTime}
                  onChange={(e) => handleInputChange('exitTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Tipo de retorno</Label>
              <RadioGroup
                value={formData.returnType}
                onValueChange={(value) => handleInputChange('returnType', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="returns" id="returns" />
                  <Label htmlFor="returns" className="font-normal cursor-pointer">
                    El estudiante retornará el mismo día
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-return" id="no-return" />
                  <Label htmlFor="no-return" className="font-normal cursor-pointer">
                    El estudiante no retornará el mismo día
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.returnType === 'returns' && (
              <div>
                <Label htmlFor="returnTime">Hora de retorno estimada *</Label>
                <Input
                  id="returnTime"
                  type="time"
                  value={formData.returnTime}
                  onChange={(e) => handleInputChange('returnTime', e.target.value)}
                  required={formData.returnType === 'returns'}
                />
              </div>
            )}

            <div>
              <Label htmlFor="reasonCategory">Categoría del motivo *</Label>
              <Select
                value={formData.reasonCategory}
                onValueChange={(value) => handleInputChange('reasonCategory', value)}
                required
              >
                <SelectTrigger id="reasonCategory">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Médico</SelectItem>
                  <SelectItem value="family">Familiar</SelectItem>
                  <SelectItem value="academic">Académico</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="emergency">Emergencia</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Motivo detallado *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Describe el motivo de la salida..."
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Sé específico sobre el motivo de la salida</p>
            </div>

            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Authorized Person */}
        <Card>
          <CardHeader>
            <CardTitle>Persona Autorizada</CardTitle>
            <CardDescription>Información de quien recogerá al estudiante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorizedName">Nombre completo *</Label>
                <Input
                  id="authorizedName"
                  value={formData.authorizedPersonName}
                  onChange={(e) => handleInputChange('authorizedPersonName', e.target.value)}
                  placeholder="Nombre de la persona autorizada"
                  required
                />
              </div>
              <div>
                <Label htmlFor="authorizedRelation">Relación con el estudiante *</Label>
                <Select
                  value={formData.authorizedPersonRelation}
                  onValueChange={(value) => handleInputChange('authorizedPersonRelation', value)}
                  required
                >
                  <SelectTrigger id="authorizedRelation">
                    <SelectValue placeholder="Selecciona la relación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Madre</SelectItem>
                    <SelectItem value="father">Padre</SelectItem>
                    <SelectItem value="guardian">Tutor/a</SelectItem>
                    <SelectItem value="grandparent">Abuelo/a</SelectItem>
                    <SelectItem value="uncle-aunt">Tío/a</SelectItem>
                    <SelectItem value="authorized">Persona autorizada</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorizedDNI">DNI *</Label>
                <Input
                  id="authorizedDNI"
                  value={formData.authorizedPersonDNI}
                  onChange={(e) => handleInputChange('authorizedPersonDNI', e.target.value)}
                  placeholder="Número de DNI"
                  maxLength={8}
                  required
                />
              </div>
              <div>
                <Label htmlFor="authorizedPhone">Teléfono *</Label>
                <Input
                  id="authorizedPhone"
                  type="tel"
                  value={formData.authorizedPersonPhone}
                  onChange={(e) => handleInputChange('authorizedPersonPhone', e.target.value)}
                  placeholder="+51 999 999 999"
                  required
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                La persona autorizada deberá presentar su DNI al momento de recoger al estudiante.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Parent/Guardian Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto del Padre/Tutor</CardTitle>
            <CardDescription>Información de contacto para confirmación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="parentName">Nombre del padre/tutor *</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => handleInputChange('parentName', e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentPhone">Teléfono *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  placeholder="+51 999 999 999"
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentEmail">Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyParent">Notificar al padre/tutor</Label>
                <p className="text-sm text-gray-500">Enviar notificación por SMS y email</p>
              </div>
              <Switch
                id="notifyParent"
                checked={formData.notifyParent}
                onCheckedChange={(checked) => handleInputChange('notifyParent', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
            <CardDescription>Documentos y observaciones opcionales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Documentos adjuntos</Label>
              <div className="mt-2 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{file}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttachment}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adjuntar documento
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Puedes adjuntar documentos médicos, autorizaciones especiales, etc.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireMedical">Requiere certificado médico</Label>
                <p className="text-sm text-gray-500">Marcar si es necesario presentar certificado al retorno</p>
              </div>
              <Switch
                id="requireMedical"
                checked={formData.requireMedicalCertificate}
                onCheckedChange={(checked) => handleInputChange('requireMedicalCertificate', checked)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Observaciones adicionales</Label>
              <Textarea
                id="notes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Información adicional relevante..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/permissions')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!formData.studentId || !formData.exitDate || !formData.exitTime || !formData.reason}
          >
            Crear Permiso
          </Button>
        </div>
      </form>
    </div>
  )
}