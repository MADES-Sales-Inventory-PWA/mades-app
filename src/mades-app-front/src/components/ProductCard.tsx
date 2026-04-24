import { Edit2, X } from "lucide-react";
import { formatCOP } from "../utils/currency";

type ProductCardProps = {
  id: string;
  nombre: string;
  descripcion: string;
  codigoBarras: string;
  talla: string;
  precio: number;
  cantidadDisponible: number;
  cantidadAlerta: number;
  imagen?: string;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onAddToCart: (id: string) => void;
  onDeactivate: (id: string) => void;
};

const getStockStatusStyles = (cantidadDisponible: number, cantidadAlerta: number) => {
  if (cantidadDisponible === 0) return "bg-red-50 border-red-200";
  if (cantidadDisponible <= cantidadAlerta) return "bg-yellow-50 border-yellow-200";
  return "bg-green-50 border-green-200";
};

export function ProductCard({
  id,
  nombre,
  descripcion,
  codigoBarras,
  talla,
  precio,
  cantidadDisponible,
  cantidadAlerta,
  imagen,
  onOpen,
  onEdit,
  onAddToCart,
  onDeactivate,
}: ProductCardProps) {
  return (
    <article
      onClick={() => onOpen(id)}
      className={`flex flex-col rounded-2xl border p-3 shadow-sm transition hover:shadow-md sm:p-4 ${getStockStatusStyles(cantidadDisponible, cantidadAlerta)}`}
    >
      <div className="mb-3 h-28 w-full overflow-hidden rounded-xl bg-slate-200 sm:h-36 lg:h-48">
        <img src={imagen} alt={nombre} className="h-full w-full object-cover" />
      </div>

      <h3 className="text-sm font-bold text-slate-900">{nombre}</h3>
      <p className="text-xs text-slate-500">Talla: {talla}</p>
      <p className="mb-2 text-xs text-slate-600">SKU: {codigoBarras}</p>
      <p className="mb-3 text-xs text-slate-600">{descripcion}</p>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-600">Disponibles</p>
          <p className="text-lg font-bold text-slate-900">{cantidadDisponible}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600">Precio</p>
          <p className="text-lg font-bold text-primary-blue">{formatCOP(precio)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart(id);
          }}
          className="flex-1 rounded-lg bg-primary-blue py-2 text-sm font-semibold text-white transition hover:bg-primary-blue-hover"
        >
          Agregar a carrito
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(id);
          }}
          className="rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100"
          aria-label="Editar"
        >
          <Edit2 size={16} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDeactivate(id);
          }}
          className="rounded-lg border border-red-300 p-2 text-red-700 transition hover:bg-red-50"
          aria-label="Desactivar"
        >
          <X size={16} />
        </button>
      </div>
    </article>
  );
}