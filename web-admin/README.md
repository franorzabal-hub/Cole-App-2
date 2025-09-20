# ColeApp Web Admin

Panel de administración para la gestión escolar de ColeApp.

## 🚀 Setup Inicial

### 1. Instalar dependencias

```bash
cd web-admin
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.local.example` a `.env.local` y configura las variables:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Firebase:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu-measurement-id

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql

# Tenant Configuration
NEXT_PUBLIC_DEFAULT_TENANT_ID=tenant_default
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3001](http://localhost:3001)

## 📁 Estructura del Proyecto

```
web-admin/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Rutas de autenticación
│   │   ├── login/           # Página de login
│   │   ├── register/        # Registro de colegio
│   │   └── forgot-password/ # Recuperación de contraseña
│   ├── (dashboard)/         # Rutas protegidas del dashboard
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── students/        # Gestión de estudiantes
│   │   ├── news/           # Gestión de noticias
│   │   ├── events/         # Gestión de eventos
│   │   └── ...             # Otros módulos
│   └── layout.tsx          # Layout principal
├── components/
│   ├── ui/                 # Componentes UI base (Radix UI)
│   ├── layouts/            # Layouts (Sidebar, Header, etc.)
│   └── forms/              # Formularios reutilizables
├── lib/
│   ├── apollo-client.ts   # Configuración de Apollo Client
│   ├── firebase.ts         # Configuración de Firebase
│   └── utils.ts           # Utilidades
├── contexts/
│   └── AuthContext.tsx     # Context de autenticación
└── public/                 # Assets públicos
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Build
npm run build        # Construye la aplicación para producción
npm run start        # Inicia el servidor de producción

# Calidad de código
npm run lint         # Ejecuta el linter
npm run typecheck    # Verifica tipos de TypeScript

# Testing
npm run test         # Ejecuta los tests
npm run test:watch   # Ejecuta tests en modo watch
```

## 🎨 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: Radix UI
- **Estado**: Zustand + React Query
- **Formularios**: React Hook Form + Zod
- **GraphQL**: Apollo Client
- **Autenticación**: Firebase Auth
- **Tablas**: TanStack Table
- **Gráficos**: Recharts
- **Editor**: TipTap

## 🔐 Autenticación

La aplicación usa Firebase Auth para la autenticación. El flujo es:

1. Usuario ingresa credenciales en `/login`
2. Firebase valida las credenciales
3. Se obtiene un ID Token de Firebase
4. El token se envía al backend para sincronizar con la BD
5. Se obtienen los roles y permisos del usuario
6. Usuario es redirigido al dashboard

## 📊 Módulos Implementados

### ✅ Fase 1 (Completado)
- [x] Autenticación con Firebase
- [x] Layout con Sidebar
- [x] Dashboard con estadísticas
- [x] Página de login

### 🚧 En Desarrollo
- [ ] Gestión de Estudiantes
- [ ] Gestión de Noticias
- [ ] Gestión de Eventos
- [ ] Sistema de Mensajes
- [ ] Permisos de Salida
- [ ] Reportes

### 📋 Pendiente
- [ ] Registro de nuevo colegio
- [ ] Gestión de Usuarios
- [ ] Gestión de Padres
- [ ] Gestión de Profesores
- [ ] Configuración del Colegio
- [ ] Gestión de Campus
- [ ] Gestión de Clases

## 🛠️ Desarrollo

### Agregar un nuevo módulo

1. Crear la carpeta en `app/(dashboard)/nuevo-modulo/`
2. Crear el archivo `page.tsx` con el componente
3. Agregar la ruta en el Sidebar (`components/layouts/Sidebar.tsx`)
4. Crear los servicios GraphQL necesarios
5. Agregar los componentes UI específicos

### Conectar con el Backend

El backend debe estar corriendo en `http://localhost:3000`. Para iniciar el backend:

```bash
cd ../backend
npm run start:dev
```

## 🐛 Solución de Problemas

### Error de autenticación
- Verifica que las credenciales de Firebase en `.env.local` sean correctas
- Asegúrate de que el proyecto de Firebase esté configurado correctamente

### Error de conexión con el backend
- Verifica que el backend esté corriendo en el puerto 3000
- Revisa la configuración de CORS en el backend
- Confirma que el `NEXT_PUBLIC_GRAPHQL_URL` sea correcto

### Problemas con las dependencias
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas de Desarrollo

- El proyecto usa Next.js 14 con App Router
- Todos los componentes del dashboard requieren autenticación
- El sistema es multi-tenant, cada colegio tiene su propio schema
- Los datos se obtienen via GraphQL del backend NestJS

## 🤝 Contribuir

1. Crear una rama desde `main`
2. Hacer los cambios necesarios
3. Asegurar que los tests pasen
4. Crear un Pull Request

## 📄 Licencia

Propiedad de ColeApp © 2025