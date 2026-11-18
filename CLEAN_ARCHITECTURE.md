# Clean Architecture — Mi Chat App

Este documento demuestra, con código real del repositorio, cómo **Mi Chat App** (Expo SDK 57 + Expo Router + Supabase) implementa **Clean Architecture** organizada por *features* y cómo cumple la **Regla de Dependencia**.

---

## 1. Resumen Arquitectónico y Regla de Dependencia

El código se divide en *features* (`auth`, `chat`) más un módulo transversal (`shared`). Cada feature se separa en cuatro capas:

| Capa | Responsabilidad | Puede importar de |
|---|---|---|
| `domain` | Entidades, contratos de repositorio y errores. Núcleo puro. | Solo de otros archivos de `domain` |
| `application` | Casos de uso: reglas de negocio y validaciones. | `domain` |
| `infrastructure` | Implementaciones concretas (Supabase). | `domain`, `shared/infrastructure` |
| `presentation` + `app/` | Hooks, stores y pantallas (React, TanStack Query, Zustand). | `application`, `domain`, `infrastructure` como raíz de composición |

**Regla de Dependencia:** las dependencias de código fuente apuntan **solo hacia adentro**. `domain` no conoce a nadie; `infrastructure` depende de `domain` (implementa sus interfaces) y no al revés. Así Supabase puede sustituirse sin tocar entidades ni casos de uso.

```text
   ┌───────────────────────────┐
   │  app/  (Expo Router)      │   Pantallas y layouts
   └─────────────┬─────────────┘
                 │ usa hooks
                 ▼
   ┌───────────────────────────┐
   │  presentation             │   useAuth, useChat, useRooms, authStore
   └─────────────┬─────────────┘
                 │ ejecuta casos de uso
                 ▼
   ┌───────────────────────────┐
   │  application              │   LoginUseCase, SendMessageUseCase, ...
   └─────────────┬─────────────┘
                 │ depende de abstracciones
                 ▼
   ┌───────────────────────────┐
   │  domain                   │   User, Message, Room, IChatRepository, AppError
   └─────────────▲─────────────┘
                 │ implementa interfaces
   ┌─────────────┴─────────────┐
   │  infrastructure           │   SupabaseAuthRepository, SupabaseChatRepository
   └───────────────────────────┘
```

**Verificación automática.** Buscando imports de `react` o `supabase` dentro de `domain` y `application`:

```bash
grep -rn "react\|supabase" --include=*.ts src/features/*/domain src/features/*/application src/shared/domain | grep import
# Resultado: sin coincidencias
```

Los únicos imports de esas capas son rutas internas de `domain` (entidades, interfaces y `AppError`).

---

## 2. Mapa de Rutas por Capa (Feature-Based)

### Capa de Dominio (`domain`)
- [src/features/auth/domain/entities/User.ts](src/features/auth/domain/entities/User.ts)
- [src/features/auth/domain/repositories/IAuthRepository.ts](src/features/auth/domain/repositories/IAuthRepository.ts)
- [src/features/chat/domain/entities/Room.ts](src/features/chat/domain/entities/Room.ts)
- [src/features/chat/domain/entities/Message.ts](src/features/chat/domain/entities/Message.ts)
- [src/features/chat/domain/repositories/IChatRepository.ts](src/features/chat/domain/repositories/IChatRepository.ts)
- [src/shared/domain/errors/AppError.ts](src/shared/domain/errors/AppError.ts)

### Capa de Aplicación (`application`)
- [src/features/auth/application/use-cases/LoginUseCase.ts](src/features/auth/application/use-cases/LoginUseCase.ts)
- [src/features/auth/application/use-cases/RegisterUseCase.ts](src/features/auth/application/use-cases/RegisterUseCase.ts)
- [src/features/chat/application/use-cases/CreateRoomUseCase.ts](src/features/chat/application/use-cases/CreateRoomUseCase.ts)
- [src/features/chat/application/use-cases/GetMessagesUseCase.ts](src/features/chat/application/use-cases/GetMessagesUseCase.ts)
- [src/features/chat/application/use-cases/SendMessageUseCase.ts](src/features/chat/application/use-cases/SendMessageUseCase.ts)
- [src/features/chat/application/use-cases/SubscribeToRoomUseCase.ts](src/features/chat/application/use-cases/SubscribeToRoomUseCase.ts)

