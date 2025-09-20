# Plan de Implementación - Web App Admin ColeApp

## 📊 Análisis del Schema y Entidades

### Arquitectura Multi-tenant
- **Schema compartido (public)**: Tenant, User, Role, Permission, UserRole, CustomField, Notification
- **Schema por tenant**: School, Campus, Location, Person, Student, Parent, Teacher, Class, News, Event, Message, ExitPermission, Report

### Entidades Principales Identificadas

#### 1. **Gestión de Tenant/Colegio**
- `Tenant`: Configuración del colegio (nombre, subdomain, colores, contacto)
- `School`: Información del colegio
- `Campus`: Sedes del colegio
- `Location`: Ubicaciones dentro de cada sede (aulas, auditorios, etc.)

#### 2. **Gestión de Usuarios y Personas**
- `User`: Usuarios del sistema (autenticación con Firebase)
- `Person`: Datos personales base
- `Student`: Estudiantes (vinculado a Person)
- `Parent`: Padres/tutores (vinculado a Person y User)
- `Teacher`: Profesores (vinculado a Person y User)
- `FamilyRelationship`: Relaciones familia-estudiante

#### 3. **Gestión Académica**
- `Class`: Clases/cursos
- `StudentClass`: Inscripciones de estudiantes
- `TeacherClass`: Asignación de profesores

#### 4. **Comunicación y Contenido**
- `News`: Noticias/novedades
- `Event`: Eventos escolares
- `Message`: Mensajes/comunicaciones
- `ExitPermission`: Permisos de salida
- `Report`: Boletines e informes

#### 5. **Sistema de Permisos**
- `Role`: Roles del sistema
- `Permission`: Permisos específicos
- `UserRole`: Asignación de roles a usuarios

#### 6. **Personalización**
- `CustomField`: Campos dinámicos por entidad

## 🎯 Funcionalidades Requeridas

### 1. **Landing Pública**
- Información de la app
- Características principales
- Planes y precios
- Formulario de contacto
- Acceso a login/registro

### 2. **Autenticación**
- Login con Firebase Auth
- Registro de nuevo colegio (crea tenant + admin)
- Recuperación de contraseña
- Verificación de email

### 3. **Dashboard Principal**
- Métricas generales (estudiantes, profesores, eventos)
- Eventos próximos
- Últimas novedades
- Permisos pendientes
- Gráficos de estadísticas

### 4. **Módulos CRUD**

#### A. Configuración del Colegio
- **Tenant**: Editar información (no eliminar)
- **School**: Gestión del colegio
- **Campus**: CRUD de sedes
- **Location**: CRUD de ubicaciones

#### B. Gestión de Personas
- **Users**: CRUD con roles
- **Students**: CRUD completo + relaciones familiares
- **Parents**: CRUD + vinculación con estudiantes
- **Teachers**: CRUD + asignación de materias
- **Person**: Datos base compartidos

#### C. Gestión Académica
- **Classes**: CRUD de clases/cursos
- **Inscripciones**: Asignar estudiantes a clases
- **Asignaciones**: Asignar profesores a clases

#### D. Comunicaciones
- **News**: CRUD de noticias
  - Editor de contenido enriquecido
  - Gestión de imágenes
  - Programación de publicación
  - Segmentación de audiencia

- **Events**: CRUD de eventos
  - Calendario de eventos
  - Gestión de inscripciones
  - Control de capacidad
  - Notificaciones automáticas

- **Messages**: Sistema de mensajería
  - Envío masivo o individual
  - Historial de comunicaciones
  - Respuestas y threads
  - Archivos adjuntos

#### E. Permisos de Salida
- **ExitPermission**:
  - Listado y gestión
  - Aprobación/rechazo
  - Historial por estudiante
  - Notificaciones a padres

#### F. Reportes y Boletines
- **Report**:
  - Generación de boletines
  - Informes personalizados
  - Exportación PDF/Excel
  - Historial académico

#### G. Sistema de Permisos
- **Roles**: CRUD de roles
- **Permissions**: Gestión de permisos
- **UserRole**: Asignación de roles

#### H. Campos Personalizados
- **CustomField**:
  - Configuración por entidad
  - Tipos de campo dinámicos
  - Validaciones personalizadas

## 📝 Plan de Implementación

### Fase 1: Base y Autenticación (Semana 1)
1. **Configuración inicial del proyecto**
   - [ ] Estructura de carpetas
   - [ ] Configuración de Next.js App Router
   - [ ] Setup de Tailwind CSS y componentes UI
   - [ ] Configuración de Firebase

2. **Landing page**
   - [ ] Página principal con información
   - [ ] Sección de características
   - [ ] Planes y precios
   - [ ] Footer y navegación

3. **Autenticación**
   - [ ] Página de login
   - [ ] Página de registro (con creación de tenant)
   - [ ] Recuperación de contraseña
   - [ ] Context de autenticación
   - [ ] Guards de rutas protegidas

### Fase 2: Dashboard y Navegación (Semana 2)
1. **Layout principal**
   - [ ] Sidebar con navegación
   - [ ] Header con perfil de usuario
   - [ ] Breadcrumbs
   - [ ] Sistema de notificaciones

2. **Dashboard**
   - [ ] Widgets de métricas
   - [ ] Gráficos con Recharts
   - [ ] Calendario de eventos
   - [ ] Últimas actividades

3. **Configuración del tenant**
   - [ ] Página de configuración
   - [ ] Edición de información del colegio
   - [ ] Personalización de colores y logo

