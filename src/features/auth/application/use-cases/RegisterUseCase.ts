import { AuthError } from "@shared/domain/errors/AppError";
import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  /** Devuelve `null` si el usuario debe confirmar su correo. */
  async execute(email: string, password: string, username: string): Promise<User | null> {
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();
    if (!cleanEmail || !password || !cleanUsername)
      throw new AuthError("Todos los campos son requeridos");
    if (password.length < 6)
      throw new AuthError("La contraseña debe tener al menos 6 caracteres");
    if (/\s/.test(cleanUsername))
      throw new AuthError("El username no puede contener espacios");
    try {
      return await this.authRepo.register(cleanEmail, password, cleanUsername);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al registrar usuario";
      throw new AuthError(
        /already registered/i.test(message) ? "Este correo ya está registrado" : message,
        error,
      );
    }
  }
}
