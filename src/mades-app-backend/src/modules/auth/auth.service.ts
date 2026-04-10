import TokenService from "../../core/services/token.service";
import { LoginDTO } from "./auth.schema";
import { AuthRepository } from "./auth.repository";

export class AuthService {
  private authRepository = new AuthRepository();

  async login(credentials: LoginDTO) {
    const user = await this.authRepository.findUserByEmail(credentials.email);

    if (!user || user.password !== credentials.password) {
      throw new Error("Credenciales inválidas");
    }

    const person = user.Persons[0];

    if (!person) {
      throw new Error("No se encontraron datos de persona para el usuario");
    }

    const token = TokenService.generateToken({
      name: person.name,
      lastName: person.lastName,
      email: person.email,
      phoneNumber: person.phoneNumber,
      documentType: person.documentType,
      documentNumber: person.documentNumber
    });

    return {
      token,
      user: {
        id: user.id,
        name: person.name,
        lastName: person.lastName,
        email: person.email
      }
    };
  }
}
