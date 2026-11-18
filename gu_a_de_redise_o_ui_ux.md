# Guía de Rediseño UI/UX — Mi Chat App

Esta guía detalla las instrucciones para transformar la interfaz actual (basada en tonos neutros y azul estándar `#007AFF`) hacia un diseño **moderno, vibrante y dinámico**, aprovechando las librerías ya instaladas en el proyecto (`react-native-reanimated` v4 y `expo-symbols`).

---

## 1. Sistema de Diseño y Paleta de Colores ("Electric Pop")

Crea un archivo centralizado de tokens de diseño en `src/shared/theme/colors.ts` para evitar colores quemados (*hardcoded*) en los componentes.

### Paleta Principal
* **Primario (Violeta Eléctrico):** `#6C2BD9` (Headers, botones principales, burbujas propias).
* **Primario Hover / Activo:** `#551BB8`
* **Secundario / Acento (Coral Neón):** `#FF4D6D` (Botón flotante FAB, notificaciones, indicadores activos).
* **Acento Secundario (Cian Vibrante):** `#00D4FF` (Detalles, enlaces, avatares secundarios).

### Superficies y Fondos
* **Fondo Principal (`background`):** `#F4F2FA` (Un blanco con un sutil tinte lavanda que reduce la fatiga visual y hace resaltar las tarjetas).
* **Tarjetas y Superficies (`surface`):** `#FFFFFF`
* **Burbujas de Otros Usuarios (`bubbleOther`):** `#FFFFFF` con borde `#E2DDF5`.

### Texto y Estados
* **Texto Principal:** `#1A1429` (Casi negro con matiz púrpura profundo).
* **Texto Secundario:** `#6E6587`
* **Texto sobre Primario:** `#FFFFFF`
* **Éxito:** `#00C896`
* **Error:** `#FF2A5F`

---

## 2. Arquitectura de Estilos Centralizada

Crea `src/shared/theme/theme.ts` exportando:
1. **Colores** (`colors`).
2. **Espaciados** (`spacing`: `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`).
3. **Radios de borde** (`radius`: `sm: 8`, `md: 16`, `lg: 24`, `full: 9999`).
4. **Sombras suaves con tinte de color** (ej. sombra violeta para el botón de enviar y coral para el FAB).

---

## 3. Cambios por Pantalla y Componente

### A. Navegación y Headers (`app/(app)/_layout.tsx`)
* **Cambio de color:** Reemplazar `backgroundColor: "#007AFF"` por `#6C2BD9`.
* **Botón "Salir":** Cambiar el texto plano por un botón estilo *pill* (píldora) con fondo translúcido `rgba(255, 255, 255, 0.18)`, bordes redondeados (`borderRadius: 20`) y padding horizontal de `12px`.
* **Iconografía:** Utilizar `SymbolView` de `expo-symbols` (ej. `rectangle.portrait.and.arrow.right`) junto al texto.

### B. Autenticación (`app/(auth)/login.tsx` y `register.tsx`)
* **Fondo:** Aplicar `#F4F2FA` en el contenedor principal.
* **Tarjeta de Formulario:** Encerrar el título, inputs y botón dentro de una tarjeta blanca (`#FFFFFF`) con `borderRadius: 24`, `padding: 24` y sombra suave.
* **Inputs:**
  * Fondo `#F8F7FC` y borde `#E2DDF5`.
  * Al enfocar (`onFocus`), cambiar el color del borde a `#6C2BD9` (`borderWidth: 2`).
* **Botones:** Fondo `#6C2BD9`, `borderRadius: 14`, altura `52px` y sombra con `shadowColor: "#6C2BD9"`.

### C. Lista de Salas (`app/(app)/index.tsx`)
* **Tarjetas de Sala (`roomItem`):**
  * Dejar de usar una lista plana con líneas divisoras (`borderBottomWidth`).
  * Convertir cada sala en una **tarjeta independiente** con `marginHorizontal: 16`, `marginVertical: 6`, `borderRadius: 16`, fondo `#FFFFFF` y sombra ligera.
  * **Avatar de Sala:** Agregar a la izquierda un círculo de `44x44` con fondo `#EDE7FA` y el símbolo `#` en color `#6C2BD9` en negrita.
* **Botón Flotante (FAB):**
  * Cambiar el color azul por el **Coral Neón (`#FF4D6D`)**.
  * Aumentar tamaño a `60x60` (`borderRadius: 30`) con sombra coloreada (`shadowColor: "#FF4D6D"`, `shadowOpacity: 0.4`).