### Fase 3: Gestión de Usuarios (Semana 3)
1. **CRUD de Users**
   - [ ] Listado con filtros y paginación
   - [ ] Formulario de creación/edición
   - [ ] Importación masiva (CSV/Excel)
   - [ ] Gestión de roles

2. **CRUD de Students**
   - [ ] Gestión completa de estudiantes
   - [ ] Relaciones familiares
   - [ ] Historial académico
   - [ ] Campos personalizados

3. **CRUD de Parents**
   - [ ] Gestión de padres/tutores
   - [ ] Vinculación con estudiantes
   - [ ] Permisos especiales

4. **CRUD de Teachers**
   - [ ] Gestión de profesores
   - [ ] Asignación de materias
   - [ ] Horarios

### Fase 4: Gestión Académica (Semana 4)
1. **CRUD de Campus y Locations**
   - [ ] Gestión de sedes
   - [ ] Gestión de ubicaciones
   - [ ] Mapas y direcciones

2. **CRUD de Classes**
   - [ ] Gestión de clases/cursos
   - [ ] Inscripción de estudiantes
   - [ ] Asignación de profesores
   - [ ] Horarios de clases

### Fase 5: Comunicaciones (Semana 5)
1. **Módulo de Noticias**
   - [ ] CRUD de noticias
   - [ ] Editor WYSIWYG (TipTap)
   - [ ] Gestión de imágenes
   - [ ] Programación y publicación
   - [ ] Vista previa

2. **Módulo de Eventos**
   - [ ] CRUD de eventos
   - [ ] Calendario interactivo
   - [ ] Gestión de inscripciones
   - [ ] Exportación de asistentes

3. **Sistema de Mensajería**
   - [ ] Envío de mensajes
   - [ ] Bandeja de entrada
   - [ ] Historial de conversaciones
   - [ ] Plantillas de mensajes

### Fase 6: Funcionalidades Especiales (Semana 6)
1. **Permisos de Salida**
   - [ ] Listado y filtros
   - [ ] Proceso de aprobación
   - [ ] Generación de PDF
   - [ ] Notificaciones automáticas

2. **Reportes y Boletines**
   - [ ] Generación de boletines
   - [ ] Plantillas personalizables
   - [ ] Exportación PDF/Excel
   - [ ] Envío por email

3. **Campos Personalizados**
   - [ ] Configuración de campos
   - [ ] Validaciones dinámicas
   - [ ] Integración en formularios

### Fase 7: Optimización y Testing (Semana 7)
1. **Optimización**
   - [ ] Lazy loading
   - [ ] Caché de datos
   - [ ] Optimización de imágenes
   - [ ] PWA capabilities

2. **Testing**
   - [ ] Tests unitarios
   - [ ] Tests de integración
   - [ ] Tests E2E
   - [ ] Corrección de bugs

3. **Documentación**
   - [ ] Manual de usuario
   - [ ] Documentación técnica
   - [ ] Videos tutoriales

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Radix UI + Tailwind CSS
- **Estado**: Zustand + React Query
- **Formularios**: React Hook Form + Zod
- **Tablas**: TanStack Table
- **Gráficos**: Recharts
- **Editor**: TipTap
- **Calendario**: React Day Picker

### Backend Integration
- **API**: REST + GraphQL (Apollo Client)
- **Autenticación**: Firebase Auth
- **Storage**: Firebase Storage
- **Real-time**: WebSockets para notificaciones

### Herramientas
- **Exportación**: jsPDF, XLSX
- **Drag & Drop**: @dnd-kit
- **Markdown**: react-markdown
- **Toast**: react-hot-toast

## 📂 Estructura de Carpetas Propuesta

```
web-admin/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (public)/
│   │   └── landing/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── settings/
│   │   ├── users/
│   │   ├── students/
│   │   ├── parents/
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── campus/
│   │   ├── news/
│   │   ├── events/
│   │   ├── messages/
│   │   ├── permissions/
│   │   └── reports/
│   ├── api/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   └── layouts/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── utils/
│   └── validators/
├── hooks/
├── stores/
├── types/
└── public/
```

## 🔐 Roles y Permisos Sugeridos

### Roles Base
1. **Super Admin**: Acceso total al sistema
2. **Admin Colegio**: Gestión completa del tenant
3. **Director**: Gestión académica y administrativa
4. **Secretario/a**: Gestión de datos y reportes
5. **Profesor**: Gestión de clases y comunicaciones
6. **Padre/Tutor**: Vista limitada (futura app)

### Módulos de Permisos
- `users`: create, read, update, delete
- `students`: create, read, update, delete
- `parents`: create, read, update, delete
- `teachers`: create, read, update, delete
- `classes`: create, read, update, delete
- `news`: create, read, update, delete, publish
- `events`: create, read, update, delete, manage_registrations
- `messages`: create, read, send
- `permissions`: create, read, approve, reject
- `reports`: create, read, generate, export
- `settings`: read, update

## 🚀 Próximos Pasos

1. **Validar el plan** con el equipo
2. **Priorizar funcionalidades** según necesidades inmediatas
3. **Comenzar con Fase 1**: Setup y autenticación
4. **Iterar** basándose en feedback

## 📈 Métricas de Éxito

- [ ] Registro exitoso de nuevos colegios
- [ ] Gestión eficiente de usuarios y roles
- [ ] Comunicación fluida entre colegio y familias
- [ ] Reducción de tiempo en tareas administrativas
- [ ] Adopción por parte de los usuarios
- [ ] Satisfacción del usuario final

## 🔄 Consideraciones de Migración

Para colegios existentes:
1. Importación masiva de datos
2. Mapeo de datos antiguos
3. Validación de integridad
4. Período de transición
5. Capacitación de usuarios