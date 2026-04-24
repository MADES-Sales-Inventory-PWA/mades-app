import { NotFoundError } from "../../shared/errors/not-found-error-codes";
import { ConflictError } from "../../shared/errors/conflict-error-codes";
import { createProductRequestDTO, listProductsQueryDTO, setStateProductRequestDTO, updateProductRequestDTO } from "./dtos";
import { productDTO } from "./dtos/products.dto";
import { ProductsRepository } from "./products.repository";

const productsRepository = new ProductsRepository();

export class ProductsService {

    public async createProduct(dto: createProductRequestDTO): Promise<productDTO> {
        await this.validateSizeTypeAndValue(dto.sizeTypeId, dto.sizeValueId);
        await this.validateProductSizeUniqueness(dto.name, dto.sizeTypeId, dto.sizeValueId);
        await this.validateBarcodeUniqueness(dto.barcode);
        return await productsRepository.createProduct(dto);
    }

    public async updateProduct(id: number, dto: updateProductRequestDTO): Promise<productDTO> {
        const product = await this.getProductById(id);
        await this.validateProductUpdate(id, product, dto);
        return await productsRepository.updateProduct(id, dto);
    }

    private async validateProductUpdate(id: number, product: productDTO, dto: updateProductRequestDTO): Promise<void> {
        const sizeTypeId = dto.sizeTypeId ?? product.sizeTypeId;
        const sizeValueId = dto.sizeValueId ?? product.sizeValueId;
        const name = dto.name ?? product.name;
        const barcode = dto.barcode ?? product.barcode;

        await this.validateSizeChanges(sizeTypeId, sizeValueId, dto);
        await this.validateUniquenessChanges(id, name, sizeTypeId, sizeValueId, dto);
    }

    private async validateBarcodeUniqueness(barcode: string, excludeId?: number): Promise<void> {
        const existing = await productsRepository.findProductByBarcode(barcode);
        if (existing && existing.id !== excludeId) {
            throw new ConflictError(`Ya existe un producto con el código de barras ${barcode}`)
        }
    }

    private async validateSizeChanges(sizeTypeId: number, sizeValueId: number, dto: updateProductRequestDTO): Promise<void> {
        const sizesChanged = dto.sizeTypeId !== undefined || dto.sizeValueId !== undefined;
        if (sizesChanged) await this.validateSizeTypeAndValue(sizeTypeId, sizeValueId);
    }

    private async validateUniquenessChanges(id: number, name: string, sizeTypeId: number, sizeValueId: number, dto: updateProductRequestDTO): Promise<void> {
        const uniquenessChanged = dto.name !== undefined || dto.sizeTypeId !== undefined || dto.sizeValueId !== undefined;
        if (uniquenessChanged) {
            await this.validateProductSizeUniqueness(name, sizeTypeId, sizeValueId, id)
        }

        if (dto.barcode !== undefined) {
            await this.validateBarcodeUniqueness(dto.barcode, id)
        }
    }

    public async listProducts(dto: listProductsQueryDTO): Promise<productDTO[]> {
        return await productsRepository.findProducts(dto);
    }

    public async getProductById(id: number): Promise<productDTO> {
        const product = await productsRepository.findProductById(id);

        if (!product) {
            throw new NotFoundError(`El producto con ID ${id} no existe`);
        }

        return product;
    }

    private async validateSizeTypeAndValue(sizeTypeId: number, sizeValueId: number): Promise<void> {
        const sizeType = await productsRepository.findSizeTypeById(sizeTypeId);

        if (!sizeType) {
            throw new NotFoundError(`El tipo de talla con ID ${sizeTypeId} no existe`);
        }

        const sizeValue = await productsRepository.findSizeValueByIdAndTypeId(sizeValueId, sizeTypeId);

        if (!sizeValue) {
            throw new NotFoundError(
                `El valor de talla con ID ${sizeValueId} no existe o no pertenece al tipo de talla ${sizeTypeId}`
            );
        }
    }

    private async validateProductSizeUniqueness(name: string, sizeTypeId: number, sizeValueId: number, excludeId?: number): Promise<void> {
        const existing = await productsRepository.findProductByNameSizeTypeAndValue(name, sizeTypeId, sizeValueId);

        if (existing && existing.id !== excludeId) {
            throw new ConflictError(
                `Ya existe un producto con el nombre ${name} y esa combinación de talla`
            );
        }
    }

    public async setProductState(id: number, dto: setStateProductRequestDTO): Promise<void> {
        await this.getProductById(id);
        await productsRepository.setProductState(id, dto.state);
    }

}