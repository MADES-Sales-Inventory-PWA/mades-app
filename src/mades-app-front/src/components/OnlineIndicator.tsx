import { WifiOff, Wifi } from "lucide-react";

export const OnlineIndicator = ({isOnline}:{isOnline: boolean}) => {
    const className = isOnline ? "bg-green-100 border-green-400 border-[1px] text-green-700" : "bg-red-100 border-red-400 text-red-700";
    const text = isOnline ? "Conectado" : "Sin conexión";
    const colorText = isOnline ? "text-green-700" : "text-red-700";
    return (
        <div className={`px-2  ${className} rounded-full flex items-center gap-2`}>
            {
                isOnline? (
                    <Wifi size={15} className="text-green-600" />
                ) : (
                    <WifiOff size={15} className="text-red-600" />
                )
            }
            <span className={`${colorText} font-semibold text-sm`}>{text}</span>
        </div>
    );
}