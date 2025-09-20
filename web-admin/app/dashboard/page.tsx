'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  Calendar,
  Newspaper,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-4 w-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs ml-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Temporary static data
  const stats = {
    students: 245,
    activeStudents: 238,
    unreadNews: 3,
    unreadMessages: 5,
    pendingPermissions: 2,
    upcomingEvents: 4,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido {user?.firstName} {user?.lastName} - Panel de administración de ColeApp
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Estudiantes"
          value={stats.students}
          description={`${stats.activeStudents} activos`}
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Eventos Próximos"
          value={stats.upcomingEvents}
          description="En los próximos 30 días"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Mensajes sin leer"
          value={stats.unreadMessages}
          description="Requieren atención"
          icon={<AlertCircle className="h-4 w-4 text-yellow-500" />}
        />
        <StatCard
          title="Permisos Pendientes"
          value={stats.pendingPermissions}
          description="Esperando aprobación"
          icon={<Clock className="h-4 w-4 text-orange-500" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Newspaper className="h-5 w-5" />
              <span>Noticias Recientes</span>
            </CardTitle>
            <CardDescription>
              Últimas publicaciones del colegio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Inicio del nuevo semestre
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hace 2 horas
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Reunión de padres
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hace 1 día
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Actividades deportivas
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hace 3 días
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Próximos Eventos</span>
            </CardTitle>
            <CardDescription>
              Eventos programados para las próximas semanas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">15</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Feria de Ciencias
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enero 15, 10:00 AM
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">18</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Torneo de Fútbol
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enero 18, 2:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">22</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Reunión de Padres
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enero 22, 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <a href="/students/new" className="block">
              <button className="w-full p-4 rounded-lg border hover:bg-gray-50 transition-colors text-left">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Nuevo Estudiante</h3>
                <p className="text-xs text-muted-foreground">Registrar estudiante</p>
              </button>
            </a>
            <a href="/news/new" className="block">
              <button className="w-full p-4 rounded-lg border hover:bg-gray-50 transition-colors text-left">
                <Newspaper className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Crear Noticia</h3>
                <p className="text-xs text-muted-foreground">Publicar nueva noticia</p>
              </button>
            </a>
            <a href="/events" className="block">
              <button className="w-full p-4 rounded-lg border hover:bg-gray-50 transition-colors text-left">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Nuevo Evento</h3>
                <p className="text-xs text-muted-foreground">Programar evento</p>
              </button>
            </a>
            <a href="/permissions" className="block">
              <button className="w-full p-4 rounded-lg border hover:bg-gray-50 transition-colors text-left">
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Aprobar Permisos</h3>
                <p className="text-xs text-muted-foreground">Revisar solicitudes</p>
              </button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}