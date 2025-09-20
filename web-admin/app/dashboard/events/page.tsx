'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Calendar, MapPin, Users, Clock, Filter, Search,
  ChevronLeft, ChevronRight, CalendarDays, List, Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockEvents = [
  {
    id: '1',
    title: 'Reunión de Padres de Familia',
    description: 'Reunión general para discutir el progreso académico del primer semestre.',
    date: '2025-01-20',
    time: '18:00',
    location: 'Auditorio Principal',
    type: 'meeting',
    capacity: 200,
    enrolled: 145,
    status: 'upcoming',
    mandatory: true,
  },
  {
    id: '2',
    title: 'Festival de Primavera',
    description: 'Celebración anual con presentaciones artísticas de los estudiantes.',
    date: '2025-02-15',
    time: '10:00',
    location: 'Patio Central',
    type: 'cultural',
    capacity: 500,
    enrolled: 380,
    status: 'upcoming',
    mandatory: false,
  },
  {
    id: '3',
    title: 'Torneo Interescolar de Fútbol',
    description: 'Competencia deportiva entre colegios de la región.',
    date: '2025-01-25',
    time: '09:00',
    location: 'Campo Deportivo',
    type: 'sports',
    capacity: 100,
    enrolled: 85,
    status: 'upcoming',
    mandatory: false,
  },
  {
    id: '4',
    title: 'Excursión al Museo de Ciencias',
    description: 'Visita educativa para estudiantes de 4to y 5to grado.',
    date: '2025-02-05',
    time: '08:00',
    location: 'Museo de Ciencias Naturales',
    type: 'academic',
    capacity: 60,
    enrolled: 60,
    status: 'full',
    mandatory: false,
  },
  {
    id: '5',
    title: 'Ceremonia de Graduación',
    description: 'Ceremonia de graduación para estudiantes de 6to grado.',
    date: '2024-12-15',
    time: '19:00',
    location: 'Auditorio Principal',
    type: 'ceremony',
    capacity: 300,
    enrolled: 250,
    status: 'completed',
    mandatory: true,
  },
];

const eventTypes = [
  { value: 'all', label: 'Todos los tipos', color: 'default' },
  { value: 'meeting', label: 'Reunión', color: 'blue' },
  { value: 'cultural', label: 'Cultural', color: 'purple' },
  { value: 'sports', label: 'Deportivo', color: 'green' },
  { value: 'academic', label: 'Académico', color: 'yellow' },
  { value: 'ceremony', label: 'Ceremonia', color: 'red' },
];

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filtrar eventos
  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    switch (eventType?.color) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  const getStatusBadge = (status: string, enrolled: number, capacity: number) => {
    if (status === 'completed') {
      return <Badge variant="secondary">Finalizado</Badge>;
    }
    if (status === 'full') {
      return <Badge className="bg-red-100 text-red-800">Lleno</Badge>;
    }
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) {
      return <Badge className="bg-orange-100 text-orange-800">Casi lleno</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Gestiona los eventos y actividades del colegio
          </p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos este mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 próximos esta semana
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total inscripciones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">855</div>
            <p className="text-xs text-muted-foreground">
              +120 esta semana
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos llenos</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Lista de espera activa
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de asistencia</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              Promedio últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Filtros</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="upcoming">Próximos</SelectItem>
                <SelectItem value="full">Llenos</SelectItem>
                <SelectItem value="completed">Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium py-2">
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`border rounded-md p-2 min-h-[80px] ${
                    day ? 'hover:bg-muted/50' : ''
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium">{day}</div>
                      {/* Aquí se mostrarían los eventos del día */}
                      {filteredEvents
                        .filter(event => {
                          const eventDate = new Date(event.date);
                          return eventDate.getDate() === day &&
                            eventDate.getMonth() === currentMonth.getMonth() &&
                            eventDate.getFullYear() === currentMonth.getFullYear();
                        })
                        .slice(0, 2)
                        .map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded mt-1 truncate ${getEventTypeColor(event.type)}`}
                          >
                            {event.time} - {event.title}
                          </div>
                        ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getEventTypeColor(event.type)}>
                        {eventTypes.find(t => t.value === event.type)?.label}
                      </Badge>
                      {event.mandatory && (
                        <Badge variant="destructive">Obligatorio</Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver inscripciones</DropdownMenuItem>
                      <DropdownMenuItem>Descargar lista</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Cancelar evento
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-4">
                  {event.description}
                </CardDescription>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(event.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.enrolled} / {event.capacity} inscritos</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between items-center w-full">
                  {getStatusBadge(event.status, event.enrolled, event.capacity)}
                  <div className="flex gap-2">
                    {event.status === 'upcoming' && event.enrolled < event.capacity && (
                      <Button size="sm">Inscribir</Button>
                    )}
                    <Button size="sm" variant="outline">Ver más</Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}