import prisma from "../../config/prisma";
import { CreateUserDTO } from "./users.schema";

export class UserRepository{
    async create(data: CreateUserDTO) {
        if (!data.userName) {
            throw new Error("El nombre de usuario es obligatorio");
        }

        return await prisma.users.create({
            data: {
                userName:data.userName,
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

    async adminExists() {
        const totalAdmins = await prisma.users.count({
            where: {
                rolId: BigInt(1)
            }
        });

        return totalAdmins > 0;
    }
}