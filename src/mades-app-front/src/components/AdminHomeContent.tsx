import { XCircle, TriangleAlert, DollarSignIcon, Text } from "lucide-react";
import { SummaryCard } from "../components/SummaryCard";
import { BasicButton } from "../components/BasicButton";

export const AdminHomeContent = () => {
    return (
        <div className="flex-1 py-4 p-10">
            <h2 className="text-3xl font-semibold text-gray-800">Resumen General</h2>
            <p className="mt-2 text-gray-600">Vista rápida del inventario y operaciones de hoy.</p>

            <div className="flex flex-row items-center mt-7">
                <h3 className="text-xl font-semibold text-gray-700">Alertas de stock</h3>
                <BasicButton onClick={() => { }} className="ml-auto text-primary-blue hover:text-primary-blue-hover font-bold active:text-primary-blue-active">Ver todo el inventario</BasicButton>
            </div>
            <div className="flex flex-row h-30 p-3 bg-white rounded-xl shadow-md mt-3">
                <div className="w-100 flex flex-row items-center gap-3">
                    <div className="bg-orange-100 flex items-center p-2 border-orange-400 border-[1px] rounded-xl">
                        <TriangleAlert size={25} className="text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-600">Bajo</h1>
                        <h1 className="text-3xl font-semibold text-black-700">24</h1>
                        <h3 className="text-xs font-semibold text-gray-700">Productos con stock mínimo crítico.</h3>
                    </div>
                </div>

                <div className="h-full border-l border-gray-400 mr-7"></div>

                <div className="w-100 flex flex-row items-center gap-3">
                    <div className="bg-red-100 flex items-center p-2 border-red-400 border-[1px] rounded-xl">
                        <XCircle size={25} className="text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-600">Agotados</h1>
                        <h1 className="text-3xl font-semibold text-red-700">3</h1>
                        <h3 className="text-xs font-semibold text-gray-700">Productos sin existencia en almacén.</h3>
                    </div>
                </div>
            </div>
            <h3 className="text-xl font-semibold mt-7 text-gray-700">Resumen del día</h3>
            <SummaryCard
                title="Ventas hoy"
                number={"24"}
                text={<h3 className="text-xs font-semibold text-gray-700 bg-gray-200 rounded-xl p-1">$3,450.00 Total bruto</h3>}
                icon={<DollarSignIcon size={15} className="text-primary-blue" />}
                withBackground={true}
            />
            <SummaryCard
                title="Ajustes de inventario hoy"
                number={"24"}
                text={<h3 className="text-xs font-semibold text-gray-700 bg-gray-200 rounded-xl p-1">Modificaciones manuales registradas.</h3>}
                icon={<Text size={15} className="text-primary-blue" />}
                withBackground={true}
            />
        </div>
    );
}