* **Modal "Nueva Sala":**
  * Redondear esquinas a `24px`.
  * Botón "Crear" en `#6C2BD9` y botón "Cancelar" con fondo gris/lavanda claro `#F4F2FA`.

### D. Sala de Chat (`app/(app)/chat/[roomId].tsx`)
* **Burbujas de Mensaje:**
  * **Propias (`own`):** Fondo `#6C2BD9`, texto `#FFFFFF`, esquinas redondeadas (`borderRadius: 18`) con la esquina inferior derecha más recta (`borderBottomRightRadius: 4`).
  * **De otros (`other`):** Fondo `#FFFFFF`, borde `#E2DDF5`, esquinas redondeadas (`borderRadius: 18`) con la esquina inferior izquierda más recta (`borderBottomLeftRadius: 4`).
  * **Nombre del autor:** Usar colores dinámicos basados en el `userId` (ej. alternar entre `#FF4D6D`, `#0099CC` y `#6C2BD9`) para distinguir fácilmente quién habla en chats grupales.
* **Barra de Entrada (`inputRow`):**
  * Hacerla flotante sobre el fondo `#F4F2FA` (sin borde superior recto), con `margin: 10`, `borderRadius: 28`, fondo `#FFFFFF` y sombra suave.
  * Botón de enviar circular en `#FF4D6D` o `#6C2BD9`.

---

## 4. Animaciones Sencillas con `react-native-reanimated`

El proyecto ya cuenta con `react-native-reanimated` (`4.5.1`). Implementa estas 4 micro-interacciones de bajo costo de rendimiento:

### 1. Entrada de Mensajes en el Chat
En `app/(app)/chat/[roomId].tsx`, envuelve la burbuja del mensaje en un `Animated.View` usando las animaciones de entrada predefinidas:
* **Efecto:** Deslizamiento sutil desde abajo + aparición gradual.
* **Implementación sugerida:**
  ```tsx
  import Animated, { FadeInUp } from "react-native-reanimated";

  // Dentro de renderMsg:
  <Animated.View entering={FadeInUp.duration(250).springify()}>
    {/* Contenido de la burbuja */}
  </Animated.View>
  ```

### 2. Aparición Escalonada en la Lista de Salas
En `app/(app)/index.tsx`, anima cada tarjeta de sala según su `index` en el `FlatList`:
* **Efecto:** Las tarjetas entran una tras otra suavemente al cargar la pantalla.
* **Implementación sugerida:**
  ```tsx
  import Animated, { FadeInRight } from "react-native-reanimated";

  // Dentro de renderRoom ({ item, index }):
  <Animated.View entering={FadeInRight.delay(index * 60).duration(300)}>
    {/* TouchableOpacity de la sala */}
  </Animated.View>
  ```

### 3. Efecto Rebote (Scale) en Botones Principales
Crea un componente reutilizable `src/shared/components/AnimatedButton.tsx` para el FAB, el botón de enviar y los botones de Login/Registro:
* **Efecto:** Al presionar (`onPressIn`), el botón se encoge ligeramente (`scale: 0.94`) y al soltar (`onPressOut`) vuelve a `1` con física de resorte (`withSpring`).

### 4. Transición del Modal de Nueva Sala
En `app/(app)/index.tsx`, reemplaza la aparición estática de la caja `.dialog` dentro del `Modal` por:
* **Efecto:** Escala desde `0.9` a `1.0` junto con `FadeIn` (`ZoomIn.duration(200)`), logrando que la ventana emergente se sienta ágil y moderna.

---

## 5. Checklist de Implementación

- [ ] Crear `src/shared/theme/colors.ts` y `src/shared/theme/theme.ts`.
- [ ] Crear componente `AnimatedButton` con `useSharedValue` y `withSpring`.
- [ ] Actualizar colores del header en `app/(app)/_layout.tsx`.
- [ ] Rediseñar tarjetas y estados `:focus` en `login.tsx` y `register.tsx`.
- [ ] Aplicar diseño de tarjetas, avatar `#` y animación `FadeInRight` en `app/(app)/index.tsx`.
- [ ] Estilizar burbujas asimétricas, barra flotante y animación `FadeInUp` en `app/(app)/chat/[roomId].tsx`.
- [ ] Ejecutar `npx expo lint` y `npx tsc --noEmit` para verificar que no existan errores de tipos.