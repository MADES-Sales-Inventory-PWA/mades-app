import { SideBar } from "../components/SideBar";

export default function EmployeeHome({ roleid }: { roleid: number }) {

  return (
    <div className="flex items-center justify-start min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <SideBar roleid={roleid} />
    </div>
  );
}
