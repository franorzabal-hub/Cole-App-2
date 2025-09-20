# 📚 Plan Maestro ColeApp - Web Admin

## 📊 Estado Actual - Resumen Ejecutivo
**Última actualización**: 14 de Septiembre, 2025

### ✅ Completado
- **Configuración del proyecto**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Autenticación**: Sistema completo con JWT y persistencia
- **UI/UX Nueva Arquitectura**:
  - Header con menú de usuario (perfil, logout, versión)
  - Sidebar con dos modos: Normal (Operaciones) y Settings (Configuración)
  - Reorganización completa de navegación
- **Multi-tenant**: Setup de schemas por tenant
- **Módulo Noticias**: CRUD básico conectado al backend

### 🚧 En Progreso
- Módulos de Comunicación (Eventos, Mensajes)
- Módulos de Operaciones (Permisos, Boletines, Reportes)

### ⏳ Pendiente
- Todos los módulos del modo Settings (Gestión de Personas, Académica, Infraestructura)
- Editor WYSIWYG para noticias
- Sistema de roles y permisos
- Dashboard con métricas reales

## 🎯 Visión General del Proyecto

**ColeApp** es una plataforma de gestión escolar con arquitectura multi-tenant que consta de:
- **Mobile App** (React Native): Para padres y estudiantes - ✅ EN PRODUCCIÓN
- **Web Admin** (Next.js): Para administración del colegio - 🚧 POR DESARROLLAR
- **Backend** (NestJS + GraphQL): API compartida - ✅ PARCIALMENTE IMPLEMENTADO

## 🏗️ Arquitectura Actual

### Base de Datos (PostgreSQL + Prisma)
```
┌─────────────────────────────────────┐
│       SCHEMA COMPARTIDO (public)    │
├─────────────────────────────────────┤
│ • Tenant (colegios)                 │
│ • User (autenticación)              │
│ • Role, Permission, UserRole        │
│ • CustomField (campos dinámicos)    │
│ • Notification                      │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│    SCHEMA POR TENANT (tenant_*)     │
├─────────────────────────────────────┤
│ • School, Campus, Location          │
│ • Person, Student, Parent, Teacher  │
│ • Class, StudentClass, TeacherClass │
│ • News, Event, Message              │
│ • ExitPermission, Report            │
│ • FamilyRelationship                │
└─────────────────────────────────────┘
```

### Stack Tecnológico
- **Backend**: NestJS, GraphQL (Apollo), Prisma, Firebase Auth, Bull + Redis
- **Web Admin**: Next.js 14, TypeScript, Tailwind CSS, Radix UI, Zustand, React Query
- **Mobile App**: React Native, Expo, Firebase

## 📊 Estado Actual del Sistema

### ✅ Backend - Módulos Implementados
| Módulo | Funcionalidades | Usado por Mobile | Necesario para Web Admin |
|--------|----------------|------------------|---------------------------|
| **Auth** | Login, registro, Firebase auth | ✅ Sí | ✅ Sí |
| **Tenant** | Gestión multi-tenant | ✅ Sí | ✅ Sí |
| **Students** | CRUD completo + relaciones familiares | ✅ Vista | ✅ CRUD completo |
| **News** | CRUD de noticias | ✅ Lectura | ✅ Creación/edición |
| **Events** | CRUD + inscripciones | ✅ Vista/inscripción | ✅ Gestión completa |
| **Messages** | Mensajería + respuestas | ✅ Envío/recepción | ✅ Broadcast/gestión |
| **Exit Permissions** | Solicitud y aprobación | ✅ Solicitud | ✅ Aprobación |
| **Reports** | Boletines e informes | ✅ Vista | ✅ Generación |

### ❌ Backend - Módulos NO Implementados (Necesarios para Web Admin)
| Módulo | Prioridad | Descripción |
|--------|-----------|-------------|
| **Tenant Registration** | 🔴 CRÍTICO | Crear nuevo colegio + admin desde registro |
| **Users CRUD** | 🔴 CRÍTICO | Gestión completa de usuarios del sistema |
| **Parents Module** | 🟡 ALTO | CRUD de padres/tutores |
| **Teachers Module** | 🟡 ALTO | CRUD de profesores |
| **School/Campus/Location** | 🟡 ALTO | Configuración del colegio |
| **Classes Module** | 🟡 ALTO | Gestión de clases y asignaciones |
| **Roles & Permissions** | 🟠 MEDIO | Sistema de permisos granular |
| **Custom Fields** | 🟢 BAJO | Campos personalizados por entidad |
| **Notifications** | 🟢 BAJO | Sistema de notificaciones push/email |

