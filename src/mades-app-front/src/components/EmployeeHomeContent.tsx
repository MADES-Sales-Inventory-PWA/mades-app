import { ActionCard } from "./ActionCard";
import { Receipt, Search } from "lucide-react";
import { SummaryCard } from "./SummaryCard";

export const EmployeeHomeContent = () => {
    return (
        <div className="flex-1 px-4 py-4 sm:px-6 lg:px-5">
            <h2 className="text-xl font-semibold text-gray-800">Acciones rápidas</h2>

            <div className="mt-4 flex flex-col gap-4 md:flex-row">
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
            <div className="mt-4 rounded-xl bg-white p-5 shadow-md">
                <h1 className="text-lg font-semibold text-gray-800 w-full text-center">Rendimiento personal</h1>
                <div className="flex flex-col md:flex-row">
                    <SummaryCard className="mx-auto" title="Ganacias totales" number={"$150.000"}
                        text={<h3 className="text-xs font-bold text-green-500 mt-1">Ganancias totales del día</h3>} />
                    <div className="hidden h-30 border-l border-black-400 md:mr-7 md:block"></div>
                    <SummaryCard className="mx-auto" title="Ventas completadas" number={"24"}
                        text={<h3 className="text-xs font-bold text-gray-500 mt-1">Ventas completadas hoy</h3>} />
                </div>
            </div>
        </div>
    );
};
