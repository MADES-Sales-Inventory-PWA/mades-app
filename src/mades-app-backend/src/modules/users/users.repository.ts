import { document_type } from "@prisma/client";
import prisma from "../../config/prisma";
import { CreateUserDTO } from "./users.schema";

export class UserRepository{
    async create(data: CreateUserDTO) {
        return await prisma.users.create({
            data: {
                userName:data.userName ?? data.email,
                password:data.password,
                rolId:data.rolId
            }
        });
    }

    async findUserByUserName(name: string) {
        const cleanUserName = name.trim().toLowerCase();
        return await prisma.users.findFirst({
            where: {
                userName: cleanUserName,
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

    async adminExists() {
        const totalAdmins = await prisma.users.count({
            where: {
                rolId: BigInt(1)
            }
        });

        return totalAdmins > 0;
    }
}