## 🚀 Plan de Implementación Web Admin

### ✅ FASE 1: MVP con Backend Existente (COMPLETADO)
**Objetivo**: Lanzar interfaz administrativa funcional con módulos disponibles

#### ✅ Semana 1: Setup y Core Features (COMPLETADO)
```
✅ Día 1-2: Configuración Inicial
├── ✅ Setup proyecto Next.js 14 con TypeScript
├── ✅ Configuración Tailwind CSS + Radix UI
├── ✅ Setup Firebase Auth (JWT)
├── ✅ Estructura de carpetas y routing
└── ✅ Configuración de GraphQL Apollo Client

✅ Día 3-4: Autenticación y Layout
├── ✅ Página de login
├── ✅ Context de autenticación
├── ✅ Layout principal con Header y Sidebar
├── ✅ Sistema de navegación con dos modos (Normal/Settings)
└── ✅ Guards de rutas protegidas

✅ Día 5-7: Dashboard y UI Reorganización
├── ✅ Dashboard básico
├── ✅ Header con menú de usuario
│   ├── ✅ Dropdown con perfil, logout, versión
│   └── ✅ Toggle de modo Settings
├── ✅ Sidebar reorganizado
│   ├── ✅ Modo Normal: Comunicaciones, Operaciones
│   └── ✅ Modo Settings: Gestión Personas, Académica, Infraestructura
└── ✅ Multi-tenant schema setup
```

#### 🚧 Semana 2: Módulos de Comunicación (EN PROGRESO)
```
✅ Día 8-9: Noticias
├── ✅ Lista de noticias con filtros
├── ⏳ Editor WYSIWYG (TipTap)
├── ⏳ Gestión de imágenes
├── ⏳ Programación de publicación
└── ✅ Preview básico y publicación

Día 10-11: Eventos
├── Calendario de eventos
├── Formulario crear/editar evento
├── Gestión de inscripciones
├── Control de capacidad
└── Exportación de asistentes

Día 12-13: Mensajes y Permisos
├── Sistema de mensajería
│   ├── Bandeja de entrada
│   ├── Envío individual/masivo
│   └── Historial de conversaciones
└── Permisos de Salida
    ├── Lista con estados
    ├── Flujo de aprobación
    └── Generación de PDF

Día 14: Testing y Ajustes
├── Testing de integración
├── Corrección de bugs
└── Deploy a staging
```

### FASE 2: Desarrollo Backend Crítico (Semanas 3-4)
**Objetivo**: Implementar funcionalidades bloqueantes para el onboarding

#### Semana 3: Backend Development
```
Backend Team:
├── Tenant Registration Module
│   ├── Endpoint createTenantWithAdmin
│   ├── Crear schema de tenant automáticamente
│   ├── Setup inicial de datos base
│   └── Crear usuario admin inicial
├── Users Management Module
│   ├── CRUD completo de usuarios
│   ├── Importación/exportación masiva
│   ├── Gestión de estados (activo/inactivo)
│   └── Reset de contraseñas
└── Parents & Teachers Modules
    ├── CRUD de Parents
    ├── CRUD de Teachers
    ├── Vinculación con Users
    └── Asignación de permisos

Frontend Team (en paralelo):
├── Landing Page Pública
│   ├── Información de la app
│   ├── Planes y precios
│   └── Formulario de contacto
├── Página de Registro de Colegio
│   ├── Wizard de configuración
│   ├── Selección de plan
│   └── Datos iniciales del colegio
└── Mockear módulos pendientes
    ├── Mock service para Users
    ├── Mock service para Campus
    └── Feature flags para activación
```

#### Semana 4: Integración y Campus/Classes
```
Backend:
├── School/Campus/Location Module
│   ├── CRUD de School
│   ├── CRUD de Campus (sedes)
│   ├── CRUD de Location (aulas, etc.)
│   └── Gestión de capacidad
└── Classes Module
    ├── CRUD de Classes
    ├── StudentClass (inscripciones)
    ├── TeacherClass (asignaciones)
    └── Horarios y calendario académico

Frontend:
├── Integración Tenant Registration
├── Módulo Users Management
├── Módulo Parents/Teachers
└── Inicio módulos Campus/Classes
```

