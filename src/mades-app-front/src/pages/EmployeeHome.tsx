import { useNavigate } from "react-router-dom";
import { clearSession } from "../utils/auth";

export default function EmployeeHome() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <div className="w-full max-w-xl mx-auto px-8 py-10 rounded-xl bg-card-bg shadow-md">
        <h1 className="brand-name text-surface-variant text-center">Inicio Employee</h1>
        <p className="greeting-sub text-surface-variant text-center mt-2">
          Vista temporal de empleado.
        </p>
        <button
          type="button"
          onClick={() => {
            clearSession();
            navigate("/", { replace: true });
          }}
          className="w-full mt-6 bg-gradient-to-b from-button-login-1 to-button-login-2 text-white py-2 px-4 rounded-[0.4rem]"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
