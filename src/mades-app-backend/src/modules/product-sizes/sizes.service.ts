import { NotFoundError } from "../../shared/errors/not-found-error-codes";
import { SizeTypeDTO, SizeValueDTO } from "./dtos";
import { SizeRepository } from "./sizes.repository";

const sizeRepository = new SizeRepository();

export class SizeService {

    async listSizeTypes(): Promise<SizeTypeDTO[]> {
        return await sizeRepository.findSizeTypes();
    }

    async listSizeValuesByTypeId(sizeTypeId: number): Promise<SizeValueDTO[]> {
        const sizeType = await sizeRepository.findSizeTypeById(sizeTypeId);

        if (!sizeType) {
            throw new NotFoundError(`El tipo de talla con ID ${sizeTypeId} no existe`);
        }

        return await sizeRepository.findSizeValuesByTypeId(sizeTypeId);
    }

}