import type { ReactNode } from "react";
import { AdminHomeContent } from "../components/AdminHomeContent";
import { EmployeeHomeContent } from "../components/EmployeeHomeContent";
import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";
import { constants } from "../constants/Constants";
import { getSession } from "../utils/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Box, House, ShoppingCart, Users } from "lucide-react";

type NavItem = {
  label: string;
  icon: ReactNode;
  path: string;
  enabled: boolean;
};

export default function HomePage() {
  const session = getSession();
  const roleId = Number(session?.user?.roleId);
  const navigate = useNavigate();
  const location = useLocation();

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
      path: "/ajuste-inventario",
      enabled: false,
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
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden lg:block">
          <SideBar roleid={roleId} />
        </aside>

        <div className="flex min-h-screen w-full flex-col pb-24 lg:pb-0">
        <Header
          title="MADES"
          showMobileIcon={roleId === constants.ADMIN_ROLE_ID}
          enableLogoMenu={roleId === constants.ADMIN_ROLE_ID}
        />
        {roleId === constants.ADMIN_ROLE_ID 
          ? <AdminHomeContent /> 
          : <EmployeeHomeContent />
        }
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
