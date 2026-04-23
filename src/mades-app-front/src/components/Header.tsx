import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BasicButton } from "./BasicButton";
import { OnlineIndicator } from "../components/OnlineIndicator";
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Bell, LogOut } from "lucide-react";
import { Icon } from "./Icon";
import { clearSession } from "../utils/auth";

type HeaderProps = {
  title?: string;
  showMobileIcon?: boolean;
  showBrandIcon?: boolean;
  enableLogoMenu?: boolean;
};

export const Header = ({
  title = "MADES",
  showMobileIcon = false,
  showBrandIcon = false,
  enableLogoMenu = false,
}: HeaderProps) => {
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const shouldShowLogo = showBrandIcon || showMobileIcon;

  const logout = () => {
    clearSession();
    setIsMenuOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-20 w-full items-center gap-4 border-b border-slate-200/70 bg-white px-5 py-4">
      <div className="relative flex items-center gap-3">
        {shouldShowLogo && (
          <button
            type="button"
            onClick={() => {
              if (enableLogoMenu) {
                setIsMenuOpen((current) => !current);
              }
            }}
            className={`${showMobileIcon && !showBrandIcon ? "lg:hidden" : ""} rounded-full ${enableLogoMenu ? "cursor-pointer" : "cursor-default"}`}
            aria-label="Abrir menú de sesión"
          >
            <Icon size={42} />
          </button>
        )}

        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>

        {enableLogoMenu && isMenuOpen && (
          <div className="absolute left-0 top-12 z-40 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 hover:text-primary-blue"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
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
