import { useState } from 'react';
import '../App.css'
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Input } from '../components/Input';
import { InputPassword } from '../components/InputPassword';
import { LogIn, Text, Mail, Phone } from "lucide-react";
import { Combobox } from '../components/Combobox';
import { TIPOS_DOCUMENTO } from '../constants/documentTypes';
import { getAuthHeaders } from '../utils/auth';

type CreateAdminProps = {
  onCreated: () => void;
};

export default function CreateAdmin({ onCreated }: CreateAdminProps) {
  const [email, setEmail] = useState("");
  const [names, setNames] = useState("");
  const [surnames, setSurnames] = useState("");
  const [phone, setPhone] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [firstAdminSecretCode, setFirstAdminSecretCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const mapDocumentTypeForApi = (value: string) => {
    if (value === "PP") return "PASSPORT";
    if (value === "CC" || value === "CE") return value;
    return null;
  };

  const createAdmin = async () => {
    if (isCreating) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (
      !names.trim() ||
      !surnames.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !documentType ||
      !documentNumber.trim() ||
      !firstAdminSecretCode.trim() ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Completa todos los campos obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    const apiDocumentType = mapDocumentTypeForApi(documentType);
    if (!apiDocumentType) {
      setErrorMessage("Tipo de documento no soportado por el backend.");
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch("http://localhost:3000/api/auth/register-initial-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: names,
          lastName: surnames,
          email: email,
          phoneNumber: phone,
          documentType: apiDocumentType,
          documentNumber: documentNumber,
          state: true,
          firstAdminSecretCode: firstAdminSecretCode,
          password: password,
          rolId: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "No se pudo crear el administrador.");
      }

      setSuccessMessage("Administrador creado correctamente.");
      setNames("");
      setSurnames("");
      setEmail("");
      setPhone("");
      setDocumentType("");
      setDocumentNumber("");
      setFirstAdminSecretCode("");
      setPassword("");
      setConfirmPassword("");
      onCreated();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
      setErrorMessage(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
      <div className="w-150 container mx-auto mt-5 mb-5 px-8 py-10 rounded-xl bg-card-bg shadow-md">
        <Icon />
        <h1 className=" brand-name text-surface-variant text-center"><strong>MADES</strong></h1>
        <h3 className=" greeting-title mt-4 text-surface-variant text-center"><b>Creación de administrador</b></h3>
        <h3 className=" greeting-sub text-surface-variant text-center"> Configure las credenciales del primer administrador del sistema </h3>
        <div className='h-[0.5px] bg-[#6b6b6b] my-4'></div>
        <h4 className="info-title text-subtitle font-bold">INFORMACIÓN PERSONAL</h4>

        <div className='grid grid-cols-2 gap-4'>
          <Input
            label="Nombres"
            type="text"
            placeholder="Ingresa tus nombres"
            value={names}
            onChange={setNames}
            icon={<Text size={18} />}
          />
          <Input
            label="Apellidos"
            type="text"
            placeholder="Ingresa tus apellidos"
            value={surnames}
            onChange={setSurnames}
            icon={<Text size={18} />}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Input
            label="Email"
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={setEmail}
            icon={<Mail size={18} />}
          />
          <Input
            label="Telefono"
            type="text"
            placeholder="Ingresa tu número de teléfono"
            value={phone}
            onChange={setPhone}
            icon={<Phone size={18} />}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Combobox
            className='mb-4'
            label="Tipo de documento"
            placeholder="Selecciona tu tipo de documento"
            value={documentType}
            onChange={setDocumentType}
            options={TIPOS_DOCUMENTO}
          />
          <Input
            label="Número de documento"
            type="text"
            placeholder="Ingresa tu número de documento"
            value={documentNumber}
            onChange={setDocumentNumber}
            icon={<Text size={18} />}
          />
        </div>

        <InputPassword
          label="Código de validación"
          type="password"
          placeholder="Ingresa el código del primer administrador"
          value={firstAdminSecretCode}
          onChange={setFirstAdminSecretCode}
        />

        <div className='h-[0.5px] bg-[#6b6b6b] my-4'></div>
        <h4 className="info-title text-subtitle font-bold">SEGURIDAD</h4>

        <div className='grid grid-cols-2 gap-4'>
          <InputPassword
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={setPassword}
          />
          <InputPassword
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>
        {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
        {successMessage && <p className="mt-2 text-sm text-green-700">{successMessage}</p>}
        <Button onClick={createAdmin} >
          <div className="flex items-center justify-center">
            <b>{isCreating ? "Creando..." : "Crear cuenta"}</b>
            <LogIn className="ml-2" size={18} />
          </div>
        </Button>
      </div>
    </div>
  );
}