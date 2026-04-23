import prisma from "../../config/prisma";
import { SizeTypeDTO, SizeValueDTO } from "./dtos";
import { sizeMapper} from "./sizes.mapper";

export class SizeRepository {

    async findSizeTypes(): Promise<SizeTypeDTO[]> {
        const data = await prisma.sizeTypes.findMany({
            orderBy: { name: "asc" },
        });
        return data.map(sizeMapper.toSizeTypeDTO);
    }

    async findSizeTypeById(id: number): Promise<SizeTypeDTO | null> {
        const data = await prisma.sizeTypes.findUnique({
            where: { id: BigInt(id) },
        });

        if (!data) return null;

        return sizeMapper.toSizeTypeDTO(data);
    }

    async findSizeValuesByTypeId(sizeTypeId: number): Promise<SizeValueDTO[]> {
        const data = await prisma.sizeValues.findMany({
            where: { sizeTypeId: BigInt(sizeTypeId) },
            orderBy: { sortOrder: "asc" },
        });

        return data.map(sizeMapper.toSizeValueDTO);
    }

}