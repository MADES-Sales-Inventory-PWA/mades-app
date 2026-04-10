import { useState } from 'react'
import '../App.css'
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Input } from '../components/Input';
import { InputPassword } from '../components/InputPassword';
import { Mail, LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();
    console.log(data);
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
              <b>Iniciar sesión</b>
              <LogIn className="ml-2" size={18} />
            </div>
          </Button>
      </div>
    </div>
  );
}
