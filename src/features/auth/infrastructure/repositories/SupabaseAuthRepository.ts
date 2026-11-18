import { supabase } from "@shared/infrastructure/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("No se pudo iniciar sesión");
    return this.toDomainUser(data.user);
  }

  async register(
    email: string,
    password: string,
    username: string,
  ): Promise<User | null> {
    // El perfil lo crea el trigger `on_auth_user_created` en la base de datos,
    // leyendo `username` desde raw_user_meta_data. Así no depende de tener
    // sesión activa (con "Confirm email" activado, signUp no devuelve sesión).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
    if (!data.user) throw new Error("No se pudo crear el usuario");

    // Sin sesión → el usuario debe confirmar su correo antes de entrar.
    if (!data.session) return null;

    return {
      id: data.user.id,
      email: data.user.email ?? email,
      username,
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return this.toDomainUser(user);
  }

  private async toDomainUser(user: SupabaseUser): Promise<User> {
    // maybeSingle: no lanza error si el perfil todavía no existe
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email ?? "",
      username: profile?.username ?? user.user_metadata?.username ?? "",
      avatarUrl: profile?.avatar_url ?? undefined,
    };
  }
}
