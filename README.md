# ColeApp - Sistema de Comunicación Escolar

Sistema multitenant de comunicación entre colegios y familias con campos dinámicos y reglas de negocio personalizables.

## 🏗️ Arquitectura

### Stack Tecnológico

- **Mobile App (iOS)**: React Native + Expo
- **Web Admin**: Next.js 14 + shadcn/ui
- **Backend**: NestJS + GraphQL/REST
- **Database**: PostgreSQL (multitenant con schema-per-tenant)
- **Cache**: Redis
- **Cloud**: Google Cloud Platform

## 📁 Estructura del Proyecto

```
Cole-App-2/
├── mobile-app/          # App React Native para iOS/Android
├── backend/             # API NestJS con GraphQL y REST
├── web-admin/           # Panel administrativo Next.js
├── infrastructure/      # Configuración de infraestructura
│   └── terraform/       # IaC con Terraform para GCP
├── .github/             # CI/CD con GitHub Actions
└── docker-compose.yml   # Desarrollo local
```

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 20+
- Docker y Docker Compose
- Cuenta de Google Cloud Platform
- Firebase Project configurado

### Desarrollo Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Cole-App-2
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Iniciar servicios con Docker**
```bash
docker-compose up -d
```

4. **Instalar dependencias**
```bash
# Backend
cd backend && npm install

# Web Admin
cd ../web-admin && npm install

# Mobile App
cd ../mobile-app && npm install
```

5. **Ejecutar migraciones**
```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

6. **Iniciar aplicaciones**
```bash
# Backend (http://localhost:3000)
cd backend && npm run start:dev

# Web Admin (http://localhost:3001)
cd web-admin && npm run dev

# Mobile App
cd mobile-app && npm run ios
```

## 📊 Base de Datos Multitenant

El sistema utiliza una estrategia **schema-per-tenant** donde:
- Schema `public`: Datos globales (tenants, usuarios)
- Schema por colegio: Datos aislados de cada institución
- Campos dinámicos configurables por tenant

## 🔐 Seguridad

- Autenticación con Firebase Auth
- JWT para autorización de API
- Encriptación TLS 1.3
- Secrets management con Google Secret Manager
- Rate limiting por tenant
- OWASP compliance

## 🌟 Características Principales

### Mobile App
- Mensajería bidireccional
- Notificaciones push
- Calendario de eventos
- Permisos de salida digitales
- Boletines y calificaciones

### Web Admin
- Gestión de usuarios y roles
- Configuración de campos personalizados
- Reglas de negocio configurables
- Reportes y analytics
- Publicación de contenido

### Backend
- API GraphQL y REST
- Sistema de colas con Bull
- Cache con Redis
- Multitenancy nativo
- Webhooks y eventos

## 📱 Módulos del Sistema

1. **Autenticación**: Login, SSO, roles y permisos
2. **Comunicación**: Mensajes, anuncios, notificaciones
3. **Eventos**: Calendario escolar, RSVP
4. **Permisos**: Salidas anticipadas digitales
5. **Académico**: Calificaciones, asistencia, reportes
6. **Administración**: Configuración por colegio

## 🚀 Despliegue

### Google Cloud Platform

1. **Configurar Terraform**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

2. **Deploy con GitHub Actions**
- Push a `main` despliega a producción
- Push a `develop` despliega a staging

### Servicios GCP Utilizados
- Cloud Run (aplicaciones containerizadas)
- Cloud SQL (PostgreSQL)
- Memorystore (Redis)
- Cloud Storage (archivos)
- Secret Manager (credenciales)
- Cloud Build (CI/CD)

## 📈 Monitoreo

- Cloud Monitoring para métricas
- Cloud Logging para logs centralizados
- Cloud Trace para tracing distribuido
- Alertas automatizadas
- Dashboards por tenant

## 🧪 Testing

```bash
# Backend
cd backend
npm test
npm run test:e2e

# Web Admin
cd web-admin
npm test

# Mobile App
cd mobile-app
npm test
```

## 📝 Documentación

- API Docs: http://localhost:3000/api/docs
- GraphQL Playground: http://localhost:3000/graphql
- Arquitectura: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.