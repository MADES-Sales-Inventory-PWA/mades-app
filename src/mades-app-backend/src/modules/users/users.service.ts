import { UserRepository } from "./users.repository";
import { CreateUserDTO } from "./users.schema";
import TokenService from "../../core/services/token.service";

const userRepository = new UserRepository();

export class UserService {
    async createUser(data: CreateUserDTO) {
        return await userRepository.create(data);
    }

    async adminExists() {
        return await userRepository.adminExists();
    }

    async login(userName: string, password: string) {
        const user = await userRepository.login(userName, password);

        if (!user) {
            return null;
        }

        const normalizedUser = {
            id: Number(user.id),
            userName: user.userName,
            roleId: Number(user.rolId),
        };

        const token = TokenService.generateToken({
            userId: normalizedUser.id,
            userName: normalizedUser.userName,
            roleId: normalizedUser.roleId,
        });

        return {
            token,
            user: normalizedUser,
        };
    }
}