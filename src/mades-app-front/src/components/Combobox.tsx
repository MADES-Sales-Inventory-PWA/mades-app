import type { ReactNode } from "react";

type Option = {
  value: string;
  label: string;
};

type ComboboxProps = {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  icon?: ReactNode;
  className?: string;
  height?: string;
};

export const Combobox = ({ label, placeholder, value, onChange, options, icon, className, height }: ComboboxProps) => {
  return (
    <div className={`${className}`}>
      <label htmlFor={label} className="  block text-m font-medium text-surface-variant">
        <b>{label}</b>
      </label>
      <div className="relative">
        <select
          name={label}
          id={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
            className={`font-sans text-s text-gray-500 italic bg-input-login border border-input-border border-[1.5px] mt-1 ${height || 'h-13'} px-2 block w-full rounded-default shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50`}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {icon && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
