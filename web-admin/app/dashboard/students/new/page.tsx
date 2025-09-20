'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Users, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';

export default function NewStudentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    grade: '',
    section: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    medicalConditions: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    // Padres/Tutores
    parent1Name: '',
    parent1Dni: '',
    parent1Email: '',
    parent1Phone: '',
    parent1Relationship: 'father',
    parent2Name: '',
    parent2Dni: '',
    parent2Email: '',
    parent2Phone: '',
    parent2Relationship: 'mother',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aquí iría la llamada al backend para crear el estudiante
      console.log('Creating student:', formData);

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Estudiante creado exitosamente');
      router.push('/students');
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Error al crear el estudiante');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Estudiante</h1>
            <p className="text-muted-foreground">
              Registra un nuevo estudiante en el sistema
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>
              <User className="h-5 w-5 inline-block mr-2" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Datos básicos del estudiante
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => handleChange('dni', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Género *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información Académica */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Calendar className="h-5 w-5 inline-block mr-2" />
              Información Académica
            </CardTitle>
            <CardDescription>
              Datos de inscripción y curso
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grade">Grado *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1er Grado</SelectItem>
                  <SelectItem value="2">2do Grado</SelectItem>
                  <SelectItem value="3">3er Grado</SelectItem>
                  <SelectItem value="4">4to Grado</SelectItem>
                  <SelectItem value="5">5to Grado</SelectItem>
                  <SelectItem value="6">6to Grado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Sección *</Label>
              <Select value={formData.section} onValueChange={(value) => handleChange('section', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentDate">Fecha de Inscripción *</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => handleChange('enrollmentDate', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Información Médica */}
        <Card>
          <CardHeader>
            <CardTitle>
              <MapPin className="h-5 w-5 inline-block mr-2" />
              Información Médica
            </CardTitle>
            <CardDescription>
              Datos de salud y emergencia
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Condiciones Médicas</Label>
              <Input
                id="medicalConditions"
                value={formData.medicalConditions}
                onChange={(e) => handleChange('medicalConditions', e.target.value)}
                placeholder="Ej: Asma, diabetes, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
                placeholder="Ej: Cacahuates, polen, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contacto de Emergencia *</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Teléfono de Emergencia *</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Padres/Tutores */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Users className="h-5 w-5 inline-block mr-2" />
              Padres/Tutores
            </CardTitle>
            <CardDescription>
              Información de los responsables del estudiante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Padre/Tutor 1 */}
            <div>
              <h4 className="font-medium mb-4">Padre/Tutor 1</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parent1Name">Nombre Completo *</Label>
                  <Input
                    id="parent1Name"
                    value={formData.parent1Name}
                    onChange={(e) => handleChange('parent1Name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1Dni">DNI *</Label>
                  <Input
                    id="parent1Dni"
                    value={formData.parent1Dni}
                    onChange={(e) => handleChange('parent1Dni', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1Email">Email *</Label>
                  <Input
                    id="parent1Email"
                    type="email"
                    value={formData.parent1Email}
                    onChange={(e) => handleChange('parent1Email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1Phone">Teléfono *</Label>
                  <Input
                    id="parent1Phone"
                    value={formData.parent1Phone}
                    onChange={(e) => handleChange('parent1Phone', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent1Relationship">Relación *</Label>
                  <Select
                    value={formData.parent1Relationship}
                    onValueChange={(value) => handleChange('parent1Relationship', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">Padre</SelectItem>
                      <SelectItem value="mother">Madre</SelectItem>
                      <SelectItem value="guardian">Tutor/a</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Padre/Tutor 2 */}
            <div>
              <h4 className="font-medium mb-4">Padre/Tutor 2 (Opcional)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parent2Name">Nombre Completo</Label>
                  <Input
                    id="parent2Name"
                    value={formData.parent2Name}
                    onChange={(e) => handleChange('parent2Name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent2Dni">DNI</Label>
                  <Input
                    id="parent2Dni"
                    value={formData.parent2Dni}
                    onChange={(e) => handleChange('parent2Dni', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent2Email">Email</Label>
                  <Input
                    id="parent2Email"
                    type="email"
                    value={formData.parent2Email}
                    onChange={(e) => handleChange('parent2Email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent2Phone">Teléfono</Label>
                  <Input
                    id="parent2Phone"
                    value={formData.parent2Phone}
                    onChange={(e) => handleChange('parent2Phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent2Relationship">Relación</Label>
                  <Select
                    value={formData.parent2Relationship}
                    onValueChange={(value) => handleChange('parent2Relationship', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">Padre</SelectItem>
                      <SelectItem value="mother">Madre</SelectItem>
                      <SelectItem value="guardian">Tutor/a</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/students">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Estudiante'}
          </Button>
        </div>
      </form>
    </div>
  );
}