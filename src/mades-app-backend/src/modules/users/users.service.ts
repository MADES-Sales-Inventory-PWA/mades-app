import { UserRepository } from "./users.repository";
import { CreateUserDTO, UpdateUserDTO } from "./users.schema";


export class UserService {
    constructor(
        private readonly userRepository = new UserRepository()
    ) { }
    async validateUniqueFields(documentType: string, documentNumber: string, email: string, currentPersonId?: bigint) {
        const personByEmail = await this.userRepository.findByEmail(email);
        if (personByEmail && personByEmail.id !== currentPersonId) {
            throw new Error("El correo electrónico ya se encuentra registrado");
        }
        const personByDocument = await this.userRepository.findByDocumentAndDocumentNumber(documentType, documentNumber);
        if (personByDocument && personByDocument.id !== currentPersonId) {
            throw new Error("Ya existe una persona con ese tipo y numero de documento");
        }
    }
    async createUser(data: CreateUserDTO) {
        await this.validateUniqueFields(data.documentType, data.documentNumber, data.email)
        return this.userRepository.create(data);
    }

    async adminExists() {
        return await this.userRepository.adminExists();
    }
    async createFirstAdmin(data: any) {
        if (Number(data.rolId) === 1) {
            const hasAdmin = await this.adminExists();
            if (!hasAdmin) {
                const secret = process.env.FIRST_ADMIN_SECRET_CODE;
                if (!secret || data.firstAdminSecretCode !== secret) {
                    throw new Error("Código de validación inválido para crear el primer administrador");
                }
            }
            await this.validateUniqueFields(data.documentType, data.documentNumber, data.email)
            return await this.userRepository.create(data);
        }
    }
    async updateUser(userId: number, data: UpdateUserDTO) {
        const user = await this.userRepository.findUserById(userId);
        if (!user || !user.Persons) {
            throw new Error("Usuario no encontrado");
        }
        const currentPerson = user.Persons;

        await this.validateUniqueFields(
            data.documentType || currentPerson.documentType,
            data.documentNumber || currentPerson.documentNumber,
            currentPerson.email,
            currentPerson.id
        );
        return await this.userRepository.update(userId, data);
    }
}