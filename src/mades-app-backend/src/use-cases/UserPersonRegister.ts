import prisma from "./../config/prisma";
import { UserService } from "./../modules/users/users.service"
import { PersonService } from "./../modules/persons/persons.service"

export class RegisterPersonUseCase {
    private userService = new UserService();
    private personService = new PersonService();

    async execute(data: any) {
        await this.personService.validateUniqueFields(data.documentType, data.documentNumber, data.email, undefined);
        return await prisma.$transaction(async (tx) => {
            const newUser = await this.userService.createUser({
                userName: data.email,
                password: data.password,
                rolId: data.rolId
            }, tx);

            const newPerson = await this.personService.createPerson({
                ...data,
                userId: newUser.id
            }, tx);

            return newPerson;
        });
    }
}