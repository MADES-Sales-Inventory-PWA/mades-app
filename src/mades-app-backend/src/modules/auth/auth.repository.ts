import prisma from "../../config/prisma";

export class AuthRepository {
  async findUserByEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();

    return await prisma.users.findFirst({
      where: {
        userName: cleanEmail
      },
      include: {
        Persons: true
      }
    });
  }
}
