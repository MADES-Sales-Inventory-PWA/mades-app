import { document_type } from "@prisma/client";
import prisma from "../../config/prisma";
import { CreateUserDTO } from "./users.schema";

export class UserRepository {
    async findPersonByEmail(email: string) {
        const cleanEmail = email.trim().toLowerCase();
        return await prisma.persons.findFirst({
            where: {
                email: cleanEmail,
            }
        });
    }
    async findPersonByDocumentAndDocumentNumber(documentType: string, documentNumber: string) {
        const cleanDocument = documentNumber.replace(/\s+/g, '');
        return await prisma.persons.findFirst({
            where: {
                documentType: documentType as document_type,
                documentNumber: cleanDocument
            }
        });
    }
    async create(data: CreateUserDTO,) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    userName: data.email,
                    password: data.password,
                    rolId: data.rolId
                }
            });
            const person = await tx.persons.create({
                data: {
                    name: data.name,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    documentType: data.documentType as document_type,
                    documentNumber: data.documentNumber,
                    state: data.state ?? true,
                    userId: user.id
                }
            });
            return { ...user, person };
        })
    }
}