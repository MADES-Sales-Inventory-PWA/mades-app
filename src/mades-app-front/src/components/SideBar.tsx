import { House, Box, ShoppingCart, BarChart, PersonStanding } from "lucide-react";
import { Icon } from "./Icon";
import { SideButton } from "./SideButton";
import { Button } from "./Button";
import { clearSession } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { constants } from "../constants/Constants";


export const SideBar = ({ roleid }: { roleid: number }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col w-full min-h-screen max-w-[250px] px-4 py-5 bg-gradient-to-tr from-side-panel to-side-panel2 shadow-md">
            <div className="flex flex-row items-start justify-start">
                <Icon className="mr-3" size={50} />
                <div className="my-auto flex justify-start flex-col">
                    <span className="text-lg font-bold text-left text-primary-blue">MADES</span>
                    <p className="greeting-sub text-surface-variant text-left mt-2">
                        {roleid === constants.ADMIN_ROLE_ID ? "Administrador" : "Empleado"}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <SideButton
                    onClick={() => {
                    }}
                    icon={<House size={18} />}
                    path={["/inicio-employee", "/inicio-admin"]}>
                    Inicio
                </SideButton>
            </div>

            <SideButton
                onClick={() => {
                }}
                icon={<Box size={18} />}
                path={["/inventario"]}>
                Inventario
            </SideButton>

            <SideButton
                onClick={() => {
                }}
                icon={<ShoppingCart size={18} />}
                path={["/carrito"]}>
                Ventas
            </SideButton>

            {roleid === constants.ADMIN_ROLE_ID && (
                <SideButton
                    onClick={() => {
                    }}
                    icon={<BarChart size={18} />}
                    path={["/reportes"]}>
                    Reportes
                </SideButton>
            )}

            {roleid === constants.ADMIN_ROLE_ID && (
                <SideButton
                    onClick={() => {
                    }}
                    icon={<PersonStanding size={18} />}
                    path={["/empleados"]}>
                    Empleados
                </SideButton>
            )}

            <Button
                className="mt-auto"
                onClick={() => {
                    clearSession();
                    navigate("/", { replace: true });
                }}>
                Cerrar sesión
            </Button>

        </div>
    );
}