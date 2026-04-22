import { ActionCard } from "./ActionCard";
import { Receipt, Search } from "lucide-react";
import { SummaryCard } from "./SummaryCard";

export const EmployeeHomeContent = () => {
    return (
        <div className="flex-1 py-2 p-5">
            <h2 className="text-xl font-semibold text-gray-800">Acciones rápidas</h2>

            <div className="flex flex-row gap-4">
                <ActionCard
                    className="mx-auto w-full" title="Nueva venta"
                    text="Crear una nueva venta para un cliente"
                    icon={<Receipt />}
                    onClick={() => { }} />
                <ActionCard
                    className="mx-auto w-full"
                    title="Consultar inventario"
                    text="Consultar el inventario disponible"
                    icon={<Search />}
                    onClick={() => { }} />
            </div>
            <div className="mt-4 bg-white p-5 rounded-xl shadow-md">
                <h1 className="text-lg font-semibold text-gray-800 w-full text-center">Rendimiento personal</h1>
                <div className="flex flex-row">
                    <SummaryCard className="mx-auto" title="Ganacias totales" number={"$150.000"}
                        text={<h3 className="text-xs font-bold text-green-500 mt-1">Ganancias totales del día</h3>} />
                    <div className="h-30 border-l border-black-400 mr-7"></div>
                    <SummaryCard className="mx-auto" title="Ventas completadas" number={"24"}
                        text={<h3 className="text-xs font-bold text-gray-500 mt-1">Ventas completadas hoy</h3>} />
                </div>
            </div>
        </div>
    );
};
