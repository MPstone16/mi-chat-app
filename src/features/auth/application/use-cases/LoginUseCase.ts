import { AuthError } from "@shared/domain/errors/AppError";
import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password)
      throw new AuthError("Email y contraseña son requeridos");
    try {
      return await this.authRepo.login(cleanEmail, password);
    } catch (error) {
      throw new AuthError(toFriendlyMessage(error), error);
    }
  }
}

function toFriendlyMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/invalid login credentials/i.test(message)) return "Credenciales inválidas";
  if (/email not confirmed/i.test(message))
    return "Debes confirmar tu correo antes de iniciar sesión";
  return message || "Error al iniciar sesión";
}
