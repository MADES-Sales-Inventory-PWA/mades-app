import { Request, Response } from "express";
import { ProductsService } from "./products.service";
import { sendError } from "../../core/utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { createProductResponseDTO, getProductByIdResponseDTO, listProductsQueryDTO, listProductsResponseDTO, setStateProductResponseDTO, updateProductResponseDTO } from "./dtos";
import { NotFoundError } from "../../shared/errors/not-found-error-codes";
import { ConflictError } from "../../shared/errors/conflict-error-codes";
import { listProductsQueryRequestSchema } from "./schemas";

const productsService = new ProductsService();

export class ProductsController {

    async createProduct(req: Request, res: Response) {
        try {
            const data = await productsService.createProduct(req.body);

            const response: createProductResponseDTO = {
                success: true,
                message: "Producto creado correctamente",
                data,
            };

            return res.status(201).json(response);

        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, 404, ApiErrorCode.NOT_FOUND, error.message);
            }
            if (error instanceof ConflictError) {
                return sendError(res, 409, ApiErrorCode.CONFLICT, error.message);
            }
            return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, "Error al crear el producto");
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const data = await productsService.updateProduct(id, req.body);

            const response: updateProductResponseDTO = {
                success: true,
                message: "Producto actualizado correctamente",
                data,
            };

            return res.status(200).json(response);

        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, 404, ApiErrorCode.NOT_FOUND, error.message);
            }
            if (error instanceof ConflictError) {
                return sendError(res, 409, ApiErrorCode.CONFLICT, error.message);
            }
            return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, "Error al actualizar el producto");
        }
    }

    async listProducts(req: Request, res: Response) {
        try {

            const data = await productsService.listProducts(req.validatedQuery as listProductsQueryDTO);

            const response: listProductsResponseDTO = {
                success: true,
                message: "Productos obtenidos correctamente",
                data,
            };

            return res.status(200).json(response);

        } catch (error) {
            return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, "Error al obtener los productos");
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const data = await productsService.getProductById(id);

            const response: getProductByIdResponseDTO = {
                success: true,
                message: "Producto obtenido correctamente",
                data,
            };

            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, 404, ApiErrorCode.NOT_FOUND, error.message);
            }
            return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, "Error al obtener el producto");
        }
    }

    async setProductState(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await productsService.setProductState(id, req.body);

            const response: setStateProductResponseDTO = {
                success: true,
                message: `Producto ${req.body.state ? "activado" : "desactivado"} correctamente`,
            };

            return res.status(200).json(response);

        } catch (error) {
            if (error instanceof NotFoundError) {
                return sendError(res, 404, ApiErrorCode.NOT_FOUND, error.message);
            }
            return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, "Error al cambiar el estado del producto");
        }
    }

}