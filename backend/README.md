# ColeApp Backend - NestJS + GraphQL + Prisma

## Arquitectura

Backend enterprise con arquitectura multitenant (schema-per-tenant) siguiendo el documento `ARCHITECTURE.md`.

### Stack Tecnológico
- **Framework:** NestJS
- **API:** GraphQL (Apollo Server) + REST
- **ORM:** Prisma con soporte multischema
- **Database:** PostgreSQL 15
- **Auth:** Firebase Auth + JWT
- **Cache:** Redis
- **Queue:** Bull
- **Storage:** Google Cloud Storage

## Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Configurar base de datos:**
```bash
# Crear base de datos PostgreSQL
createdb coleapp

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev
```

4. **Iniciar Redis (requerido para Bull):**
```bash
# Con Docker
docker run -d -p 6379:6379 redis

# O con Homebrew (macOS)
brew services start redis
```

## Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run start:dev

# Modo producción
npm run start:prod

# Tests
npm run test
npm run test:e2e
```

## GraphQL Playground

Disponible en: http://localhost:3000/graphql

### Queries de ejemplo:

```graphql
# Login
mutation {
  login(input: {
    email: "admin@coleapp.com"
    password: "password123"
  }) {
    accessToken
    user {
      id
      email
      firstName
      lastName
    }
  }
}

# Obtener novedades
query {
  news(tenantId: "tenant-id") {
    id
    title
    content
    priority
    isRead
  }
}

# Crear novedad
mutation {
  createNews(
    tenantId: "tenant-id"
    input: {
      campusId: "campus-id"
      title: "Nueva actividad"
      content: "Contenido de la novedad"
      priority: "high"
    }
  ) {
    id
    title
  }
}
```

## Estructura de Módulos

```
src/
├── auth/           # Autenticación con Firebase y JWT
├── tenant/         # Gestión de tenants (colegios)
├── prisma/         # Servicio Prisma con soporte multitenant
├── news/           # Módulo de novedades
├── events/         # Módulo de eventos
├── messages/       # Módulo de mensajes
├── exits/          # Módulo de permisos de salida
├── reports/        # Módulo de boletines
├── students/       # Módulo de estudiantes
└── custom-fields/  # Campos dinámicos por tenant
```

## Arquitectura Multitenant

Cada colegio tiene su propio schema PostgreSQL aislado:

- **Schema `public`:** Datos compartidos (usuarios, tenants, roles)
- **Schema `tenant_*`:** Datos específicos del colegio

### Crear nuevo tenant:

```graphql
mutation {
  createTenant(input: {
    name: "Colegio San José"
    subdomain: "sanjose"
    contactEmail: "info@sanjose.edu"
  }) {
    id
    schemaName
  }
}
```

## Campos Dinámicos

Los tenants pueden agregar campos personalizados:

```graphql
mutation {
  createCustomField(input: {
    tenantId: "tenant-id"
    entityType: "student"
    fieldName: "alergias"
    fieldType: "text"
    fieldLabel: "Alergias"
    isRequired: false
  }) {
    id
    fieldName
  }
}
```

## Seguridad

- Row Level Security mediante tenant isolation
- JWT tokens con expiración configurable
- Firebase Auth para autenticación móvil
- Rate limiting por tenant
- Audit logs

## Deployment

### Docker

```bash
# Build
docker build -t coleapp-backend .

# Run
docker run -p 3000:3000 --env-file .env coleapp-backend
```

### Google Cloud Run

```bash
# Build y push
gcloud builds submit --tag gcr.io/[PROJECT-ID]/coleapp-backend

# Deploy
gcloud run deploy coleapp-backend \
  --image gcr.io/[PROJECT-ID]/coleapp-backend \
  --platform managed \
  --region us-central1
```

## Monitoreo

- Health check: `GET /health`
- Metrics: Integrado con Cloud Monitoring
- Logs: Structured logging con Winston
- APM: Cloud Trace integration

## Licencia

Privado - ColeApp © 2024