import type { Persons } from "@prisma/client";

export class PersonMapper{
    static toResponse(person:Persons){
        return{
            idPersona:person.id,
            nombre:person.name,
            apellido:person.lastName,
            correo:person.email,
            numeroTelefonico:person.phoneNumber,
            tipoDocumento:person.documentType,
            numeroDocumento:person.documentNumber,
            estado:person.state,
            idUsuario:person.userId
        }
    }
}