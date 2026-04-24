import { useLocation, useNavigate } from "react-router-dom";
import { AdminHomeContent } from "../components/AdminHomeContent";
import { EmployeeHomeContent } from "../components/EmployeeHomeContent";
import { EmployeeManagementContent } from "../components/EmployeeManagementContent";
import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";
import { constants } from "../constants/Constants";
import { getSession } from "../utils/auth";
import { InventoryContent } from "../components/InventoryContent";
import { BarChart3, Box, House, ShoppingCart, Users } from "lucide-react";
import type { ReactNode } from "react";

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const roleId = Number(session?.user?.roleId);

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
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-background to-background-2">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] overflow-x-hidden">
        <aside className="hidden w-[250px] shrink-0 lg:block">
          <SideBar />
        </aside>
        <div className="flex-1 flex flex-col min-h-screen pb-24 lg:pb-0">
          <Header />
          {location.pathname === constants.ADMIN_HOME_PATH && roleId === constants.ADMIN_ROLE_ID ? (
            <AdminHomeContent />
          ) : location.pathname === constants.EMPLOYEE_HOME_PATH && roleId === constants.EMPLOYEE_ROLE_ID && (
            <EmployeeHomeContent />
          )}

          {location.pathname === constants.INVENTORY_PATH && (
            <InventoryContent />
          )}

          {location.pathname === constants.SALES_PATH && (
            <div className="flex items-center justify-center h-full">
              <h2 className="text-2xl font-bold text-gray-700">Sección de Ventas (en construcción)</h2>
            </div>
          )}

          {location.pathname === constants.REPORTS_PATH && (
            <div className="flex items-center justify-center h-full">
              <h2 className="text-2xl font-bold text-gray-700">Sección de Reportes (en construcción)</h2>
            </div>
          )}

          {location.pathname === constants.EMPLOYEES_PATH && roleId === constants.ADMIN_ROLE_ID && (
            <EmployeeManagementContent />
          )}
        </div>
      </div>
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
    </div>

  );
}
