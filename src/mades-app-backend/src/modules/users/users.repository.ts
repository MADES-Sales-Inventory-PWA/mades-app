import { document_type } from "@prisma/client";
import prisma from "../../config/prisma";
import { CreateUserDTO, UpdateUserDTO } from "./users.schema";

export class UserRepository {
    async adminExists() {
        const totalAdmins = await prisma.users.count({
            where: {
                rolId: BigInt(1)
            }
        });

        return totalAdmins > 0;
    }
    async findByEmail(email: string) {
        const cleanEmail = email.trim().toLowerCase();
        return await prisma.persons.findFirst({
            where: {
                email: cleanEmail,
            }
        });
    }
    async findByDocumentAndDocumentNumber(documentType: string, documentNumber: string) {
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
    async update(id: number, data: UpdateUserDTO) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.users.update({
                where: { id: BigInt(id) },
                data: {
                    ...(data.password && { password: data.password }),
                    ...(data.rolId && { rolId: data.rolId }),
                }
            });
            const { email, password, rolId, ...personData } = data;
            const person = await tx.persons.update({
                where: { userId: BigInt(id) },
                data: {
                    ...personData,
                    documentType: personData.documentType as document_type,
                }
            });
            return { ...user, person };
        });
    }
    async findUserById(id: number) {
        return await prisma.users.findUnique({
            where: {
                id: BigInt(id)
            },
            include: {
                Persons: true
            }
        });
    }
}