### FASE 3: Features Avanzados (Semanas 5-6)
**Objetivo**: Completar funcionalidades administrativas avanzadas

#### Semana 5: Gestión Académica Completa
```
├── Configuración del Colegio
│   ├── Edición de datos del tenant
│   ├── Personalización (logo, colores)
│   └── Configuración académica
├── Gestión de Campus y Ubicaciones
│   ├── CRUD de sedes
│   ├── Gestión de espacios
│   └── Mapas y direcciones
├── Gestión de Clases
│   ├── Creación de cursos
│   ├── Inscripción de estudiantes
│   ├── Asignación de profesores
│   └── Horarios
└── Reportes y Boletines
    ├── Generación de boletines
    ├── Plantillas personalizables
    ├── Exportación PDF/Excel
    └── Envío por email
```

#### Semana 6: Roles, Permisos y Optimización
```
Backend:
├── Roles & Permissions Module
│   ├── CRUD de roles
│   ├── CRUD de permisos
│   ├── Asignación dinámica
│   └── RBAC implementation
└── Custom Fields Module
    ├── Configuración por entidad
    ├── Tipos de campo dinámicos
    └── Validaciones personalizadas

Frontend:
├── Sistema de Roles y Permisos
│   ├── Gestión de roles
│   ├── Matrix de permisos
│   └── Asignación a usuarios
├── Campos Personalizados
│   ├── Configurador de campos
│   └── Integración en formularios
└── Optimización
    ├── Lazy loading
    ├── Caché de datos
    ├── PWA capabilities
    └── Performance tuning
```

### FASE 4: Testing y Deploy (Semana 7)
```
├── Testing Completo
│   ├── Unit tests
│   ├── Integration tests
│   ├── E2E tests con Cypress
│   └── User acceptance testing
├── Documentación
│   ├── Manual de usuario
│   ├── Documentación técnica
│   ├── Videos tutoriales
│   └── FAQ
├── Deploy a Producción
│   ├── Setup CI/CD
│   ├── Configuración de ambientes
│   ├── Monitoreo y alertas
│   └── Backup y recuperación
└── Post-Launch
    ├── Soporte inicial
    ├── Recolección de feedback
    └── Plan de mejoras v2
```

## 📂 Estructura de Carpetas Web Admin (ACTUALIZADA)

```
web-admin/
├── app/                          # Next.js 14 App Router
│   ├── login/                    # ✅ Página de login
│   ├── dashboard/                # ✅ Rutas protegidas
│   │   ├── layout.tsx           # ✅ Layout con Header y Sidebar
│   │   ├── page.tsx             # ✅ Dashboard principal
│   │   ├── news/                # ✅ Gestión de noticias (conectado)
│   │   ├── events/              # ⏳ Gestión de eventos
│   │   ├── messages/            # ⏳ Sistema de mensajería
│   │   ├── permissions/         # ⏳ Permisos de salida
│   │   ├── bulletins/           # ⏳ Boletines
│   │   ├── reports/             # ⏳ Reportes
│   │   └── settings/            # ⏳ Modo configuración
│   │       ├── students/        # ⏳ Gestión de estudiantes
│   │       ├── parents/         # ⏳ Gestión de padres
│   │       ├── teachers/        # ⏳ Gestión de profesores
│   │       ├── users/           # ⏳ Gestión de usuarios
│   │       ├── school-years/    # ⏳ Años escolares
│   │       ├── grades/          # ⏳ Grados y secciones
│   │       ├── subjects/        # ⏳ Materias
│   │       ├── schedules/       # ⏳ Horarios
│   │       ├── campus/          # ⏳ Gestión de sedes
│   │       ├── locations/       # ⏳ Ubicaciones
│   │       └── resources/       # ⏳ Recursos
│   ├── layout.tsx               # ✅ Root layout
│   └── providers.tsx            # ✅ Auth Provider
├── components/
│   ├── ui/                      # Componentes Radix UI
│   ├── forms/                   # Formularios reutilizables
│   ├── tables/                  # Tablas con TanStack
│   ├── charts/                  # Gráficos con Recharts
│   ├── editors/                 # TipTap editor
│   └── layouts/                 # Layouts compartidos
├── lib/
│   ├── api/                     # Cliente GraphQL/REST
│   ├── auth/                    # Firebase Auth helpers
│   ├── utils/                   # Utilidades
│   └── validators/              # Schemas Zod
├── hooks/                       # Custom hooks
├── stores/                      # Zustand stores
├── services/                    # Servicios de datos
│   ├── real/                    # Servicios reales
│   └── mock/                    # Servicios mock
├── types/                       # TypeScript types
├── config/                      # Configuración
│   └── features.ts              # Feature flags
└── public/                      # Assets públicos
```

