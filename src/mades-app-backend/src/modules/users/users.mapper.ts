export class UserMapper {
    static toResponse(user: any) {
        return {
            id: Number(user.id), 
            correo: user.userName,
            rol: {
                id: user.rolId,
                nombre: user.Roles?.rolName || "Sin Rol" 
            },
            perfil: user.Persons ? {
                nombre: user.Persons.name,
                apellido: user.Persons.lastName,
                numeroTelefonico: user.Persons.phoneNumber,
                tipoDocumento: user.Persons.documentType,
                numeroDocumento: user.Persons.documentNumber,
                estado: user.Persons.state
            } : null,
        };
    }
}