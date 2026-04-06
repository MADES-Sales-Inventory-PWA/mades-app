import type { ReactNode } from "react";

type InputProps = {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
};

export const Input = ({ label, type, placeholder, value, onChange, icon }: InputProps) => {
  return (
    <div className="mb-4">
      <label htmlFor={label} className=" text-white block text-m font-medium text-surface-variant">
        <b>{label}</b>
      </label>
      <div className="relative">
        <input
          id={label}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="bg-input-login mt-1 h-13 px-2 block w-full rounded-default border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          placeholder={placeholder}
        />

        {icon && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
