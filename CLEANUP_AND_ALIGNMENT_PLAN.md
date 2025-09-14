# Plan de Limpieza y Alineación - ColeApp

## 📊 Análisis de Situación Actual

### 1. Inconsistencias Detectadas

#### Arquitectura Definida (ARCHITECTURE.md)
- **Backend**: NestJS + GraphQL + Prisma
- **Database**: PostgreSQL con arquitectura multitenant (schema-per-tenant)
- **Auth**: Firebase Auth + JWT personalizado
- **Cache**: Redis
- **Cloud**: Google Cloud Platform

#### Implementación Actual
- **Backend NestJS**: ✅ Existe pero incompleto
  - Módulos implementados: auth, news, tenant, prisma
  - Falta: events, messages, exits, reports, students
- **Frontend Mobile**: ⚠️ Usa servicios Supabase (debe migrar a NestJS)
- **Database**: ⚠️ Referencias mixtas (Supabase + Prisma schema)

### 2. Archivos y Referencias de Supabase a Eliminar

```
📁 Archivos principales:
- /SUPABASE_SETUP.md (eliminar)
- /mobile-app/src/config/supabase.ts (eliminar)
- /mobile-app/.env.example (actualizar)

📁 Servicios en mobile-app que usan Supabase:
- src/services/auth.service.ts
- src/services/news.service.ts
- src/services/events.service.ts
- src/services/messages.service.ts
- src/services/exits.service.ts
- src/services/reports.service.ts

📦 Dependencia NPM:
- @supabase/supabase-js (eliminar de package.json)
```

---

## 🎯 Plan de Acción

### Fase 1: Limpieza de Supabase ✅

1. **Eliminar archivos de Supabase**
   - [ ] Eliminar SUPABASE_SETUP.md
   - [ ] Eliminar mobile-app/src/config/supabase.ts
   - [ ] Eliminar dependencia @supabase/supabase-js

2. **Actualizar servicios del frontend**
   - [ ] Crear nueva configuración API para NestJS
   - [ ] Refactorizar todos los servicios para usar API REST/GraphQL
   - [ ] Actualizar variables de entorno

### Fase 2: Completar Backend NestJS 🚧

#### Módulos Faltantes a Implementar:

1. **Events Module**
   - EventsService
   - EventsResolver (GraphQL)
   - EventsController (REST)
   - DTOs y validaciones

2. **Messages Module**
   - MessagesService
   - MessagesResolver
   - MessagesController
   - Sistema de templates

3. **Exits Module**
   - ExitsService
   - ExitsResolver
   - ExitsController
   - Workflow de aprobación

4. **Reports Module**
   - ReportsService
   - ReportsResolver
   - ReportsController
   - Generación de PDF

5. **Students Module**
   - StudentsService
   - StudentsResolver
   - StudentsController
   - Relaciones familiares

#### Configuración de Base de Datos:

1. **Prisma Schema** (ya existe pero necesita)
   - [ ] Completar modelos tenant-specific
   - [ ] Crear migraciones iniciales
   - [ ] Seed data para desarrollo

2. **PostgreSQL Setup**
   - [ ] Script de creación de base de datos
   - [ ] Script de creación de schemas por tenant
   - [ ] Configuración de connection pooling

### Fase 3: Integración Frontend-Backend 🔄

1. **Crear API Client para Mobile**
   ```typescript
   // mobile-app/src/config/api.ts
   - Configuración base URL
   - Interceptores para auth
   - Manejo de errores
   - Client GraphQL (Apollo)
   ```

2. **Refactorizar Servicios**
   - Migrar de Supabase a NestJS API
   - Mantener misma interfaz para minimizar cambios
   - Implementar cache local

3. **Autenticación**
   - Firebase Auth en mobile
   - JWT validation en backend
   - Refresh token flow

---

## 📋 Estado del Backend NestJS

### ✅ Implementado
- Estructura base del proyecto
- Módulo Prisma con soporte multitenant
- Módulo Auth (parcial)
- Módulo News (básico)
- Módulo Tenant
- GraphQL setup básico

### 🚧 Falta Implementar
- [ ] Completar Auth module (guards, strategies)
- [ ] Events module completo
- [ ] Messages module completo
- [ ] Exits module completo
- [ ] Reports module completo
- [ ] Students module completo
- [ ] Custom Fields implementation
- [ ] File upload (Google Cloud Storage)
- [ ] Redis cache integration
- [ ] Bull queue setup
- [ ] WebSockets para real-time
- [ ] Tests unitarios y E2E

### 🔧 Configuración Pendiente
- [ ] Variables de entorno completas
- [ ] Docker compose para desarrollo
- [ ] Scripts de base de datos
- [ ] CI/CD pipeline

---

## 🚀 Comandos para Ejecutar

### 1. Limpiar Supabase del Frontend
```bash
# Eliminar dependencia
cd mobile-app
npm uninstall @supabase/supabase-js

# Eliminar archivos
rm src/config/supabase.ts
rm ../SUPABASE_SETUP.md
```

### 2. Setup Backend
```bash
cd backend

# Instalar dependencias
npm install

# Setup database
createdb coleapp

# Generar Prisma Client
npx prisma generate

# Crear migraciones
npx prisma migrate dev --name init

# Iniciar backend
npm run start:dev
```

### 3. Actualizar Frontend
```bash
cd mobile-app

# Instalar nuevas dependencias
npm install axios @apollo/client graphql

# Actualizar variables de entorno
echo "API_URL=http://localhost:3000" >> .env
echo "GRAPHQL_URL=http://localhost:3000/graphql" >> .env
```

---

## 📊 Estimación de Tiempo

| Fase | Tareas | Tiempo Estimado |
|------|---------|-----------------|
| **Fase 1** | Limpieza Supabase | 2-3 horas |
| **Fase 2** | Completar Backend | 2-3 días |
| **Fase 3** | Integración | 1-2 días |
| **Testing** | Pruebas integrales | 1 día |
| **TOTAL** | | **4-6 días** |

---

## 🎯 Resultado Esperado

1. **Backend NestJS** completamente funcional con:
   - Todos los módulos implementados
   - GraphQL y REST APIs
   - Autenticación Firebase + JWT
   - Base de datos PostgreSQL multitenant
   - Redis cache y Bull queues

2. **Frontend Mobile** conectado a NestJS:
   - Sin dependencias de Supabase
   - Usando GraphQL para queries complejas
   - REST para operaciones simples
   - Autenticación integrada

3. **Documentación** actualizada:
   - Sin referencias a Supabase
   - Guías de setup para NestJS
   - API documentation

---

## ⚡ Próximos Pasos Inmediatos

1. Eliminar todos los archivos y referencias de Supabase
2. Completar los módulos faltantes en el backend
3. Crear el cliente API en el frontend
4. Migrar los servicios uno por uno
5. Probar la integración completa

---

*Documento creado: 14 de Septiembre de 2025*