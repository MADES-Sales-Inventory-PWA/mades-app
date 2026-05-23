export class UserMapper {
    static toResponse(user: any) {
        if (!user.Persons) return null;
        return {
            id: Number(user.Persons.id),
            name: user.Persons.name,
            lastName: user.Persons.lastName,
            email: user.Persons.email,
            documentType: user.Persons.documentType,
            documentNumber: user.Persons.documentNumber,
            phoneNumber: user.Persons.phoneNumber,
            state: user.Persons.state,
            user: {
                id: Number(user.id),
                roleId: user.Roles ? Number(user.Roles.id) : Number(user.rolId)
            },
        };
    }
}