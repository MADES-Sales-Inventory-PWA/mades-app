import { AdminHomeContent } from "../components/AdminHomeContent";
import { EmployeeHomeContent } from "../components/EmployeeHomeContent";
import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";
import { constants } from "../constants/Constants";
import { getSession } from "../utils/auth";

export default function HomePage() {
  const session = getSession();
  const roleId = Number(session?.user?.roleId);

  return (
    <div className="flex items-center justify-start min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <SideBar roleid={roleId} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        {roleId === constants.ADMIN_ROLE_ID 
          ? <AdminHomeContent /> 
          : <EmployeeHomeContent />
        }
      </div>
    </div>
  );
}
