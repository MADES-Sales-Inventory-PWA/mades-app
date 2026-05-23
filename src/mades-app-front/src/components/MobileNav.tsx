import { BarChart3, Box, House, ShoppingCart, Users } from "lucide-react";
import type { ReactNode } from "react";
import { constants } from "../constants/Constants";
import { getSession } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export const MobileNav = () => {
    const session = getSession();
    const roleId = Number(session?.user?.roleId);
    const navigate = useNavigate();

    type NavItem = {
        label: string;
        icon: ReactNode;
        path: string;
        enabled: boolean;
    };
    const navItems: NavItem[] = [
        {
            label: "Inicio",
            icon: <House size={18} />,
            path: roleId === constants.ADMIN_ROLE_ID ? "/inicio-admin" : "/inicio-employee",
            enabled: true,
        },
        {
            label: "Inventario",
            icon: <Box size={18} />,
            path: constants.INVENTORY_PATH,
            enabled: constants.INVENTORY_ALLOWED_ROLES.includes(roleId),
        },
        {
            label: "Carrito",
            icon: <ShoppingCart size={18} />,
            path: constants.SALES_PATH,
            enabled: constants.SALES_ALLOWED_ROLES.includes(roleId),
        },
        {
            label: "Reportes",
            icon: <BarChart3 size={18} />,
            path: constants.REPORTS_PATH,
            enabled: constants.REPORTS_ALLOWED_ROLES.includes(roleId),
        },
        {
            label: "Empleados",
            icon: <Users size={18} />,
            path: constants.EMPLOYEES_PATH,
            enabled: constants.EMPLOYEES_ALLOWED_ROLES.includes(roleId),
        },
    ];
    return (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white px-1 py-2 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] lg:hidden">
            <div className="mx-auto grid max-w-[700px] grid-cols-5 gap-1">
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
                            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-semibold transition ${isActive
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
    );
}