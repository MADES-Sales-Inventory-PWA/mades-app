import { useLocation } from "react-router-dom";
import { AdminHomeContent } from "../components/AdminHomeContent";
import { EmployeeHomeContent } from "../components/EmployeeHomeContent";
import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";
import { constants } from "../constants/Constants";
import { getSession } from "../utils/auth";
import { InventoryContent } from "../components/InventoryContent";

export default function HomePage() {
  const location = useLocation();

  const session = getSession();
  const roleId = Number(session?.user?.roleId);

  return (
    <div className="flex items-center justify-start min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <SideBar />
      <div className="flex-1 flex flex-col min-h-screen">
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

        {location.pathname === constants.EMPLOYEES_PATH && (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-gray-700">Sección de Empleados (en construcción)</h2>
          </div>
        )}
      </div>
    </div>
  );
}
