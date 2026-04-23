import TokenService from "../../core/services/token.service";
import { AuthRepository } from "./auth.repository";


export class AuthService{
    constructor(
        private readonly authRepository = new AuthRepository()
    ){}
     async login(userName: string, password: string) {
        const user = await this.authRepository.login(userName, password);

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