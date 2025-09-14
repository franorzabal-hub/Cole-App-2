# ColeApp Mobile - App de Comunicación Escolar

App móvil para iOS desarrollada en React Native para la comunicación entre colegios y familias.

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- npm o yarn
- Xcode (para iOS)
- CocoaPods
- Expo CLI (`npm install -g expo-cli`)

### Instalación

1. **Instalar dependencias**
```bash
npm install --legacy-peer-deps
# o
yarn install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

3. **Instalar pods de iOS (solo Mac)**
```bash
cd ios
pod install
cd ..
```

### Ejecutar la App

#### Modo Desarrollo con Expo

```bash
# Iniciar Expo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android
```

#### Opción para iPhone físico

1. **Instala la app Expo Go** desde el App Store
2. **Escanea el código QR** que aparece en la terminal
3. O **ingresa manualmente** la URL que aparece en terminal

### Credenciales de Prueba

Para iniciar sesión usa:
- **Email**: test@test.com
- **Contraseña**: password123

## 📱 Características

### Pantallas Principales (Tab Bar)

1. **Novedades** - Anuncios y comunicados del colegio
2. **Eventos** - Calendario de actividades escolares
3. **Mensajes** - Chat con profesores y administración
4. **Salidas** - Solicitud de permisos de salida anticipada
5. **Boletines** - Calificaciones e informes académicos

### Funcionalidades

- ✅ Autenticación con Supabase
- ✅ Notificaciones push
- ✅ Navegación con tabs inferior (estilo iOS)
- ✅ Redux para manejo de estado
- ✅ Soporte multiidioma (ES/EN)
- ✅ Modo offline con caché
- ✅ Carga de imágenes y documentos
- ✅ Tema claro/oscuro automático

## 🏗️ Estructura del Proyecto

```
src/
├── components/      # Componentes reutilizables
│   ├── ui/         # Componentes de UI
│   └── ...
├── contexts/        # Context providers
├── data/           # Mock data centralizado
├── hooks/          # Custom hooks
├── i18n/           # Traducciones
├── navigation/     # Navegación y rutas
├── screens/        # Pantallas de la app
│   ├── auth/       # Login, registro
│   ├── events/     # Eventos
│   ├── messages/   # Mensajes
│   ├── news/       # Novedades
│   ├── permissions/ # Permisos de salida
│   ├── profile/    # Perfil de usuario
│   ├── reports/    # Boletines
│   └── settings/   # Configuración
├── services/       # APIs y servicios
├── store/          # Redux store y slices
├── theme/          # Tema y estilos
└── utils/          # Utilidades
```

## 🔧 Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)

2. Configurar las tablas según `DATABASE_SCHEMA.md`

3. Obtener las credenciales:
   - Project URL
   - Anon Key

4. Actualizar `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 📝 Scripts Disponibles

```json
{
  "start": "Inicia Expo",
  "ios": "Ejecuta en simulador iOS",
  "android": "Ejecuta en emulador Android",
  "test": "Ejecuta tests",
  "lint": "Verifica código",
  "typecheck": "Verifica tipos TypeScript"
}
```

## 🎨 Personalización

### Colores del Tema

Editar `src/theme/tokens.ts`:

```typescript
colors: {
  primary: '#2089dc',    // Azul principal
  secondary: '#8F0CE8',  // Morado
  success: '#52c41a',    // Verde
  warning: '#faad14',    // Amarillo
  error: '#ff190c',      // Rojo
}
```

### Iconos del Tab Bar

Los iconos están en `src/navigation/AppNavigator.tsx` usando Material Icons.

## 🐛 Solución de Problemas

### Error de pods en iOS

```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Limpiar caché

```bash
npx expo start -c
```

### Reset Metro bundler

```bash
npx react-native start --reset-cache
```

### Problemas con "too many open files" (macOS)

```bash
# Opción 1: Usar localhost
npx expo start --localhost

# Opción 2: Aumentar límite (requiere reinicio)
sudo launchctl limit maxfiles 65536 200000
```

### Problemas de conexión con Expo Go

1. Asegúrate de que iPhone y Mac estén en la **misma red WiFi**
2. En Expo Go, toca **"Enter URL manually"**
3. Ingresa la URL que aparece en terminal (ej: `exp://192.168.1.X:8081`)
4. Si no funciona, prueba con `exp://localhost:8081`

## 📊 Estado Actual del Proyecto

✅ **Mock Data**: Centralizado en `src/data/mockData.ts`
✅ **Autenticación**: Mock implementado para desarrollo
✅ **UI/UX**: Diseño iOS nativo completamente implementado
✅ **Navegación**: Tab bar y stack navigation configurados
✅ **Temas**: Soporte para modo claro/oscuro
✅ **Internacionalización**: Configurado para múltiples idiomas
✅ **Estado**: Redux configurado para todas las pantallas

## 🔄 Próximos Pasos

1. **Conectar con Supabase real** (actualmente usa mock data)
2. **Implementar notificaciones push** reales
3. **Agregar tests unitarios** y de integración
4. **Optimizar rendimiento** y bundle size
5. **Implementar deep linking** completo

## 📚 Documentación Técnica

- **Base de Datos**: Ver `DATABASE_SCHEMA.md` para estructura completa
- **UX/UI**: Ver `UX-UI-NOTES.md` para guías de diseño

## 📚 Enlaces Útiles

- [React Native](https://reactnative.dev)
- [Expo](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Supabase](https://supabase.com/docs)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Abrir Pull Request

## 📄 Licencia

MIT License