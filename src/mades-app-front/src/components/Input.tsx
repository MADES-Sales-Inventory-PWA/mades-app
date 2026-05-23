import type { ReactNode } from "react";

type InputProps = {
  label?: string;
  type: string;
  placeholder: string;
  value: string | number;
  onChange: (value: string) => void;
  icon?: ReactNode;
  height?: string;
  className?: string;
  disabled?: boolean;
};

export const Input = ({ disabled ,label, type, placeholder, value, onChange, icon, height, className }: InputProps) => {
  return (
    <div>
      {label && (
        <label htmlFor={label} className="  block text-m font-medium text-surface-variant">
          <b>{label}</b>
        </label>
      )}
      <div className="relative">
        <input
          id={label}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`font-sans text-s text-gray-500 bg-input-login border border-input-border border-[1.5px] mt-1 ${height || 'h-13'} px-2 block w-full rounded-default shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 placeholder:font-sans placeholder:text-gray-500 placeholder:italic ${className || ''} ${disabled ? 'cursor-not-allowed' : 'focus:outline-none'}`}
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