### Capa de Infraestructura (`infrastructure`)
- [src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts](src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts)
- [src/features/chat/infrastructure/repositories/SupabaseChatRepository.ts](src/features/chat/infrastructure/repositories/SupabaseChatRepository.ts)
- [src/shared/infrastructure/supabase/client.ts](src/shared/infrastructure/supabase/client.ts)

### Capa de Presentación y Enrutamiento (`presentation` y `app/`)
- [src/features/auth/presentation/hooks/useAuth.ts](src/features/auth/presentation/hooks/useAuth.ts)
- [src/features/auth/presentation/store/authStore.ts](src/features/auth/presentation/store/authStore.ts)
- [src/features/chat/presentation/hooks/useRooms.ts](src/features/chat/presentation/hooks/useRooms.ts)
- [src/features/chat/presentation/hooks/useChat.ts](src/features/chat/presentation/hooks/useChat.ts)
- [app/_layout.tsx](app/_layout.tsx), [app/(auth)/login.tsx](app/(auth)/login.tsx), [app/(app)/index.tsx](app/(app)/index.tsx), [app/(app)/chat/[roomId].tsx](app/(app)/chat/[roomId].tsx)

> El módulo `shared` también contiene `src/shared/theme/` y `src/shared/components/` (diseño visual). Son piezas de UI reutilizables, no participan en las reglas de negocio.

---

## 3. Evidencia en Código por Capa

### 3.1 Dominio — contratos puros (base de la Inversión de Dependencias)

**`src/features/auth/domain/entities/User.ts`**
```typescript
// Representa usuario de dominio, independiente del proveedor.
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}
```

**`src/features/auth/domain/repositories/IAuthRepository.ts`**
```typescript
import { User } from "../entities/User";

// Define contrato de autenticación sin dependencias externas.
export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  // Devuelve null si falta confirmar el correo.
  register(email: string, password: string, username: string): Promise<User | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
```

**`src/features/chat/domain/repositories/IChatRepository.ts`**
```typescript
// Define contrato puro del repositorio de chat.
export interface IChatRepository {
  getRooms(): Promise<Room[]>;
  createRoom(name: string, userId: string): Promise<Room>;
  getMessages(roomId: string): Promise<Message[]>;
  // Persiste mensaje y devuelve entidad de dominio.
  sendMessage(roomId: string, userId: string, content: string): Promise<Message>;
  // Retorna función de limpieza compatible con useEffect.
  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void;
}
```

**`src/shared/domain/errors/AppError.ts`**
```typescript
// Clasifica errores de dominio con código estable.
export class AppError extends Error {
  constructor(public readonly code: string, message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AppError';
  }
}

export class ChatError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('CHAT_ERROR', message, cause);
  }
}
```

> El dominio define *qué* necesita la app (`IChatRepository`), nunca *cómo* se obtiene. Los tipos que salen del dominio son `User`, `Message` y `Room`, no tipos de Supabase.

### 3.2 Aplicación — reglas de negocio aisladas

**`src/features/chat/application/use-cases/SendMessageUseCase.ts`**
```typescript
import { ChatError } from "../../../../shared/domain/errors/AppError";
import { Message } from "../../domain/entities/Message";
import { IChatRepository } from "../../domain/repositories/IChatRepository";

export class SendMessageUseCase {
  // Inyecta abstracción del repositorio mediante inversión de dependencias.
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(roomId: string, userId: string, content: string): Promise<Message> {
    const trimmed = content.trim();
    // Valida regla de negocio antes de tocar infraestructura.
    if (!trimmed) throw new ChatError("El mensaje no puede estar vacío");
    if (trimmed.length > 500) throw new ChatError("Máximo 500 caracteres");
    // Delega persistencia al contrato, sin conocer Supabase.
    return this.chatRepo.sendMessage(roomId, userId, trimmed);
  }
}
```

**`src/features/auth/application/use-cases/RegisterUseCase.ts`**
```typescript
export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string, username: string): Promise<User | null> {
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();
    // Exige todos los campos antes de llamar al repositorio.
    if (!cleanEmail || !password || !cleanUsername)
      throw new AuthError("Todos los campos son requeridos");
    // Impone longitud mínima de contraseña como regla de negocio.
    if (password.length < 6)
      throw new AuthError("La contraseña debe tener al menos 6 caracteres");
    if (/\s/.test(cleanUsername))
      throw new AuthError("El username no puede contener espacios");
    try {
      return await this.authRepo.register(cleanEmail, password, cleanUsername);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al registrar usuario";
      // Traduce error técnico a mensaje comprensible para usuario.
      throw new AuthError(
        /already registered/i.test(message) ? "Este correo ya está registrado" : message,
        error,
      );
    }
  }
}
```

