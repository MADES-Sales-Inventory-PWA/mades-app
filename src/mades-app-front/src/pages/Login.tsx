import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import '../App.css'
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Input } from '../components/Input';
import { InputPassword } from '../components/InputPassword';
import { Mail, LogIn, WifiOff } from "lucide-react";
import { saveSession } from '../utils/auth';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { constants } from '../constants/Constants';
import { useToast } from '../components/ToastProvider';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { showToast } = useToast();

  const login = async () => {
    if (isLoading) return;

    if (!email.trim() || !password.trim()) {
      showToast("Debes completar usuario y contraseña.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(constants.BACKEND_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        showToast(data?.message || "No fue posible iniciar sesión.");
        return;
      }

      const token = data?.data?.token;
      const user = data?.data?.user;

      if (!token || !user) {
        showToast("La respuesta del servidor no incluye sesión válida.");
        return;
      }

      saveSession({ token, user });

      const roleId = Number(user.roleId);

      if (roleId === 1) {
        navigate(constants.ADMIN_HOME_PATH, { replace: true });
        return;
      }

      if (roleId === 2) {
        navigate(constants.EMPLOYEE_HOME_PATH, { replace: true });
        return;
      }

      showToast("El usuario no tiene un rol válido.");
    } catch {
      showToast("No fue posible conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <div className="w-100 container mx-auto px-8 py-10 rounded-xl bg-card-bg shadow-md">
        {!isOnline && (
          <div className="mb-2 p-3 bg-red-100 border border-red-400 rounded-lg flex items-center gap-2">
            <WifiOff size={20} className="text-red-600" />
            <span className="text-red-700 font-semibold">Sin conexión a Internet</span>
          </div>
        )}
        <Icon className='mx-auto' />
        <h1 className=" brand-name text-surface-variant text-center"><strong>MADES</strong></h1>
        <h2 className=" brand-sub text-surface-variant text-center">The control mades reality</h2>

        <h3 className=" greeting-title mt-4 text-surface-variant text-center">¡Bienvenido de nuevo!</h3>
        <h3 className=" greeting-sub text-surface-variant text-center"> Ingresa tus credenciales para ingresar al portal</h3>

        <div className='h-[0.5px] bg-[#6b6b6b] my-4'></div>

        <div className='flex flex-col gap-2'>
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={setEmail}
            icon={<Mail size={18} />}
          />
          <InputPassword
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={setPassword}
          />
        </div>
        <Button onClick={login} className="w-full mt-2">
          <div className="flex items-center justify-center">
            <b>{isLoading ? "Ingresando..." : "Iniciar sesión"}</b>
            <LogIn className="ml-2" size={18} />
          </div>
        </Button>
      </div>
    </div>
  );
}
