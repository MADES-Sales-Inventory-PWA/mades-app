import { Prisma, Products, productDetails } from "@prisma/client";
import { productDTO } from "./dtos/products.dto";
import { createProductRequestDTO } from "./dtos";

type ProductWithDetails = Products & {
    productDetails: productDetails | null;
};

export const productsMapper = {

    toProductDTO: (product: ProductWithDetails): productDTO => {
        return {
            id:            Number(product.id),
            name:          product.name,
            state:         product.state,
            sizeTypeId:    Number(product.sizeTypeId),
            sizeValueId:   Number(product.sizeValueId),
            barcode:       product.barcode      ?? null,
            description:   product.description  ?? null,
            imageUrl:      product.imageUrl     ?? null,
            purchasePrice: Number(product.productDetails?.purchasePrice ?? 0),
            quantity:      Number(product.productDetails?.quantity      ?? 0),
            minQuantity:   Number(product.productDetails?.minQuantity   ?? 0),
        };
    },

    toProductCreateInput(dto: createProductRequestDTO): Prisma.ProductsCreateInput {
        const now = new Date();
        return {
            name:         dto.name,
            sellingPrice: dto.purchasePrice,
            barcode:      dto.barcode     ?? null,
            description:  dto.description ?? null,
            imageUrl:     dto.imageUrl    ?? null,
            lastUpdate:   now,
            lastSyncDate: now,
            SizeTypes:    { connect: { id: BigInt(dto.sizeTypeId)  } },
            SizeValues:   { connect: { id: BigInt(dto.sizeValueId) } },
            productDetails: {
                create: {
                    purchasePrice: dto.purchasePrice,
                    quantity:      BigInt(dto.quantity),
                    minQuantity:   BigInt(dto.minQuantity),
                },
            },
        };
    },
};