import { BasicButton } from "./BasicButton";
import { LogOut } from "lucide-react";
import { Icon } from "./Icon";
import { OnlineIndicator } from "../components/OnlineIndicator";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useLogout } from "../hooks/useLogout";
import { ConfirmDialog } from "./ConfirmDialog";

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
  const { requestLogout, showConfirm, confirmLogout, cancelLogout } = useLogout();

  const shouldShowLogo = showBrandIcon || showMobileIcon;

  return (
    <>
    <div className="relative z-40 flex h-20 w-full min-w-0 items-center gap-3 overflow-visible border-b border-slate-200/70 bg-white px-4 py-4 sm:px-5">
      <div className="relative flex min-w-0 items-center gap-2 sm:gap-3">
        {shouldShowLogo && (
          <div className={`${showMobileIcon && !showBrandIcon ? "lg:hidden" : ""} shrink-0`}>
            <Icon size={42} />
          </div>
        )}

        <h1 className="min-w-0 truncate text-xl font-bold text-gray-800 sm:text-3xl">{title}</h1>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        {/* <BasicButton onClick={() => {}} className="p-2 hover:bg-gray-200 active:text-gray-500">
          <Bell />
        </BasicButton> */}
        <OnlineIndicator isOnline={isOnline} />
        {enableLogoMenu && (
          <BasicButton
            onClick={requestLogout}
            className="lg:hidden p-2 hover:bg-gray-200 active:text-gray-500 text-slate-600"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
          </BasicButton>
        )}
      </div>
    </div>

    {showConfirm && (
      <ConfirmDialog
        title="¿Cerrar sesión sin conexión?"
        message="No tienes conexión a internet. Si cierras sesión, no podrás volver a ingresar hasta que recuperes la señal."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    )}
  </>
  );
};
