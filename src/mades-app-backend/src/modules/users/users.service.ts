import { UserRepository } from "./users.repository";
import { CreateUserDTO } from "./users.schema";

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

        return {
            id: Number(user.id),
            userName: user.userName,
            roleId: Number(user.rolId),
        };
    }
}