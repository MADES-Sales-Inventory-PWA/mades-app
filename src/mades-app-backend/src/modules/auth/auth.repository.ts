import prisma from "../../config/prisma";

export class AuthRepository {
    async login(userName: string, password: string) {
        const cleanUserName = userName.trim().toLowerCase();
        const cleanPassword = password.trim();

        return await prisma.users.findFirst({
            where: {
                userName: cleanUserName,
                password: cleanPassword,
            },
        });
    }
}