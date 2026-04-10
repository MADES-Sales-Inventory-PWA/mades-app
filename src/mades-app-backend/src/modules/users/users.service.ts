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
}