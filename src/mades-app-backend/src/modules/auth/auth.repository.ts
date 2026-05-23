import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";

export class AuthRepository {
    async login(userName: string, password: string) {
        const cleanUserName = userName.trim().toLowerCase();
        const cleanPassword = password.trim();

        const user = await prisma.users.findFirst({
            where: { userName: cleanUserName },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(cleanPassword, user.password);
        return valid ? user : null;
    }
}