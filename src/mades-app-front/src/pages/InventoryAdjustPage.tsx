import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Box,
  Check,
  ClipboardMinus,
  House,
  PackagePlus,
  PencilLine,
  RotateCcw,
  ShoppingCart,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Icon } from "../components/Icon";
import { OnlineIndicator } from "../components/OnlineIndicator";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

type AdjustmentType = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  enabled: boolean;
};

const adjustmentTypes: AdjustmentType[] = [
  {
    id: "perdida",
    label: "Pérdida",
    icon: <ClipboardMinus size={16} />,
  },
  {
    id: "dano",
    label: "Daño",
    icon: <AlertTriangle size={16} />,
  },
  {
    id: "robo",
    label: "Robo",
    icon: <ShieldAlert size={16} />,
  },
  {
    id: "reembolso",
    label: "Reembolso",
    icon: <RotateCcw size={16} />,
  },
  {
    id: "restock",
    label: "Restock",
    icon: <PackagePlus size={16} />,
  },
  {
    id: "correccion-manual",
    label: "Corrección manual",
    icon: <PencilLine size={16} />,
  },
];

export default function InventoryAdjustPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();

  const [selectedType, setSelectedType] = useState<string>("dano");
  const [units, setUnits] = useState(1);
  const [comments, setComments] = useState("");

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: "Inicio",
        icon: <House size={18} />,
        path: "/inicio-admin",
        enabled: true,
      },
      {
        label: "Inventario",
        icon: <Box size={18} />,
        path: "/ajusteInventario",
        enabled: true,
      },
      {
        label: "Carrito",
        icon: <ShoppingCart size={18} />,
        path: "/carrito",
        enabled: false,
      },
      {
        label: "Reportes",
        icon: <BarChart3 size={18} />,
        path: "/reportes",
        enabled: false,
      },
      {
        label: "Empleados",
        icon: <Users size={18} />,
        path: "/empleados",
        enabled: false,
      },
    ],
    []
  );

  const stockActual = 15;
  const nuevoStock = Math.max(0, stockActual - units);

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="hidden min-h-screen w-[250px] flex-col border-r border-slate-200/70 bg-gradient-to-b from-side-panel to-side-panel2 p-4 lg:flex">
          <div className="mb-6 flex items-center gap-3">
            <Icon size={42} />
            <div>
              <p className="text-xl font-bold text-primary-blue">MADES</p>
              <p className="text-sm text-slate-500">Gestión de Retail</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    if (item.enabled) {
                      navigate(item.path);
                    }
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left font-medium transition ${
                    isActive
                      ? "bg-white text-primary-blue shadow-sm"
                      : item.enabled
                        ? "text-slate-600 hover:bg-white/80"
                        : "cursor-not-allowed text-slate-400"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-h-screen w-full flex-col pb-24 lg:pb-8">
          <header className="flex items-center justify-between border-b border-slate-200/70 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <Icon size={42} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Ajuste de Inventario</h1>
            </div>
            <OnlineIndicator isOnline={isOnline} />
          </header>

          <section className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-6">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
              <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs font-bold uppercase tracking-wide text-primary-blue">
                  Producto seleccionado
                </p>
                <div className="mb-4 flex gap-4">
                  <div className="h-[96px] w-[96px] rounded-xl border border-slate-200 bg-slate-50" />
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900">Auriculares Pro X2</h2>
                    <p className="mt-1 text-lg text-slate-500">SKU: 7401234567</p>
                    <p className="mt-2 text-2xl font-semibold text-primary-blue">Stock actual: 15</p>
                  </div>
                </div>
              </article>

              <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-200/80 px-5 py-4">
                  <h3 className="text-2xl font-bold text-slate-900">Detalles del ajuste</h3>
                </div>

                <div className="space-y-6 p-5">
                  <div>
                    <p className="mb-3 text-base font-semibold text-slate-800">Tipo de ajuste</p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {adjustmentTypes.map((type) => {
                        const checked = selectedType === type.id;

                        return (
                          <label
                            key={type.id}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 transition ${
                              checked
                                ? "border-primary-blue bg-blue-50 text-primary-blue"
                                : "border-input-border bg-[#F3F4FE] text-slate-700"
                            }`}
                          >
                            <span className="inline-flex items-center gap-2 font-medium">
                              {type.icon}
                              {type.label}
                            </span>

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setSelectedType(type.id)}
                              className="h-4 w-4 rounded border-slate-300 accent-primary-blue"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-base font-semibold text-slate-800">Unidades</p>
                    <div className="flex h-14 items-center rounded-xl border border-input-border bg-[#F3F4FE] px-2">
                      <button
                        type="button"
                        onClick={() => setUnits((current) => Math.max(1, current - 1))}
                        className="h-10 w-10 rounded-lg text-3xl text-primary-blue transition hover:bg-blue-50"
                        aria-label="Restar unidad"
                      >
                        -
                      </button>

                      <span className="flex-1 text-center text-3xl font-semibold text-slate-800">{units}</span>

                      <button
                        type="button"
                        onClick={() => setUnits((current) => current + 1)}
                        className="h-10 w-10 rounded-lg text-3xl text-primary-blue transition hover:bg-blue-50"
                        aria-label="Sumar unidad"
                      >
                        +
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      El nuevo stock será: <span className="font-semibold text-slate-700">{nuevoStock}</span>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="comments" className="mb-2 block text-base font-semibold text-slate-800">
                      Comentarios
                    </label>
                    <textarea
                      id="comments"
                      value={comments}
                      onChange={(event) => setComments(event.target.value)}
                      placeholder="Describa el motivo del ajuste o detalles adicionales..."
                      className="min-h-[160px] w-full resize-none rounded-xl border border-input-border bg-[#F3F4FE] p-4 text-lg text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-primary-blue"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-[#F7F8FF] px-5 py-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="h-12 rounded-xl border border-slate-300 px-6 text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-blue px-6 text-lg font-semibold text-white transition hover:bg-primary-blue-hover"
                  >
                    <Check size={18} />
                    Confirmar Ajuste
                  </button>
                </div>
              </article>
            </div>
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
                    ? "bg-blue-50 text-primary-blue"
                    : item.enabled
                      ? "text-slate-500 hover:bg-slate-100"
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