import { useState } from "react";
//import { useNavigate } from "react-router-dom";
import { clearSession } from "../utils/auth";
import { useOnlineStatus } from "./useOnlineStatus";

export function useLogout() {
  //const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [showConfirm, setShowConfirm] = useState(false);

  const requestLogout = () => {
    if (!isOnline) {
      setShowConfirm(true);
    } else {
      doLogout();
    }
  };

  const doLogout = () => {
    clearSession();
    window.location.replace("/");
  };

  const confirmLogout = () => {
    setShowConfirm(false);
    doLogout();
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return { requestLogout, showConfirm, confirmLogout, cancelLogout };
}
