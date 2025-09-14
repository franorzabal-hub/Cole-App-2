# Notas de UX/UI Overhaul – Mobile App

## Resumen

- Se unificó UX entre secciones, con headers consistentes, listas virtualizadas y estados vacíos accionables.
- Se agregaron tokens de diseño, soporte de light/dark theme y badges nativos en tabs.
- Se mejoró accesibilidad (labels y rol en botones, tamaños táctiles) y se añadieron skeletons y toasts ligeros.

## Cambios relevantes

- i18n tabs/títulos con `react-i18next`; detección de idioma con `expo-localization`.
- `IOSHeader` extendido: `subtitle`, `rightButton`, `onBackPress` + a11y.
- Listas migradas a `Animated.FlatList` con `ListHeaderComponent`, `ListEmptyComponent` y pull-to-refresh.
- Componentes UI: `Card`, `FilterChip`, `Badge` y `Skeleton` básicos.
- Tokens de diseño en `src/theme/tokens.ts` y temas de navegación/RNE en `src/theme/themes.ts`.
- Dark mode habilitado vía `useColorScheme()` en `App.tsx`.
- Badges de tabs con `tabBarBadge` (News/Events/Messages).

## Cómo probar

- Navegación y tabs: verifica labels localizados y badges dinámicos.
- Estados de carga: al abrir la app, se muestra spinner; en listas, usa pull-to-refresh para skeleton/empty.
- Dark mode: cambia tema del sistema y confirma colores en pantallas (News, Events, Messages, Reports, ExitPermissions, EventDetail, Calendar, Login).
- Accesibilidad: VoiceOver/TalkBack sobre back button, FABs y chips de filtros (debe anunciar rol/label).
- Rendimiento: scroll fluido y sin janks en listas largas.

## i18n y localización

- `expo-localization` determina `languageCode`. Fallback a `es`.
- Evitar textos hardcoded en nuevas pantallas; añadir al namespace correspondiente.

## Dark mode

- Theming para React Navigation y RNE (`lightNavTheme/darkNavTheme`, `lightRNETheme/darkRNETheme`).
- Tokens neutros (textPrimary, textSecondary, textMuted) ya aplicados en pantallas principales.

## Accesibilidad

- `accessibilityRole`/`accessibilityLabel` en back/profile/FABs/chips.
- Asegurar área táctil ≥ 44x44; chips/íconos con padding suficiente.

## Performance

- Reemplazo de `ScrollView + map` por `FlatList`.
- Uso de headers/empties en listas; posibilidad de memoizar tarjetas si se detecta re-render.

## Riesgos/impacto

- Estilos: migración parcial a tokens; algunos colores hardcoded pueden persistir en pantallas menos usadas.
- Navegación: se evitó duplicar rutas de ExitPermissions en Stack; revisar deep links si los hubiera.

## Pendientes (siguientes PRs)

- Sustituir colores hardcoded restantes por tokens y ampliar componentes comunes.
- Toasts no bloqueantes de manera uniforme (Android: Toast, iOS: banner in-app).
- `expo-notifications` con deep linking a detalle de News/Events/Chat.
- Skeleton con shimmer y test de performance en Android low-end.

## Checklist de revisión

- [ ] Labels/títulos localizados en tabs y headers.
- [ ] Dark mode correcto en pantallas clave y en Navigation.
- [ ] Accesibilidad básica OK en botones y filtros.
- [ ] Scroll y refresco sin bloqueos.
- [ ] Estados vacíos siempre con CTA útil.

