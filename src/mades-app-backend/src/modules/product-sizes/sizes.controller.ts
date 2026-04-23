import { Request, Response } from "express";
import { SizeService } from "./sizes.service";
import { sendError } from "../../core/utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { listSizeTypesResponseDTO, listSizeValuesResponseDTO } from "./dtos";
import { sizeTypeIdRequestSchema } from "./schemas/sizes.request.schema";
import { NotFoundError } from "../../shared/errors/not-found-error-codes";

const sizeService = new SizeService();

export class SizeController {

    async listSizeTypes(req: Request, res: Response) {
        try {
            const data = await sizeService.listSizeTypes();

            const response: listSizeTypesResponseDTO = {
                success: true,
                message: "Tipos de talla obtenidos correctamente",
                data,                                          
            };

            return res.status(200).json(response);

        } catch (error) {
            return sendError(
                res,
                500,
                ApiErrorCode.INTERNAL_ERROR,
                "Error al obtener los tipos de talla"
            );
        }
    }

    async listSizeValuesByTypeId(req: Request, res: Response) {
        try {
            const parsed = sizeTypeIdRequestSchema.safeParse(req.params);

            if (!parsed.success) {
                return sendError(
                    res, 
                    400, 
                    ApiErrorCode.VALIDATION_ERROR, 
                    parsed.error.issues[0].message
                );
            }

            const data = await sizeService.listSizeValuesByTypeId(parsed.data.id);

            const response: listSizeValuesResponseDTO = {
                success: true,
                message: "Valores de talla obtenidos correctamente",
                data,
            };

            return res.status(200).json(response);

        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, 404, ApiErrorCode.NOT_FOUND, error.message);
            }
            return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, "Error al obtener los valores de talla");
        }
    }

}