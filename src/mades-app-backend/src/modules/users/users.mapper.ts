import { Users } from "@prisma/client";

export class UserMapper{
     static toResponse(user:Users){
            return{
                id:user.id,
                nombreUsuario:user.userName,
                rol:user.rolId
            }
        }
}