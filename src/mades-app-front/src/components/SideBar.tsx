import { House, Box, ShoppingCart, BarChart, PersonStanding } from "lucide-react";
import { Icon } from "./Icon";
import { SideButton } from "./SideButton";
import { Button } from "./Button";
import { clearSession, getSession } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { constants } from "../constants/Constants";


export const SideBar = () => {
    const session = getSession();
    const roleId = Number(session?.user?.roleId);
    const navigate = useNavigate();

    return (
        <div className="flex flex-col w-full min-h-screen max-w-[250px] px-4 py-5 bg-gradient-to-tr from-side-panel to-side-panel2 shadow-md">
            <div className="flex flex-row items-start justify-start">
                <Icon className="mr-3" size={50} />
                <div className="my-auto flex justify-start flex-col">
                    <span className="text-lg font-bold text-left text-primary-blue">MADES</span>
                    <p className="greeting-sub text-surface-variant text-left mt-2">
                        {roleId === constants.ADMIN_ROLE_ID ? "Administrador" : "Empleado"}
                    </p>
                </div>
            </div>

            <div className="flex flex-col mt-4">
                {constants.HOME_ALLOWED_ROLES.includes(roleId) && (
                    <SideButton
                        onClick={() => {
                            const path = roleId === constants.ADMIN_ROLE_ID ? "/inicio-admin" : "/inicio-employee";
                            navigate(path, { replace: true });
                            return;
                        }}
                        icon={<House size={18} />}
                        path={[constants.ADMIN_HOME_PATH, constants.EMPLOYEE_HOME_PATH]}>
                        Inicio
                    </SideButton>
                )}

                {constants.INVENTORY_ALLOWED_ROLES.includes(roleId) && (
                    <SideButton
                        onClick={() => {
                            navigate(constants.INVENTORY_PATH, { replace: true });
                            return;
                        }}
                        icon={<Box size={18} />}
                        path={[constants.INVENTORY_PATH]}>
                        Inventario
                    </SideButton>
                )}

                {constants.SALES_ALLOWED_ROLES.includes(roleId) && (
                    <SideButton
                        onClick={() => {
                            navigate(constants.SALES_PATH, { replace: true });
                            return;
                        }}
                        icon={<ShoppingCart size={18} />}
                        path={[constants.SALES_PATH]}>
                        Ventas
                    </SideButton>
                )}

                {constants.REPORTS_ALLOWED_ROLES.includes(roleId) && (
                    <SideButton
                        onClick={() => {
                            navigate(constants.REPORTS_PATH, { replace: true });
                            return;
                        }}
                        icon={<BarChart size={18} />}
                        path={[constants.REPORTS_PATH]}>
                        Reportes
                    </SideButton>
                )}

                {constants.EMPLOYEES_ALLOWED_ROLES.includes(roleId) && (
                    <SideButton
                        onClick={() => {
                            navigate(constants.EMPLOYEES_PATH, { replace: true });
                            return;
                        }}
                        icon={<PersonStanding size={18} />}
                        path={[constants.EMPLOYEES_PATH]}>
                        Empleados
                    </SideButton>
                )}

            </div>

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