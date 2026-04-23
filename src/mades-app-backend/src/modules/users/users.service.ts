import { UserRepository } from "./users.repository";
import { CreateUserDTO } from "./users.schema";


export class UserService {
    constructor(
        private readonly userRepository = new UserRepository()
    ) { }
    async validateUniqueFields(documentType: any, documentNumber: string, email: string, currentPersonId?: bigint) {
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
}