# Instrucciones para el Agente: Documentación de Clean Architecture

Copia y entrega las siguientes instrucciones a tu agente de código para que audite el repositorio y genere el documento `CLEAN_ARCHITECTURE.md`.

---

## Prompt / Directiva para el Agente

> **Rol:** Actúa como un Arquitecto de Software Senior especializado en React Native, Expo y Clean Architecture.
>
> **Objetivo:** Analiza la estructura completa del proyecto y genera un nuevo archivo en la raíz llamado `CLEAN_ARCHITECTURE.md` que demuestre técnicamente cómo este proyecto implementa **Clean Architecture** y la **Regla de Dependencia**.

### 1. Estructura Obligatoria del Archivo `CLEAN_ARCHITECTURE.md`

El documento resultante debe contener las siguientes secciones en orden:

1. **Resumen Arquitectónico y Regla de Dependencia:**
   * Explicar cómo las capas internas (`domain`) no dependen de las externas (`infrastructure`, `presentation`, `app/`).
   * Incluir un diagrama en texto (ASCII o Mermaid) mostrando el flujo de dependencias entre `app/` $\rightarrow$ `presentation` $\rightarrow$ `application` $\rightarrow$ `domain` $\leftarrow$ `infrastructure`.

2. **Mapa de Rutas por Capa (Feature-Based):**
   * Listar explícitamente las rutas reales de este proyecto organizadas por capas para los módulos `auth`, `chat` y `shared`:
     * **Capa de Dominio (`domain`):**
       * `src/features/auth/domain/entities/User.ts`
       * `src/features/auth/domain/repositories/IAuthRepository.ts`
       * `src/features/chat/domain/entities/Room.ts`
       * `src/features/chat/domain/entities/Message.ts`
       * `src/features/chat/domain/repositories/IChatRepository.ts`
       * `src/shared/domain/errors/AppError.ts`
     * **Capa de Aplicación (`application`):**
       * `src/features/auth/application/use-cases/LoginUseCase.ts`
       * `src/features/auth/application/use-cases/RegisterUseCase.ts`
       * `src/features/chat/application/use-cases/CreateRoomUseCase.ts`
       * `src/features/chat/application/use-cases/GetMessagesUseCase.ts`
       * `src/features/chat/application/use-cases/SendMessageUseCase.ts`
       * `src/features/chat/application/use-cases/SubscribeToRoomUseCase.ts`
     * **Capa de Infraestructura (`infrastructure`):**
       * `src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts`
       * `src/features/chat/infrastructure/repositories/SupabaseChatRepository.ts`
       * `src/shared/infrastructure/supabase/client.ts`
     * **Capa de Presentación y Enrutamiento (`presentation` y `app/`):**
       * `src/features/auth/presentation/hooks/useAuth.ts`
       * `src/features/auth/presentation/store/authStore.ts`
       * `src/features/chat/presentation/hooks/useRooms.ts`
       * `src/features/chat/presentation/hooks/useChat.ts`
       * `app/_layout.tsx`, `app/(auth)/login.tsx`, `app/(app)/index.tsx`, `app/(app)/chat/[roomId].tsx`

3. **Evidencia en Código por Capa:**
   * Para cada una de las 4 capas, extraer fragmentos reales de los archivos listados arriba demostrando:
     * **Inversión de Dependencias (DIP):** Interfaces en `domain` implementadas en `infrastructure`.
     * **Aislamiento de Reglas de Negocio:** Validaciones puras en `application` sin importar Supabase ni React.
     * **Desacoplamiento de UI:** Hooks en `presentation` actuando como adaptadores hacia TanStack Query y Zustand.

4. **Trazabilidad de un Flujo Completo (End-to-End):**
   * Documentar paso a paso con rutas exactas qué ocurre cuando un usuario envía un mensaje (desde `app/(app)/chat/[roomId].tsx` pasando por `useChat.ts`, `SendMessageUseCase.ts`, `IChatRepository.ts` hasta `SupabaseChatRepository.ts`).

---

### 2. Regla Estricta de Comentarios en el Código (CRÍTICO)

Al incluir bloques de código en `CLEAN_ARCHITECTURE.md` (y si se solicita documentar los archivos fuente), debes cumplir **sin excepción** las siguientes reglas para los comentarios:

* **Solo en líneas de alta importancia:** Comenta únicamente declaraciones de interfaces, inyección de dependencias, validaciones de negocio, contratos de repositorio, mapeos de entidades y llamadas críticas de estado. No comentes imports triviales o llaves de cierre.
* **Límite estricto de longitud:** Cada comentario debe tener **MÁXIMO 10 PALABRAS**.
* **Estilo directo:** Usa verbos en infinitivo o tercera persona, sin relleno.

#### Ejemplos Válidos (Cumplen $\le$ 10 palabras)

```typescript
// Define contrato puro del repositorio sin dependencias externas.
export interface IChatRepository {
  // Persiste mensaje y devuelve entidad de dominio mapeada.
  sendMessage(roomId: string, userId: string, content: string): Promise<Message>;
}
```

```typescript
// Inyecta abstracción del repositorio mediante inversión de dependencias.
constructor(private readonly chatRepo: IChatRepository) {}

// Valida regla de negocio antes de tocar infraestructura.
if (trimmed.length > 500) throw new ChatError("Máximo 500 caracteres");
```

```typescript
// Implementa contrato de dominio usando el cliente de Supabase.
export class SupabaseChatRepository implements IChatRepository {
  // Convierte fila cruda de base de datos a entidad.
  private mapMessage = (raw: any): Message => ({ ... });
}
```

#### Ejemplos Inválidos (Prohibidos por exceder 10 palabras)

* ❌ `// Esta interfaz sirve para definir todos los métodos que el repositorio de chat va a necesitar implementar en la capa de infraestructura.` *(22 palabras - Rechazado)*

---

### 3. Checklist de Verificación Final para el Agente

Antes de finalizar la tarea, el agente debe comprobar:

* [ ] ¿Todas las rutas mencionadas existen realmente en `src/` y `app/`?
* [ ] ¿Cada bloque de código incluye la ruta exacta de su archivo como encabezado?
* [ ] ¿Todos los comentarios añadidos en las líneas clave tienen **10 palabras o menos**?
* [ ] ¿Se demuestra claramente que `domain` y `application` no importan nada de `@supabase/supabase-js` ni `react-native`?