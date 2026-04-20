import { useLocation } from "react-router-dom";

export const SideButton = ({ children, onClick, icon, path }: { children: React.ReactNode; onClick: () => void; icon?: React.ReactNode; path: string[] }) => {
  const location = useLocation();
  function isActive() {
    for (const p of path) {
      if (location.pathname === p) {
        return true;
      }
    }
    return false;
  }
  const className = `${isActive()
    ? "bg-side-button shadow-sm py-3 px-4 text-icon-color"
    : "py-1 px-4 text-gray-500"
    }`;
  return (
    <button
      className={`flex flex-row items-center justify-start w-full mt-3 font-bold rounded-[0.4rem] hover:text-icon-color focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50 ${className}`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}