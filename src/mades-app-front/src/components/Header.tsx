import { BasicButton } from "./BasicButton";
import { OnlineIndicator } from "../components/OnlineIndicator";
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Bell } from "lucide-react";

export const Header = () => {
  const isOnline = useOnlineStatus();
    return (
    <div className="flex w-full items-center p-5 flex-row bg-white gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">MADES</h1>
          <OnlineIndicator isOnline={isOnline} />
          <BasicButton onClick={() => {}} className="ml-auto hover:bg-gray-200 p-2 active:text-gray-500">
            <Bell />
          </BasicButton>
    </div>
  );
};
