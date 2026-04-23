import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Box, House, Plus, ShoppingCart, Trash2, Users } from "lucide-react";
import { SideBar } from "../../components/SideBar";
import { Header } from "../../components/Header";
import { constants } from "../../constants/Constants";
import type { ProductSize, SizeType } from "../../data/products";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  enabled: boolean;
};

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/inventario");
  };

  const [form, setForm] = useState({
    sku: "",
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    tipoTalla: "letras" as SizeType,
  });
  const [sizes, setSizes] = useState<ProductSize[]>([
    { talla: "", cantidadExistente: 0, unidadesAlerta: 0 },
  ]);

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden lg:block">
          <SideBar roleid={constants.ADMIN_ROLE_ID} />
        </aside>

        <main className="flex min-h-screen w-full flex-col pb-24 lg:pb-8">
          <Header title="Crear Producto" showMobileIcon={true} enableLogoMenu={true} />

          <section className="mx-auto flex w-full max-w-[1000px] flex-col gap-4 p-4 lg:p-6">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
            <form
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
              onSubmit={(event) => {
                event.preventDefault();
                alert("Producto creado (mock).");
                navigate(`/productos/${form.sku || "7401234567890"}`);
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">SKU / Código de barras</span>
                  <input
                    required
                    value={form.sku}
                    onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                    className="w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Nombre</span>
                  <input
                    required
                    value={form.nombre}
                    onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                    className="w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Descripción</span>
                  <textarea
                    required
                    value={form.descripcion}
                    onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Precio</span>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.precio}
                    onChange={(event) => setForm((prev) => ({ ...prev, precio: event.target.value }))}
                    className="w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Imagen (URL)</span>
                  <input
                    required
                    value={form.imagen}
                    onChange={(event) => setForm((prev) => ({ ...prev, imagen: event.target.value }))}
                    className="w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Tipo de talla</span>
                  <select
                    value={form.tipoTalla}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, tipoTalla: event.target.value as SizeType }))
                    }
                    className="w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                  >
                    <option value="letras">Letras (XS, S, M, L, XL)</option>
                    <option value="numerica">Numérica (28, 30, 32, ...)</option>
                  </select>
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Tallas registradas</h2>
                  <button
                    type="button"
                    onClick={() =>
                      setSizes((prev) => [
                        ...prev,
                        { talla: "", cantidadExistente: 0, unidadesAlerta: 0 },
                      ])
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
                  >
                    <Plus size={16} />
                    Agregar talla
                  </button>
                </div>

                <div className="space-y-2">
                  {sizes.map((size, index) => (
                    <div key={`${index}-${size.talla}`} className="grid gap-2 sm:grid-cols-4">
                      <input
                        placeholder={form.tipoTalla === "letras" ? "Ej: M" : "Ej: 32"}
                        value={size.talla}
                        onChange={(event) =>
                          setSizes((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, talla: event.target.value } : item
                            )
                          )
                        }
                        className="rounded-lg border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Existentes"
                        value={size.cantidadExistente}
                        onChange={(event) =>
                          setSizes((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, cantidadExistente: Number(event.target.value) }
                                : item
                            )
                          )
                        }
                        className="rounded-lg border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Alerta"
                        value={size.unidadesAlerta}
                        onChange={(event) =>
                          setSizes((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, unidadesAlerta: Number(event.target.value) } : item
                            )
                          )
                        }
                        className="rounded-lg border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                      />
                      <button
                        type="button"
                        onClick={() => setSizes((prev) => prev.filter((_, i) => i !== index))}
                        disabled={sizes.length === 1}
                        className="inline-flex items-center justify-center rounded-lg border border-red-300 text-red-700 transition enabled:hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/inventario")}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-blue px-4 py-2 font-semibold text-white"
                >
                  Guardar producto
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>

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
