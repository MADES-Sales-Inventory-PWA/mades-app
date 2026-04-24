import { z } from "zod";

export const productSchema = z.object({
    id: z.number("El ID debe ser un número")
        .int()
        .positive(),

    name: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede superar los 100 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()'"/]+$/, "El nombre contiene caracteres no permitidos"),
    
    sizeTypeId: z.number("El tipo de talla debe ser un número")
        .int()
        .positive("El tipo de talla debe ser un ID válido"),

    sizeValueId: z.number("El valor de talla debe ser un número")
        .int()
        .positive("El valor de talla debe ser un ID válido"),

    barcode: z.string()
        .min(8, "El código de barras debe tener al menos 8 dígitos")
        .max(14, "El código de barras no puede superar los 14 dígitos")
        .regex(/^[0-9]{8,14}$/, "El código de barras debe contener solo dígitos (EAN-8 a EAN-14)"),

    description: z.string()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(1000, "La descripción no puede superar los 1000 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()'"/!?%&]+$/, "La descripción contiene caracteres no permitidos")
        .nullable(),

    imageUrl: z.string()
        .min(10, "La URL de la imagen es demasiado corta")
        .max(500, "La URL de la imagen no puede superar los 500 caracteres")
        .regex(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/, "Debe ser una URL válida (http o https)")
        .nullable(),

    purchasePrice: z.number("El precio de compra debe ser un número")
        .positive("El precio debe ser mayor a 0")
        .min(0.01, "El precio mínimo es 0.01")
        .max(9_999_999.99, "El precio no puede superar 9,999,999.99")
        .multipleOf(0.01, "El precio no puede tener más de 2 decimales"),
    
    quantity: z.number("La cantidad debe ser un número")
        .min(0, "El valor mínimo es 0")
        .max(100000, "La cantidad no puede superar 100,000"),

    minQuantity: z.number("La cantidad mínima debe ser un número")
        .int("La cantidad mínima debe ser un número entero")
        .nonnegative("La cantidad mínima no puede ser negativa")
        .min(1, "El valor mínimo es 1")
        .max(100000, "La cantidad mínima no puede superar 100,000"),

    state: z.boolean("El estado debe ser un valor booleano")

});
