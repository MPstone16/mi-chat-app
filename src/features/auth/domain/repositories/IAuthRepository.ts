import { User } from "../entities/User";

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  /**
   * Devuelve el usuario si quedó con sesión activa, o `null` si Supabase
   * requiere confirmar el correo antes de iniciar sesión.
   */
  register(email: string, password: string, username: string): Promise<User | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
