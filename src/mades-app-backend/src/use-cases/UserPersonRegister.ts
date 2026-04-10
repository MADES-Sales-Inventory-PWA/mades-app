import prisma from "./../config/prisma";
import { UserService } from "./../modules/users/users.service"
import { PersonService } from "./../modules/persons/persons.service"

export class RegisterPersonUseCase {
    private userService = new UserService();
    private personService = new PersonService();

    async execute(data: any) {
        const adminExists = await this.userService.adminExists();

        if (Number(data.rolId) === 1 && !adminExists) {
            const expectedSecretCode = process.env.FIRST_ADMIN_SECRET_CODE;

            if (!expectedSecretCode) {
                throw new Error("El código de validación del primer administrador no está configurado");
            }

            if (!data.firstAdminSecretCode || data.firstAdminSecretCode !== expectedSecretCode) {
                throw new Error("Código de validación inválido para crear el primer administrador");
            }
        }

        await this.personService.validateUniqueFields(data.documentType, data.documentNumber, data.email, undefined);

        const createdUser = await prisma.users.create({
            data: {
                userName: data.email,
                password: data.password,
                rolId: data.rolId,
                Persons: {
                    create: {
                        name: data.name,
                        lastName: data.lastName,
                        email: data.email,
                        phoneNumber: data.phoneNumber,
                        documentType: data.documentType,
                        documentNumber: data.documentNumber,
                        state: data.state ?? true
                    }
                }
            },
            include: {
                Persons: true
            }
        });

        return createdUser.Persons[0];
    }
}