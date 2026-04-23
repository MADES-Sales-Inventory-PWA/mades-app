import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BarChart3, Box, House, ShoppingCart, Trash2, Users, Pencil, ClipboardList } from "lucide-react";
import { SideBar } from "../../components/SideBar";
import { Header } from "../../components/Header";
import { constants } from "../../constants/Constants";
import { getProductBySku } from "../../data/products";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  enabled: boolean;
};

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sku = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const product = getProductBySku(sku);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: "Inicio", icon: <House size={18} />, path: "/inicio-admin", enabled: true },
      { label: "Inventario", icon: <Box size={18} />, path: "/inventario", enabled: true },
      { label: "Carrito", icon: <ShoppingCart size={18} />, path: "/carrito", enabled: false },
      { label: "Reportes", icon: <BarChart3 size={18} />, path: "/reportes", enabled: false },
      { label: "Empleados", icon: <Users size={18} />, path: "/empleados", enabled: false },
    ],
    []
  );

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-background to-background-2 p-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Producto no encontrado</h1>
          <p className="mt-2 text-slate-600">No existe información para el SKU solicitado.</p>
          <button
            type="button"
            onClick={() => navigate("/inventario")}
            className="mt-5 rounded-xl bg-primary-blue px-5 py-2 font-semibold text-white"
          >
            Volver a inventario
          </button>
        </div>
      </div>
    );
  }

  const defaultSize = product.tallasRegistradas[0]?.talla ?? "";
  const activeSizeLabel = searchParams.get("talla") ?? defaultSize;
  const activeSize =
    product.tallasRegistradas.find((size) => size.talla === activeSizeLabel) ??
    product.tallasRegistradas[0];

  const action = searchParams.get("accion");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(action === "eliminar");
  const [showCartModal, setShowCartModal] = useState(action === "carrito");
  const [cartUnits, setCartUnits] = useState("1");

  const totalUnits = product.tallasRegistradas.reduce((acc, size) => acc + size.cantidadExistente, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden lg:block">
          <SideBar roleid={constants.ADMIN_ROLE_ID} />
        </aside>

        <main className="flex min-h-screen w-full flex-col pb-24 lg:pb-8">
          <Header title="Detalle de Producto" showMobileIcon={true} enableLogoMenu={true} />

          <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-6">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-5 p-5 md:grid-cols-[320px_1fr]">
                <div className="overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    className="h-56 w-full object-cover sm:h-64"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-primary-blue">SKU: {product.sku}</p>
                  <h1 className="mt-1 text-3xl font-bold text-slate-900">{product.nombre}</h1>
                  <p className="mt-2 text-slate-600">{product.descripcion}</p>
                  <p className="mt-3 text-2xl font-bold text-primary-blue">
                    ${product.precio.toLocaleString()}
                  </p>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Tallas registradas</p>
                    <div className="flex flex-wrap gap-2">
                      {product.tallasRegistradas.map((size) => (
                        <button
                          key={size.talla}
                          type="button"
                          onClick={() => {
                            const nextParams = new URLSearchParams(searchParams);
                            nextParams.set("talla", size.talla);
                            setSearchParams(nextParams);
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                            activeSize?.talla === size.talla
                              ? "border-primary-blue bg-blue-50 text-primary-blue"
                              : "border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {size.talla}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Tipo de talla</p>
                      <p className="font-semibold text-slate-900">{product.tipoTalla}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Cantidad existente</p>
                      <p className="font-semibold text-slate-900">{activeSize?.cantidadExistente ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Unidades alerta</p>
                      <p className="font-semibold text-slate-900">{activeSize?.unidadesAlerta ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-200 px-5 py-4">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/productos/editar/${product.sku}?talla=${encodeURIComponent(activeSize?.talla ?? "")}`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Pencil size={16} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/ajuste-inventario?sku=${product.sku}&talla=${encodeURIComponent(activeSize?.talla ?? "")}`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <ClipboardList size={16} />
                  Ajuste de Inventario
                </button>
                <button
                  type="button"
                  onClick={() => setShowCartModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-blue px-4 py-2 font-semibold text-white transition hover:bg-primary-blue-hover"
                >
                  <ShoppingCart size={16} />
                  Agregar a carrito
                </button>
              </div>
            </article>
          </section>
        </main>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">Confirmar eliminación</h2>
            <p className="mt-2 text-slate-600">
              ¿Deseas eliminar el producto <span className="font-semibold">{product.nombre}</span>?
            </p>
            {totalUnits > 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Este producto aún tiene {totalUnits} unidad(es) existentes en inventario.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  alert(`Producto ${product.sku} eliminado (mock).`);
                  navigate("/inventario");
                }}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">Agregar al carrito</h2>
            <p className="mt-2 text-slate-600">
              Ingrese la cantidad para talla <span className="font-semibold">{activeSize?.talla}</span>.
            </p>
            <input
              type="number"
              min={1}
              max={activeSize?.cantidadExistente ?? 1}
              value={cartUnits}
              onChange={(event) => setCartUnits(event.target.value)}
              className="mt-4 w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCartModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCartModal(false);
                  alert(`Se agregaron ${cartUnits} unidad(es) al carrito (mock).`);
                }}
                className="rounded-lg bg-primary-blue px-4 py-2 font-semibold text-white"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white px-1 py-2 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="mx-auto grid max-w-[700px] grid-cols-5 gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={`mobile-${item.path}`}
                type="button"
                onClick={() => {
                  if (item.enabled) {
                    navigate(item.path);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-side-button shadow-sm text-primary-blue"
                    : item.enabled
                      ? "text-slate-500 hover:bg-white hover:text-primary-blue"
                      : "cursor-not-allowed text-slate-400"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
