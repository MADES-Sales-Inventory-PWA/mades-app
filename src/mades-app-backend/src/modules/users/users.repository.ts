import prisma from "../../config/prisma";
import { CreateUserDTO } from "./users.schema";

export class UserRepository{
    async create(data: CreateUserDTO, tx?: any) {
        const client = tx || prisma;
        return await client.users.create({
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
}