**`src/features/auth/application/use-cases/LoginUseCase.ts`**
```typescript
// Traduce mensajes del proveedor a lenguaje de dominio.
function toFriendlyMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/invalid login credentials/i.test(message)) return "Credenciales inválidas";
  if (/email not confirmed/i.test(message))
    return "Debes confirmar tu correo antes de iniciar sesión";
  return message || "Error al iniciar sesión";
}
```

> Los casos de uso son clases TypeScript puras: no importan `react`, `react-native` ni `@supabase/supabase-js`. Se pueden probar con un repositorio falso que implemente `IChatRepository` o `IAuthRepository`.

### 3.3 Infraestructura — implementación concreta de los contratos

**`src/features/chat/infrastructure/repositories/SupabaseChatRepository.ts`**
```typescript
// Implementa contrato de dominio usando el cliente de Supabase.
export class SupabaseChatRepository implements IChatRepository {

  async sendMessage(roomId: string, userId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: userId, content })
      .select('id, room_id, user_id, content, created_at, profiles(username)')
      .single();
    if (error) throw error;
    return this.mapMessage(data);
  }

  // Convierte fila cruda de base de datos a entidad.
  private mapMessage = (raw: any): Message => ({
    id: raw.id, roomId: raw.room_id, userId: raw.user_id,
    content: raw.content, createdAt: new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
  });
}
```

**`src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts`**
```typescript
export class SupabaseAuthRepository implements IAuthRepository {
  async register(email: string, password: string, username: string): Promise<User | null> {
    // Envía username como metadata; el trigger crea el perfil.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
    if (!data.user) throw new Error("No se pudo crear el usuario");
    // Sin sesión: el usuario debe confirmar su correo.
    if (!data.session) return null;
    return { id: data.user.id, email: data.user.email ?? email, username };
  }
}
```

**`src/shared/infrastructure/supabase/client.ts`**
```typescript
// Centraliza cliente Supabase; único punto de acceso externo.
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: SecureStoreAdapter, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } },
);
```

> La flecha de dependencia va de `infrastructure` hacia `domain` (`implements IChatRepository`). Los nombres de columnas (`room_id`, `created_at`) se quedan en esta capa: `mapMessage` los traduce a la entidad `Message`.

### 3.4 Presentación — hooks como adaptadores de UI

**`src/features/chat/presentation/hooks/useChat.ts`**
```typescript
// Ensambla caso de uso con implementación concreta del repositorio.
const chatRepo = new SupabaseChatRepository();
const sendMessageUseCase = new SendMessageUseCase(chatRepo);

export function useChat(roomId: string) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Cachea historial por sala mediante TanStack Query.
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getMessagesUseCase.execute(roomId),
    enabled: !!user,
    staleTime: Infinity,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessageUseCase.execute(roomId, user!.id, content),
    // Inserta mensaje temporal antes de la respuesta del servidor.
    onMutate: async (content) => { /* optimistic update */ },
  });
  // ...
}
```

**`src/features/auth/presentation/hooks/useAuth.ts`**
```typescript
export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  // Adapta caso de uso a mutación con estado de carga.
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUseCase.execute(email, password),
    onSuccess: (user) => {
      // Sincroniza usuario autenticado con el store global.
      setUser(user);
      router.replace("/(app)");
    },
  });
  // ...
}
```

**`src/features/auth/presentation/store/authStore.ts`**
```typescript
// Mantiene usuario y estado de inicialización en Zustand.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),
}));
```

**`app/(app)/chat/[roomId].tsx`**
```tsx
export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  // Consume hook; la pantalla desconoce casos de uso y Supabase.
  const { messages, sendMessage, isLoading } = useChat(roomId);
  // ...
}
```

> Las pantallas de `app/` solo ven lo que devuelve el hook (`messages`, `sendMessage`, `isLoading`). TanStack Query (caché, carga, errores) y Zustand (sesión global) quedan encapsulados en `presentation`.

---

## 4. Trazabilidad de un Flujo Completo: enviar un mensaje

