import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputPasswordProps = {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export const InputPassword = ({ label, type, placeholder, value, onChange }: InputPasswordProps) => {
  const [show, setShow] = useState(false);
  return (
    <div className=" mb-4">
      <label htmlFor={label} className=" text-white block text-m font-medium text-surface-variant">
        <b>{label}</b>
      </label>
      <div className="relative">
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          id={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="bg-input-login mt-1 h-13 px-2 block w-full rounded-default border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          placeholder={placeholder}
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  );
}