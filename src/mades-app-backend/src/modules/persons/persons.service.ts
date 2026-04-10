import { PersonsRepository } from "./persons.repository";
import { CreatePersonDTO } from "./persons.schema";

const personsRepository = new PersonsRepository();

export class PersonService {
    async validateUniqueFields(documentType: any, documentNumber: string, email: string, currentPersonId?: bigint) {
        const personByEmail = await personsRepository.findPersonByEmail(email);
        if (personByEmail && personByEmail.id !== currentPersonId) {
            throw new Error("El correo electrónico ya se encuentra registrado");
        }
        const personByDocument = await personsRepository.findPersonByDocumentAndDocumentNumber(documentType, documentNumber);
        if (personByDocument && personByDocument.id !== currentPersonId) {
            throw new Error("Ya existe una persona con ese tipo y numero de documento");
        }
    }
    async createPerson(data: CreatePersonDTO) {
        await this.validateUniqueFields(data.documentType, data.documentNumber, data.email)
        if (data.userId) {
            const personByUserId = await personsRepository.findPersonByUserId(data.userId);
            if (personByUserId) {
                throw new Error("El usuario ya tiene asociada una persona");
            }
        }
        return await personsRepository.create(data);
    }
}