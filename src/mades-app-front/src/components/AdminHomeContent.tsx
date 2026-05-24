import { useEffect, useState } from "react";
import {
  XCircle,
  TriangleAlert,
  DollarSign,
  ClipboardList,
  Box,
  BarChart3,
} from "lucide-react";
import { ActionCard } from "./ActionCard";
import { useNavigate } from "react-router";
import { constants } from "../constants/Constants";
import { fetchProducts } from "../services/products";
import { getAuthHeaders } from "../utils/auth";

type DailySales = { count: number; totalSales: number };

async function fetchTodaySales(): Promise<DailySales> {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${constants.BACKEND_BASE_URL}/api/reports/sales-per-day?date=${today}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) return { count: 0, totalSales: 0 };
  const data = await res.json();
  return { count: data.count ?? 0, totalSales: data.totalSales ?? 0 };
}

async function fetchTodayAdjustmentsCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(
    `${constants.BACKEND_BASE_URL}/api/reports/inventory-adjustments?from=${today}&to=${today}&page=1&pageSize=1`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.meta?.total ?? 0;
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

type KpiCardProps = {
  label: string;
  value: string | null;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
};

function KpiCard({ label, value, sub, icon, iconBg, valueColor = "text-gray-800" }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className={`flex w-fit items-center rounded-xl border p-2 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${valueColor}`}>
          {value === null ? "—" : value}
        </p>
        <p className="mt-1 text-xs text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

export const AdminHomeContent = () => {
  const navigate = useNavigate();
  const [lowStock, setLowStock] = useState<number | null>(null);
  const [outOfStock, setOutOfStock] = useState<number | null>(null);
  const [dailySales, setDailySales] = useState<DailySales | null>(null);
  const [adjustmentsCount, setAdjustmentsCount] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((products) => {
        setLowStock(products.filter((p) => p.quantity > 0 && p.quantity <= p.minQuantity).length);
        setOutOfStock(products.filter((p) => p.quantity === 0).length);
      })
      .catch(() => { setLowStock(0); setOutOfStock(0); });

    fetchTodaySales()
      .then(setDailySales)
      .catch(() => setDailySales({ count: 0, totalSales: 0 }));

    fetchTodayAdjustmentsCount()
      .then(setAdjustmentsCount)
      .catch(() => setAdjustmentsCount(0));
  }, []);

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 px-4 py-3 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Resumen General</h2>
          <p className="mt-1 text-gray-500">Vista rápida de las operaciones de hoy.</p>
        </div>
        <span className="text-sm text-gray-500 capitalize">{today}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Ventas hoy"
          value={dailySales === null ? null : String(dailySales.count)}
          sub={dailySales === null ? "Cargando..." : formatCOP(dailySales.totalSales)}
          icon={<DollarSign size={20} className="text-primary-blue" />}
          iconBg="border-primary-blue/30 bg-primary-blue/10"
        />
        <KpiCard
          label="Ajustes hoy"
          value={adjustmentsCount === null ? null : String(adjustmentsCount)}
          sub="Modificaciones manuales"
          icon={<ClipboardList size={20} className="text-violet-500" />}
          iconBg="border-violet-200 bg-violet-50"
        />
        <KpiCard
          label="Stock bajo"
          value={lowStock === null ? null : String(lowStock)}
          sub="En nivel crítico"
          icon={<TriangleAlert size={20} className="text-orange-500" />}
          iconBg="border-orange-200 bg-orange-50"
          valueColor={lowStock !== null && lowStock > 0 ? "text-orange-600" : "text-gray-800"}
        />
        <KpiCard
          label="Agotados"
          value={outOfStock === null ? null : String(outOfStock)}
          sub="Sin existencia"
          icon={<XCircle size={20} className="text-red-500" />}
          iconBg="border-red-200 bg-red-50"
          valueColor={outOfStock !== null && outOfStock > 0 ? "text-red-600" : "text-gray-800"}
        />
      </div>

      <h3 className="mt-5 text-base font-semibold text-gray-700">Accesos rápidos</h3>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionCard
          title="Ver inventario"
          text="Consultar existencias y gestionar productos"
          icon={<Box />}
          onClick={() => navigate(constants.INVENTORY_PATH)}
        />
        <ActionCard
          title="Ver reportes"
          text="Ventas por empleado y movimientos de inventario"
          icon={<BarChart3 />}
          onClick={() => navigate(constants.REPORTS_PATH)}
        />
      </div>
    </div>
  );
};
