import { SizeTypes, SizeValues } from "@prisma/client";
import { SizeTypeDTO, SizeValueDTO } from "./dtos";

export const sizeMapper = {

    toSizeTypeDTO(sizeType: SizeTypes): SizeTypeDTO {
        return {
            id:   Number(sizeType.id),
            name: sizeType.name,
        };
    },

    toSizeValueDTO(sizeValue: SizeValues): SizeValueDTO {
        return {
            id:         Number(sizeValue.id),
            value:      sizeValue.value,
        };
    },

};