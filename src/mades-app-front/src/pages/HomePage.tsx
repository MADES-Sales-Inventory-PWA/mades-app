import { ButtonImage } from "../components/ButtonImage";
import { OnlineIndicator } from "../components/OnlineIndicator";
import { SideBar } from "../components/SideBar";
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Bell } from "lucide-react";

export default function EmployeeHome({ roleid }: { roleid: number }) {
  const isOnline = useOnlineStatus();
  return (
    <div className="flex items-center justify-start min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <SideBar roleid={roleid} />

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex w-full items-center p-5 flex-row bg-white gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">MADES</h1>
          <OnlineIndicator isOnline={isOnline} />
          <ButtonImage onClick={() => {}} className="ml-auto">
            <Bell />
          </ButtonImage>
        </div>
      </div>
    </div>
  );
}
