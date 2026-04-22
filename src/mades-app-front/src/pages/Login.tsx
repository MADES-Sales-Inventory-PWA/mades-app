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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const login = async () => {
    if (isLoading) return;

    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Debes completar usuario y contraseña.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:3000/api/users/login", {
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
        setErrorMessage(data?.message || "No fue posible iniciar sesión.");
        return;
      }

      const token = data?.data?.token;
      const user = data?.data?.user;

      if (!token || !user) {
        setErrorMessage("La respuesta del servidor no incluye sesión válida.");
        return;
      }

      saveSession({ token, user });

      console.log('Sesión guardada:', localStorage.getItem('mades.auth.session'));

      const roleId = Number(user.roleId);

      if (roleId === 1) {
        navigate("/inicio-admin", { replace: true });
        return;
      }
      
      if (roleId === 2) {
        navigate("/inicio-employee", { replace: true });
        return;
      }

      setErrorMessage("El usuario no tiene un rol válido.");
    } catch {
      setErrorMessage("No fue posible conectar con el servidor.");
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
        {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
        <Button onClick={login} >
          <div className="flex items-center justify-center">
            <b>{isLoading ? "Ingresando..." : "Iniciar sesión"}</b>
            <LogIn className="ml-2" size={18} />
          </div>
        </Button>
      </div>
    </div>
  );
}
