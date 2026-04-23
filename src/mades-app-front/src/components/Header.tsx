import { BasicButton } from "./BasicButton";
import { OnlineIndicator } from "../components/OnlineIndicator";
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Bell } from "lucide-react";
import { Icon } from "./Icon";

type HeaderProps = {
  title?: string;
  showMobileIcon?: boolean;
};

export const Header = ({ title = "MADES", showMobileIcon = false }: HeaderProps) => {
  const isOnline = useOnlineStatus();
  return (
    <div className="flex h-20 w-full items-center gap-4 border-b border-slate-200/70 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            {showMobileIcon && (
              <div className="lg:hidden">
                <Icon size={42} />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <BasicButton onClick={() => {}} className="hover:bg-gray-200 p-2 active:text-gray-500">
              <Bell />
            </BasicButton>
            <OnlineIndicator isOnline={isOnline} />
          </div>
    </div>
  );
};