## 🔐 Roles y Permisos del Sistema

### Roles Base
| Rol | Descripción | Permisos Clave |
|-----|-------------|----------------|
| **Super Admin** | Administrador de la plataforma | Acceso total, gestión de tenants |
| **Admin Colegio** | Administrador del colegio | Gestión completa del tenant |
| **Director** | Director académico | Gestión académica, reportes, aprobaciones |
| **Secretario/a** | Personal administrativo | Gestión de datos, reportes, comunicaciones |
| **Profesor** | Docente | Gestión de clases, calificaciones, mensajes |
| **Padre/Tutor** | Familiar del estudiante | Vista limitada vía mobile app |

### Módulos de Permisos
```typescript
interface PermissionModule {
  users: ['create', 'read', 'update', 'delete', 'import', 'export'];
  students: ['create', 'read', 'update', 'delete', 'import'];
  parents: ['create', 'read', 'update', 'delete'];
  teachers: ['create', 'read', 'update', 'delete'];
  classes: ['create', 'read', 'update', 'delete', 'assign'];
  news: ['create', 'read', 'update', 'delete', 'publish'];
  events: ['create', 'read', 'update', 'delete', 'manage_registrations'];
  messages: ['create', 'read', 'send', 'broadcast'];
  permissions: ['create', 'read', 'approve', 'reject'];
  reports: ['create', 'read', 'generate', 'export'];
  settings: ['read', 'update'];
}
```

## 🎯 Roadmap de Desarrollo

### Sprint 1 (Semanas 1-2): MVP
- [x] Análisis y planificación
- [x] Setup proyecto Web Admin
- [x] Autenticación y layout
- [x] Dashboard principal
- [x] CRUD Estudiantes
- [x] Gestión de Noticias
- [ ] Gestión de Eventos
- [ ] Sistema de Mensajes
- [ ] Aprobación de Permisos

### Sprint 2 (Semanas 3-4): Core Features
- [ ] Landing page pública
- [ ] Registro de nuevo colegio
- [ ] CRUD de Usuarios
- [ ] Módulo de Padres
- [ ] Módulo de Profesores
- [ ] Gestión de Campus
- [ ] Gestión de Clases

### Sprint 3 (Semanas 5-6): Advanced
- [ ] Sistema de Roles y Permisos
- [ ] Campos Personalizados
- [ ] Reportes Avanzados
- [ ] Importación/Exportación masiva
- [ ] Optimización y PWA

### Sprint 4 (Semana 7): Launch
- [ ] Testing completo
- [ ] Documentación
- [ ] Deploy a producción
- [ ] Capacitación usuarios

## 📊 Métricas de Éxito

### KPIs Técnicos
- ⏱️ Tiempo de carga < 3 segundos
- 📱 Lighthouse score > 90
- 🔒 0 vulnerabilidades críticas
- ✅ Coverage de tests > 80%
- 🚀 Uptime > 99.9%

### KPIs de Negocio
- 👥 10 colegios registrados en primer mes
- 📈 70% adopción por usuarios en 3 meses
- ⭐ Satisfacción > 4.5/5
- 💰 Reducción 50% tiempo administrativo
- 📊 90% precisión en reportes

## 🛠️ Herramientas de Desarrollo

### Desarrollo
- **IDE**: VS Code con extensiones para React/TypeScript
- **Version Control**: Git + GitHub
- **Package Manager**: npm/yarn
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library + Cypress