| # | Capa | Archivo | Qué ocurre |
|---|---|---|---|
| 1 | `app/` | [app/(app)/chat/[roomId].tsx:91](app/(app)/chat/[roomId].tsx#L91) | El usuario toca el botón de enviar (`AnimatedButton`) y se ejecuta `handleSend`. |
| 2 | `app/` | [app/(app)/chat/[roomId].tsx:32-35](app/(app)/chat/[roomId].tsx#L32-L35) | `handleSend` descarta texto vacío, llama a `sendMessage(input.trim())` y limpia el input. |
| 3 | `presentation` | [useChat.ts:48](src/features/chat/presentation/hooks/useChat.ts#L48) | `onMutate` agrega un mensaje temporal `temp-<timestamp>` a la caché `["messages", roomId]` (*optimistic update*). |
| 4 | `presentation` | [useChat.ts:44-45](src/features/chat/presentation/hooks/useChat.ts#L44-L45) | `mutationFn` ejecuta `sendMessageUseCase.execute(roomId, user.id, content)`. |
| 5 | `application` | [SendMessageUseCase.ts:13-14](src/features/chat/application/use-cases/SendMessageUseCase.ts#L13-L14) | Valida reglas: mensaje no vacío y máximo 500 caracteres. Si falla, lanza `ChatError`. |
| 6 | `application` → `domain` | [SendMessageUseCase.ts:15](src/features/chat/application/use-cases/SendMessageUseCase.ts#L15) | Llama a `chatRepo.sendMessage(...)` a través de la **interfaz**. |
| 7 | `domain` | [IChatRepository.ts:7](src/features/chat/domain/repositories/IChatRepository.ts#L7) | Contrato `sendMessage(roomId, userId, content): Promise<Message>`. El caso de uso solo conoce esta firma. |
| 8 | `infrastructure` | [SupabaseChatRepository.ts:33-36](src/features/chat/infrastructure/repositories/SupabaseChatRepository.ts#L33-L36) | Implementación real: `insert` en la tabla `messages` de Supabase, con `profiles(username)` en el `select`. |
| 9 | `infrastructure` | [SupabaseChatRepository.ts:40](src/features/chat/infrastructure/repositories/SupabaseChatRepository.ts#L40) | `mapMessage` convierte la fila (`room_id`, `created_at`) en la entidad `Message`. |
| 10 | `presentation` | [useChat.ts:64](src/features/chat/presentation/hooks/useChat.ts#L64) | `onSuccess` quita el mensaje temporal y agrega el real solo si Realtime no lo había agregado ya. |
| 11 | `presentation` | [useChat.ts:75](src/features/chat/presentation/hooks/useChat.ts#L75) | Si algo falló (validación o red), `onError` elimina el mensaje temporal. |
| 12 | `infrastructure` → `presentation` | [SupabaseChatRepository.ts:43-46](src/features/chat/infrastructure/repositories/SupabaseChatRepository.ts#L43-L46) | En los demás dispositivos, `subscribeToRoom` recibe el `INSERT` por `postgres_changes` y el callback de `useChat` lo añade a su caché. |

```text
[roomId].tsx ──sendMessage()──▶ useChat ──execute()──▶ SendMessageUseCase
                                                          │ valida reglas
                                                          ▼
                                                  IChatRepository  (domain)
                                                          ▲ implements
                                                          │
                                              SupabaseChatRepository ──▶ Supabase (messages)
```

---

## 5. Observaciones de la auditoría

La Regla de Dependencia se cumple por completo en `domain` y `application`. En las capas externas hay tres puntos donde el diseño se aparta del modelo ideal. No rompen la regla, porque las capas externas pueden depender de las internas, pero conviene conocerlos:

1. **La raíz de composición está dentro de los hooks.** `useAuth.ts`, `useChat.ts` y `useRooms.ts` crean `new Supabase…Repository()` directamente, así que `presentation` conoce la clase concreta de `infrastructure`. *Mejora posible:* un módulo `src/shared/di/container.ts` que construya los repositorios y casos de uso, para que los hooks solo importen casos de uso.
2. **Llamadas que saltan la capa de aplicación.** `useRooms.ts` usa `chatRepo.getRooms()` (no existe `GetRoomsUseCase`) y `useAuth.ts` usa `authRepo.logout()` (no existe `LogoutUseCase`). Funcionan, pero rompen la uniformidad `presentation → application`.
3. **`app/_layout.tsx` usa Supabase directamente.** Se suscribe a `supabase.auth.onAuthStateChange` e instancia `SupabaseAuthRepository`. *Mejora posible:* añadir `onAuthStateChange(callback)` a `IAuthRepository` y exponerlo con un caso de uso o hook.
