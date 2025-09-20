'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  UserCircle,
  Info,
  ChevronRight,
  Home,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface HeaderProps {
  onSettingsToggle: () => void;
  isSettingsMode: boolean;
}

export default function Header({ onSettingsToggle, isSettingsMode }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleProfileEdit = () => {
    router.push('/dashboard/profile');
  };

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  // Generate breadcrumb from pathname
  const generateBreadcrumb = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumb = [];

    for (let i = 0; i < paths.length; i++) {
      const path = '/' + paths.slice(0, i + 1).join('/');
      let label = paths[i];

      // Format labels
      if (label === 'dashboard') {
        label = 'Dashboard';
      } else if (label === 'settings') {
        label = 'Configuración';
      } else if (label === 'news') {
        label = 'Noticias';
      } else if (label === 'events') {
        label = 'Eventos';
      } else if (label === 'messages') {
        label = 'Mensajes';
      } else if (label === 'permissions') {
        label = 'Permisos de Salida';
      } else if (label === 'bulletins') {
        label = 'Boletines';
      } else if (label === 'reports') {
        label = 'Reportes';
      } else if (label === 'students') {
        label = 'Estudiantes';
      } else if (label === 'parents') {
        label = 'Padres';
      } else if (label === 'teachers') {
        label = 'Profesores';
      } else if (label === 'users') {
        label = 'Usuarios';
      } else if (label === 'campus') {
        label = 'Campus';
      } else if (label === 'locations') {
        label = 'Ubicaciones';
      } else if (label === 'school-years') {
        label = 'Años Escolares';
      } else if (label === 'grades') {
        label = 'Grados y Secciones';
      } else if (label === 'subjects') {
        label = 'Materias';
      } else if (label === 'schedules') {
        label = 'Horarios';
      } else if (label === 'resources') {
        label = 'Recursos';
      } else if (label === 'new') {
        label = 'Nuevo';
      } else if (label === 'edit') {
        label = 'Editar';
      } else {
        // Capitalize first letter and replace hyphens
        label = label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' ');
      }

      breadcrumb.push({
        label,
        path,
        isLast: i === paths.length - 1
      });
    }

    return breadcrumb;
  };

  const breadcrumb = generateBreadcrumb();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
        {breadcrumb.length > 1 && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {breadcrumb.slice(1).map((item, index) => (
              <div key={item.path} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                {item.isLast ? (
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                ) : (
                  <Link
                    href={item.path}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Settings Toggle Button */}
        <Button
          variant={isSettingsMode ? "default" : "outline"}
          size="sm"
          onClick={onSettingsToggle}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </Button>

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-primary text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                   user?.role === 'ADMIN' ? 'Administrador' :
                   user?.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleProfileEdit}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Editar Perfil</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-gray-500"
              disabled
            >
              <Info className="mr-2 h-4 w-4" />
              <span>Versión 1.0.0</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}