import prisma from "../../config/prisma";
import { productDTO } from "./dtos/products.dto";
import { createProductRequestDTO, listProductsQueryDTO, updateProductRequestDTO } from "./dtos";
import { productsMapper } from "./products.mapper";
import { Prisma, productDetails, Products, SizeTypes, SizeValues } from "@prisma/client";

type PrismaTransactionClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export class ProductsRepository {

    public async findSizeTypeById(id: number): Promise<SizeTypes | null> {
        return await prisma.sizeTypes.findUnique({
            where: { id: BigInt(id) },
        });
    }

    public async findSizeValueByIdAndTypeId(sizeValueId: number, sizeTypeId: number): Promise<SizeValues | null> {
        return await prisma.sizeValues.findFirst({
            where: {
                id: BigInt(sizeValueId),
                sizeTypeId: BigInt(sizeTypeId),
            },
        });
    }

    public async findProductByBarcode(barcode: string): Promise<productDTO | null> {
        const product = await prisma.products.findUnique({
            where: { barcode },
            include: { productDetails: true },
        })

        if (!product) return null

        return productsMapper.toProductDTO({
            ...product,
            productDetails: product.productDetails[0] ?? null,
        })
    }

    public async findProductByNameSizeTypeAndValue(name: string, sizeTypeId: number, sizeValueId: number): Promise<productDTO | null> {
        const product = await prisma.products.findFirst({
            where: {
                name: name,
                sizeTypeId: BigInt(sizeTypeId),
                sizeValueId: BigInt(sizeValueId),
            },
            include: { productDetails: true },
        });

        if (!product) return null;

        return productsMapper.toProductDTO({
            ...product,
            productDetails: product.productDetails[0] ?? null,
        });
    }

    public async findProductById(id: number): Promise<productDTO | null> {
        const product = await prisma.products.findUnique({
            where: { id: BigInt(id) },
            include: { productDetails: true },
        });

        if (!product) return null;

        return productsMapper.toProductDTO({
            ...product,
            productDetails: product.productDetails[0] ?? null,
        });
    }

    public async createProduct(dto: createProductRequestDTO): Promise<productDTO> {
        const created = await prisma.$transaction(async (tx) => {
            return tx.products.create({
                data: productsMapper.toProductCreateInput(dto),
                include: { productDetails: true },
            });
        });

        return productsMapper.toProductDTO({
            ...created,
            productDetails: created.productDetails[0] ?? null,
        });
    }

    public async updateProduct(id: number, dto: updateProductRequestDTO): Promise<productDTO> {
        const updated = await prisma.$transaction(async (tx) => {
            const product = await this.updateProductFields(tx, id, dto);

            if (dto.purchasePrice !== undefined || dto.minQuantity !== undefined) {
                await this.updateProductDetails(tx, id, dto);
                return tx.products.findUnique({
                    where: { id: BigInt(id) },
                    include: { productDetails: true },
                });
            }

            return product;
        });

        return productsMapper.toProductDTO({
            ...updated!,
            productDetails: updated!.productDetails[0] ?? null,
        });
    }

    private async updateProductFields(tx: PrismaTransactionClient, id: number, dto: updateProductRequestDTO) {
        return tx.products.update({
            where: { id: BigInt(id) },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.barcode !== undefined && { barcode: dto.barcode }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
                ...(dto.sizeTypeId !== undefined && { sizeTypeId: BigInt(dto.sizeTypeId) }),
                ...(dto.sizeValueId !== undefined && { sizeValueId: BigInt(dto.sizeValueId) }),
                lastUpdate: new Date(),
            },
            include: { productDetails: true },
        });
    }

    private async updateProductDetails(tx: PrismaTransactionClient, id: number, dto: updateProductRequestDTO) {
        return tx.productDetails.updateMany({
            where: { productId: BigInt(id) },
            data: {
                ...(dto.purchasePrice !== undefined && { purchasePrice: dto.purchasePrice }),
                ...(dto.minQuantity !== undefined && { minQuantity: BigInt(dto.minQuantity) }),
            },
        });
    }

    public async findProducts(dto: listProductsQueryDTO): Promise<productDTO[]> {
        const products = await prisma.products.findMany({
            where: this.buildProductsFilter(dto),
            include: { productDetails: true },
            orderBy: { id: "asc" },
        });

        const mapped = this.mapProducts(products);

        return this.applyLowStockFilter(mapped, dto.lowStock);
    }

    private buildProductsFilter(dto: listProductsQueryDTO): Prisma.ProductsWhereInput {
        return {
            ...(dto.search !== undefined && { name: { contains: dto.search, mode: "insensitive" } }),
            ...(dto.state !== undefined && { state: dto.state }),
        };
    }

    private mapProducts(products: (Products & { productDetails: productDetails[] })[]): productDTO[] {
        return products.map(product =>
            productsMapper.toProductDTO({
                ...product,
                productDetails: product.productDetails[0] ?? null,
            })
        );
    }

    private applyLowStockFilter(products: productDTO[], lowStock?: boolean): productDTO[] {
        if (lowStock === true) {
            return products.filter(p => p.quantity <= p.minQuantity);
        }
        return products;
    }

    public async setProductState(id: number, state: boolean): Promise<void> {
        await prisma.products.update({
            where: { id: BigInt(id) },
            data: { state, lastUpdate: new Date() },
        });
    }
}