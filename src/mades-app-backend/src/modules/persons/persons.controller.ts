import { Request, Response } from "express";
import { z } from "zod"
import { personSchema } from "./persons.schema";
import { PersonMapper } from "./persons.mapper";
import { RegisterPersonUseCase } from "../../use-cases/UserPersonRegister";


export class PersonController {
        private registerPersonUseCase = new RegisterPersonUseCase();
    async createPerson(req: Request, res: Response) {
        try {
            const personData = personSchema.parse(req.body);
            const fullData = {
            ...personData,
            userName: personData.email,
            password: req.body.password,
            rolId: req.body.rolId,
            firstAdminSecretCode: req.body.firstAdminSecretCode
        };
            const newPerson = await this.registerPersonUseCase.execute(fullData);
            const response = PersonMapper.toResponse(newPerson)
            res.status(201).json({
                success: true,
                data: response
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: error.issues[0]?.message ?? "Error de validación"
                });
            }
            return res.status(400).json({
                success: false,
                message: error.message || "Error al crear la persona"
            });
        }
    }

}