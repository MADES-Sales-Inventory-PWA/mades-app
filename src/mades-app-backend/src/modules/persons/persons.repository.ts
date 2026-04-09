
import { document_type } from "@prisma/client";
import { CreatePersonDTO } from "./persons.schema";
import prisma from "../../config/prisma";

export class PersonsRepository {
    async create(data: CreatePersonDTO, tx?: any) {
        const client = tx || prisma;
        return await client.persons.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                documentType: data.documentType as document_type,
                documentNumber: data.documentNumber,
                state: data.state ?? true,
                userId: data.userId
            }
        });
    }
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
    async findPersonByUserId(userId: number) {
        return await prisma.persons.findFirst({
            where: {
                userId: BigInt(userId)
            }
        });
    }
}