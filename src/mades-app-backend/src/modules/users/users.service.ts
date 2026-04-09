import { UserRepository } from "./users.repository";
import { CreateUserDTO } from "./users.schema";


export class UserService {
    private userRepository = new UserRepository();
    async validateUniqueFields(documentType: any, documentNumber: string, email: string, currentPersonId?: bigint) {
        const personByEmail = await this.userRepository.findPersonByEmail(email);
        if (personByEmail && personByEmail.id !== currentPersonId) {
            throw new Error("El correo electrónico ya se encuentra registrado");
        }
        const personByDocument = await this.userRepository.findPersonByDocumentAndDocumentNumber(documentType, documentNumber);
        if (personByDocument && personByDocument.id !== currentPersonId) {
            throw new Error("Ya existe una persona con ese tipo y numero de documento");
        }
    }
    async createUser(data: CreateUserDTO) {
        await this.validateUniqueFields(data.documentType, data.documentNumber, data.email)
        return this.userRepository.create(data);
    }
    
}