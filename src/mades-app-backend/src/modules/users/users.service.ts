import { UserMapper } from "./users.mapper";
import { UserRepository } from "./users.repository";
import { CreateUserDTO, UpdateUserDTO, UserFiltersDTO } from "./users.schema";


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
        const newUser = await this.userRepository.create(data);
        return UserMapper.toResponse(newUser);;
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
        const updatedUser = await this.userRepository.update(userId, data);

        if (!updatedUser) {
            throw new Error("No se pudo actualizar el usuario");
        }
        return UserMapper.toResponse(updatedUser);
    }
    async getAll(filters: UserFiltersDTO) {
        const users = await this.userRepository.findAll(filters);
        if (!users) return [];
        return users
            .map(u => UserMapper.toResponse(u))
            .filter((user): user is NonNullable<typeof user> => user !== null);
    }
    async changeStatus(userId: number, newState: boolean) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const updatedUser = await this.userRepository.updateStatus(userId, newState);

    return UserMapper.toResponse(updatedUser);
}
}