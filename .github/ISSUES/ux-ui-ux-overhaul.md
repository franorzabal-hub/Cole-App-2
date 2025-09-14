## UX/UI Overhaul – Cole App (Mobile)

Contexto

- App Expo/React Native con React Navigation, Redux Toolkit, i18n y `react-native-elements`.
- Varias pantallas repiten patrones de UI (tarjetas, chips, badges) con estilos hardcoded.
- Oportunidad de consolidar diseño, accesibilidad, i18n y performance de listas.

Objetivos

- Mejorar consistencia visual y accesibilidad.
- Alinear navegación y headers (large title + compact) como patrón único.
- Centralizar tokens de diseño (colores, tipografías, espaciados) y preparar dark mode.
- Optimizar rendimiento con `FlatList` y estados de carga.

Alcance (Checklist)

- [x] i18n en labels de tabs y títulos; reactivar detección de locale. (labels)
- [x] Estado de carga inicial visible (no pantalla en blanco).
- [x] Convertir listas basadas en `ScrollView` a `FlatList` con `ListEmptyComponent` y `RefreshControl` (News, Events, Messages).
- [x] Unificar y ampliar `IOSHeader` (subtitle, rightButton, onBackPress) y su uso.
- [x] Corregir duplicación de rutas en `AppNavigator` (Tabs vs Stack) para `ExitPermissions`.
- [x] Agregar CTA en estados vacíos (Mensajes, Permisos, Reportes).
- [x] Centralizar colores/tokens en `src/theme/tokens.ts` (primary, neutrales, semantic). (base)
- [ ] Reemplazar colores hardcoded clave (primary, grises, backgrounds) en componentes principales. (parcial)
  - Se migraron News, Events, Messages, Reports, ExitPermissions, Calendar, CustomHeader, EventDetail a tokens.
- [x] Accesibilidad: roles/labels en icon buttons y chips; tamaño táctil mínimo 44x44. (parcial)
- [x] `tabBarBadge` para contadores de no leídos en Tabs.
- [x] Preparar estructura para Dark Mode (tema claro/oscuro).

Notas técnicas

- Reutilizar `ThemeProvider` existente, pero mover constantes a `tokens.ts` y exportar `lightTheme`/`darkTheme` en futuro PR.
- Mantener difs pequeños por archivo y sin romper API actual.

Plan de implementación (fases)

1) Quick wins: i18n en tabs, loader inicial, `FlatList` en 3 pantallas, `IOSHeader` props, rutas duplicadas, badges y a11y básicos.
2) Tokens de diseño + migración gradual de colores.
3) Componentes reutilizables (Card, FilterChip, Badge) y dark mode.

Registro de cambios (se irá completando)

- Implementaciones incluidas:
  - [x] i18n tabs/títulos (AppNavigator)
  - [x] Loader inicial (AppNavigator)
  - [x] `FlatList` en News, Events, Messages (+ headers y empty states)
  - [x] `IOSHeader` actualizado (subtitle/rightButton/onBackPress + a11y)
  - [x] Rutas duplicadas `ExitPermissions` corregidas (Stack)
  - [x] CTA en vacíos (Mensajes: “Nuevo mensaje”; Permisos: “Solicitar cambio”; Reportes: “Actualizar”)
  - [x] `tabBarBadge` dinámico para News/Events/Messages
  - [x] A11y en botones clave (FABs, back, chips)
  - [x] `tokens.ts` base + uso en AppNavigator e IOSHeader
  - [x] Migración a `Animated.FlatList` en Reports y ExitPermissions
  - [x] Componentes UI base: `Card`, `FilterChip`, `Badge` (aplicación parcial en filtros y tarjetas)
  - [x] Soporte de temas `light/dark` vía `useColorScheme` en `App.tsx` y temas para React Navigation y RNE

Follow‑ups

- Reemplazar colores hardcoded restantes por tokens y adoptar los componentes comunes en más pantallas.
- Añadir Skeletons y Toasts utilitarios.
- Integración de `expo-localization` y `expo-notifications` real.
  - `expo-localization` integrado para detectar idioma automáticamente.

Comentario de cierre (borrador)

Se implementaron los quick wins, migraciones de listas y la base de tokens/temas:

- i18n en labels de Tabs y títulos de Tabs.
- Loader inicial visible mientras se resuelve sesión.
- Migración a `Animated.FlatList` en News, Events, Messages, Reports y ExitPermissions con `ListHeaderComponent` y `ListEmptyComponent`.
- `IOSHeader` extendido con `subtitle`, `rightButton` y `onBackPress` y mejoras de accesibilidad.
- Limpieza de rutas duplicadas para `ExitPermissions` en el Stack principal.
- CTA en vacíos (Mensajes: iniciar conversación; Permisos: crear solicitud; Reportes: actualizar).
- Badges de Tabs mediante `tabBarBadge` usando conteos de `UnreadContext`.
- Tokens de diseño iniciales en `src/theme/tokens.ts` y adopción parcial en navegación y header; componentes `Card`, `FilterChip` y `Badge` implementados y usados en filtros y tarjetas.
- Soporte para temas claro/oscuro mediante `useColorScheme` y temas para React Navigation y react-native-elements.

Quedan abiertos para un siguiente PR: sustituir colores hardcoded restantes por tokens, aplicar componentes comunes en todas las pantallas y completar cobertura visual del dark mode.
