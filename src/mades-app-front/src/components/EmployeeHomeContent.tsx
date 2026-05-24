import { useEffect, useState } from "react";
import { ActionCard } from "./ActionCard";
import { Receipt, Search, Wifi, WifiOff, Clock, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { constants } from "../constants/Constants";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { salesDb } from "../sw/db/sales.db";
import { productsDb } from "../sw/db/products.db";

export const EmployeeHomeContent = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [pendingSales, setPendingSales] = useState<number | null>(null);
  const [availableProducts, setAvailableProducts] = useState<number | null>(null);

  useEffect(() => {
    salesDb.countPending().then(setPendingSales).catch(() => setPendingSales(0));
    productsDb.findAll().then((p) => setAvailableProducts(p.filter((x) => x.quantity > 0 && x.state).length)).catch(() => setAvailableProducts(0));
  }, []);

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 px-4 py-4 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Panel de empleado</h2>
        <span className="text-sm text-gray-500 capitalize">{today}</span>
      </div>
      <p className="mt-1 text-gray-500">Selecciona una acción para comenzar.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ActionCard
          title="Nueva venta"
          text="Registrar una venta y actualizar el inventario"
          icon={<Receipt />}
          onClick={() => navigate(constants.SALES_PATH)}
        />
        <ActionCard
          title="Consultar inventario"
          text="Ver productos disponibles y existencias"
          icon={<Search />}
          onClick={() => navigate(constants.INVENTORY_PATH)}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-gray-700">Estado de tu sesión</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            {isOnline ? (
              <Wifi size={20} className="shrink-0 text-green-500" />
            ) : (
              <WifiOff size={20} className="shrink-0 text-red-400" />
            )}
            <div>
              <p className="text-xs text-gray-500">Conexión</p>
              <p className={`text-sm font-semibold ${isOnline ? "text-green-600" : "text-red-500"}`}>
                {isOnline ? "En línea" : "Sin conexión"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            <Clock size={20} className={`shrink-0 ${pendingSales && pendingSales > 0 ? "text-orange-400" : "text-gray-400"}`} />
            <div>
              <p className="text-xs text-gray-500">Ventas pendientes</p>
              <p className={`text-sm font-semibold ${pendingSales && pendingSales > 0 ? "text-orange-500" : "text-gray-700"}`}>
                {pendingSales === null ? "—" : pendingSales === 0 ? "Sin pendientes" : `${pendingSales} por sincronizar`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            <ShoppingBag size={20} className="shrink-0 text-primary-blue" />
            <div>
              <p className="text-xs text-gray-500">Productos disponibles</p>
              <p className="text-sm font-semibold text-gray-700">
                {availableProducts === null ? "—" : availableProducts === 0 ? "Sin stock" : `${availableProducts} con stock`}
              </p>
            </div>
          </div>
        </div>

        {!isOnline && (
          <p className="mt-3 text-xs text-gray-500">
            Las ventas realizadas sin conexión se sincronizarán automáticamente cuando vuelva la red.
          </p>
        )}
      </div>
    </div>
  );
};
