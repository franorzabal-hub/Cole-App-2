'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Calendar,
  Newspaper,
  MessageSquare,
  ClipboardCheck,
  FileText,
  Settings,
  Building2,
  GraduationCap,
  UserCog,
  MapPin,
  ChevronLeft,
  Menu,
  BookOpen,
  ClipboardList,
  FileCheck,
  UserCheck,
  School,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  isSettingsMode?: boolean;
}

// Normal mode menu items - Operations
const normalMenuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Comunicaciones',
    icon: MessageSquare,
    subItems: [
      {
        title: 'Noticias',
        href: '/dashboard/news',
        icon: Newspaper,
        description: 'Gestionar noticias para toda la comunidad'
      },
      {
        title: 'Eventos',
        href: '/dashboard/events',
        icon: Calendar,
        description: 'Administrar eventos del colegio'
      },
      {
        title: 'Mensajes',
        href: '/dashboard/messages',
        icon: MessageSquare,
        description: 'Sistema de mensajería con padres y estudiantes'
      },
    ],
  },
  {
    title: 'Operaciones',
    icon: ClipboardCheck,
    subItems: [
      {
        title: 'Permisos de Salida',
        href: '/dashboard/permissions',
        icon: ClipboardCheck,
        description: 'Gestionar permisos de salida de estudiantes'
      },
      {
        title: 'Boletines',
        href: '/dashboard/bulletins',
        icon: FileCheck,
        description: 'Generar y enviar boletines académicos'
      },
      {
        title: 'Reportes',
        href: '/dashboard/reports',
        icon: FileText,
        description: 'Reportes y estadísticas del sistema'
      },
    ],
  },
];

// Settings mode menu items - Configuration
const settingsMenuItems = [
  {
    title: 'Configuración General',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Gestión de Personas',
    icon: Users,
    subItems: [
      {
        title: 'Estudiantes',
        href: '/dashboard/settings/students',
        icon: GraduationCap,
        description: 'Administrar estudiantes y sus datos'
      },
      {
        title: 'Padres',
        href: '/dashboard/settings/parents',
        icon: Users,
        description: 'Gestionar información de padres y tutores'
      },
      {
        title: 'Profesores',
        href: '/dashboard/settings/teachers',
        icon: UserCog,
        description: 'Administrar personal docente'
      },
      {
        title: 'Usuarios del Sistema',
        href: '/dashboard/settings/users',
        icon: UserCheck,
        description: 'Gestionar usuarios y permisos'
      },
    ],
  },
  {
    title: 'Gestión Académica',
    icon: Building2,
    subItems: [
      {
        title: 'Años Escolares',
        href: '/dashboard/settings/school-years',
        icon: Clock,
        description: 'Configurar períodos académicos'
      },
      {
        title: 'Grados y Secciones',
        href: '/dashboard/settings/grades',
        icon: School,
        description: 'Administrar grados y secciones'
      },
      {
        title: 'Materias',
        href: '/dashboard/settings/subjects',
        icon: BookOpen,
        description: 'Gestionar materias y cursos'
      },
      {
        title: 'Horarios',
        href: '/dashboard/settings/schedules',
        icon: Clock,
        description: 'Configurar horarios de clases'
      },
    ],
  },
  {
    title: 'Infraestructura',
    icon: Building2,
    subItems: [
      {
        title: 'Campus',
        href: '/dashboard/settings/campus',
        icon: Building2,
        description: 'Administrar sedes del colegio'
      },
      {
        title: 'Ubicaciones',
        href: '/dashboard/settings/locations',
        icon: MapPin,
        description: 'Gestionar aulas y espacios'
      },
      {
        title: 'Recursos',
        href: '/dashboard/settings/resources',
        icon: ClipboardList,
        description: 'Administrar recursos y equipamiento'
      },
    ],
  },
];

export default function Sidebar({ isSettingsMode = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const menuItems = isSettingsMode ? settingsMenuItems : normalMenuItems;

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (subItems: any[]) =>
    subItems.some((item) => pathname === item.href);

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg">ColeApp</span>
              {isSettingsMode && (
                <span className="text-xs text-gray-500">Modo Configuración</span>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Mode Indicator */}
      {isSettingsMode && !collapsed && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center space-x-2 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Modo Configuración Activo</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.title);
            const isItemActive = item.href ? isActive(item.href) : false;
            const isSubItemActive = hasSubItems && isParentActive(item.subItems);

            return (
              <li key={item.title}>
                {hasSubItems ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                        'hover:bg-gray-100',
                        isSubItemActive && 'bg-primary/10 text-primary',
                        collapsed && 'justify-center'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={cn('h-5 w-5 flex-shrink-0', collapsed && 'h-6 w-6')} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left font-medium">{item.title}</span>
                          <ChevronLeft
                            className={cn(
                              'h-4 w-4 transition-transform flex-shrink-0',
                              isExpanded && '-rotate-90'
                            )}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group',
                                'hover:bg-gray-100',
                                isActive(subItem.href) &&
                                  'bg-primary text-white hover:bg-primary/90'
                              )}
                            >
                              <subItem.icon className="h-4 w-4 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="text-sm font-medium">{subItem.title}</span>
                                {subItem.description && !isActive(subItem.href) && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {subItem.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                      'hover:bg-gray-100',
                      isItemActive && 'bg-primary text-white hover:bg-primary/90',
                      collapsed && 'justify-center'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <item.icon className={cn('h-5 w-5 flex-shrink-0', collapsed && 'h-6 w-6')} />
                    {!collapsed && <span className="font-medium">{item.title}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>ColeApp Admin v1.0.0</p>
            <p className="mt-1">© 2024 ColeApp</p>
          </div>
        )}
      </div>
    </aside>
  );
}