### Infraestructura
- **Backend Hosting**: Railway/Render/AWS
- **Frontend Hosting**: Vercel
- **Database**: PostgreSQL (Supabase/Neon)
- **File Storage**: Firebase Storage/S3
- **Monitoring**: Sentry + LogRocket
- **Analytics**: Google Analytics/Mixpanel

### Comunicación
- **Project Management**: Jira/Linear/Trello
- **Documentation**: Notion/Confluence
- **Design**: Figma
- **Communication**: Slack/Discord

## 🚨 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retraso en backend | Media | Alto | Desarrollo paralelo con mocks |
| Complejidad multi-tenant | Alta | Alto | Tests exhaustivos, code review |
| Adopción de usuarios | Media | Alto | UX intuitiva, capacitación |
| Performance con datos masivos | Baja | Medio | Paginación, lazy loading, caché |
| Seguridad de datos | Baja | Muy Alto | Auditoría, encriptación, RBAC |

## 💡 Decisiones Técnicas Clave

### ✅ Decisiones Tomadas
1. **GraphQL sobre REST**: Flexibilidad para mobile y web con diferentes necesidades
2. **Next.js App Router**: Mejor performance y SEO
3. **Tailwind + Radix UI**: Rapidez de desarrollo con accesibilidad
4. **Multi-tenant con schemas**: Aislamiento completo de datos
5. **Firebase Auth**: Solución robusta y escalable

### 🤔 Decisiones Pendientes
1. **Hosting de producción**: AWS vs Google Cloud vs Azure
2. **CDN para assets**: Cloudflare vs Fastly
3. **Sistema de pagos**: Stripe vs MercadoPago
4. **Email service**: SendGrid vs Amazon SES
5. **Push notifications**: Firebase vs OneSignal

## 📈 Plan de Crecimiento Post-MVP

### V2.0 (Q2 2024)
- [ ] App móvil para profesores
- [ ] Sistema de calificaciones
- [ ] Gestión de asistencia
- [ ] Biblioteca digital
- [ ] Cafetería/pagos

### V3.0 (Q3 2024)
- [ ] IA para análisis predictivo
- [ ] Chatbot de soporte
- [ ] Integración con sistemas externos
- [ ] API pública
- [ ] Marketplace de plugins

## 🎬 Próximos Pasos Inmediatos

### Esta Semana
1. ✅ Completar análisis y planificación
2. ✅ Setup proyecto Web Admin
3. ✅ Implementar autenticación
4. ✅ Crear layout y navegación
5. ✅ Comenzar con Dashboard

### Tareas Paralelas
- **Frontend Team**: Comenzar con módulos usando backend existente
- **Backend Team**: Priorizar Tenant Registration y Users CRUD
- **Design Team**: Crear mockups de páginas faltantes
- **QA Team**: Preparar plan de testing

## 📞 Contactos del Proyecto

| Rol | Responsable | Contacto |
|-----|-------------|----------|
| Product Owner | [Nombre] | [email] |
| Tech Lead | [Nombre] | [email] |
| Frontend Lead | [Nombre] | [email] |
| Backend Lead | [Nombre] | [email] |
| UX/UI Lead | [Nombre] | [email] |
| QA Lead | [Nombre] | [email] |

---

**Última actualización**: 14 de Enero 2025
**Versión del documento**: 1.3.0
**Estado**: 🟢 Sprint 1 Completado - En desarrollo activo

## 📊 Progreso Actual del Desarrollo

