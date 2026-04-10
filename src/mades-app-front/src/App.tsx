import { useState } from 'react'
import './App.css'
import { Button } from './components/Button';
import { Icon } from './components/Icon';
import { Input } from './components/Input';
import { InputPassword } from './components/InputPassword';
import { Mail, LogIn } from "lucide-react";
import { backendApi } from './services/backend-api';

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Debes ingresar correo y contraseña");
      return;
    }

    try {
      setIsLoading(true);
      const data = await backendApi.login({ email, password });

      const token = data?.token;
      const user = data?.user;

      if (!token || !user) {
        throw new Error("No se recibió la sesión del backend");
      }

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));

      setMessage(`Bienvenido, ${user.name}`);
    } catch (loginError) {
      const messageText = loginError instanceof Error ? loginError.message : "No fue posible iniciar sesión";
      setError(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <div className="w-100 container mx-auto px-8 py-10 rounded-xl bg-card-bg shadow-md">
        <Icon />
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
          <Button onClick={login} >
            <div className="flex items-center justify-center">
              <b>{isLoading ? "Iniciando..." : "Iniciar sesión"}</b>
              <LogIn className="ml-2" size={18} />
            </div>
          </Button>

          {message && <p className="mt-3 text-sm text-center text-green-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-center text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default App