### ✅ Sprint 1 - COMPLETADO (100%)
1. **Setup Inicial del Proyecto** ✅
   - Next.js 14 con TypeScript configurado
   - Tailwind CSS + PostCSS funcionando
   - Estructura de carpetas definida
   - Path aliases configurados (@/*)

2. **Sistema de Autenticación** ✅
   - Página de login funcional con diseño completo
   - AuthContext implementado (versión simplificada por compatibilidad)
   - Guards de rutas protegidas
   - Integración con localStorage para tokens

3. **Layout Principal** ✅
   - Sidebar colapsable con navegación completa
   - Header con información de usuario
   - Sistema de rutas anidadas
   - Diseño responsive

4. **Dashboard** ✅
   - Página principal con widgets de estadísticas
   - Cards de métricas (estudiantes, profesores, eventos)
   - Sección de eventos próximos
   - Accesos rápidos a módulos principales

5. **Configuración Base** ✅
   - Apollo Client configurado (versión simplificada)
   - Variables de entorno (.env.local)
   - Providers globales (Auth, Apollo, Toast)
   - Sistema de notificaciones toast

6. **CRUD de Estudiantes** ✅
   - Tabla de estudiantes con filtros y paginación
   - Búsqueda por nombre, apellido y DNI
   - Formulario completo de crear/editar estudiante
   - Gestión de relaciones familiares (hasta 2 padres/tutores)
   - Información médica y de emergencia
   - Cards de estadísticas
   - Acciones por fila (ver, editar, eliminar)

7. **Gestión de Noticias** ✅
   - Grid de tarjetas con noticias
   - Filtros por búsqueda, categoría y estado
   - Editor WYSIWYG con TipTap (formato de texto, listas, enlaces)
   - Gestión de imágenes destacadas
   - Programación de publicación (ahora, programada, borrador)
   - Categorías y etiquetas
   - Opciones de noticia destacada y notificaciones
   - Estados: Publicado, Borrador, Programado
   - Contador de vistas

8. **Gestión de Eventos** ✅
   - Vista de lista y calendario
   - Calendario mensual con navegación
   - Tarjetas de eventos con información completa
   - Filtros por tipo, fecha y búsqueda
   - Indicadores de capacidad e inscripciones
   - Estados: Próximo, En curso, Finalizado
   - Gestión de inscripciones y asistencia
   - Componente Tabs para cambiar vistas

9. **Sistema de Mensajes** ✅
   - Bandeja de entrada con tabs (Entrada, Destacados, Importante, Enviados)
   - Vista de conversación con historial
   - Composición de mensajes con selección de destinatarios
   - Soporte para destinatarios individuales, grupos y clases
   - Adjuntos y prioridades de mensaje
   - Programación de envío
   - Indicadores de lectura y respuestas
   - Búsqueda y filtros avanzados

10. **Aprobación de Permisos de Salida** ✅
    - Lista de permisos con estados (Pendiente, Aprobado, Rechazado, Completado)
    - Formulario de solicitud con validaciones
    - Flujo de aprobación/rechazo con motivos
    - Gestión de persona autorizada para recoger
    - Adjuntos de documentación
    - Notificaciones a padres
    - Filtros por estado, grado y búsqueda
    - Indicadores de prioridad (Normal, Alta, Urgente)

### 🔧 Issues Resueltos
1. **Compatibilidad Firebase/Next.js 14**: Creado versión simplificada sin Firebase directo
2. **Estilos CSS rotos**: Solucionado con postcss-import y rebuild
3. **Path aliases**: Configurado correctamente en tsconfig.json

### 📝 Notas Técnicas
- Usando mocks temporales para auth mientras se resuelve compatibilidad con Firebase
- Backend corriendo en puerto 3000, web-admin en 3001
- Todos los componentes UI base están creados y funcionando
- Editor WYSIWYG implementado con TipTap v2
- Componentes Radix UI integrados para accesibilidad

### 🎯 Componentes UI Implementados
- **Básicos**: Button, Input, Label, Card, Alert, Badge, Separator
- **Formularios**: Select, Textarea, Switch, RadioGroup, Checkbox
- **Datos**: Table (con todas sus variantes), ScrollArea
- **Navegación**: DropdownMenu, Sidebar (colapsable), Tabs
- **Feedback**: Toast (notificaciones), Avatar, Dialog
- **Editor**: RichTextEditor (WYSIWYG con TipTap)

### 📈 Métricas del Sprint 1
- **Estado**: ✅ COMPLETADO
- **Progreso**: 100% (10 de 10 tareas)
- **Módulos completados**:
  - Setup y Configuración
  - Sistema de Autenticación
  - Dashboard
  - CRUD de Estudiantes
  - Gestión de Noticias
  - Gestión de Eventos
  - Sistema de Mensajes
  - Aprobación de Permisos de Salida
- **Fecha de finalización**: 14 de Enero 2025

### 🚀 Próximos Pasos - Sprint 2
- [ ] CRUD de Profesores
- [ ] CRUD de Padres/Tutores
- [ ] Gestión de Clases y Asignaciones
- [ ] Sistema de Roles y Permisos
- [ ] Configuración de Colegio (School/Campus/Location)