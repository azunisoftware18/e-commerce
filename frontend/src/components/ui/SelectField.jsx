import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const SelectField = forwardRef(({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Select option",
  error,
  disabled = false,
  required = false,
  className = "",
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative group">
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          disabled={disabled}
          className={`w-full appearance-none border border-slate-300 rounded-md px-3 py-2 pr-10 text-sm bg-white outline-none transition-all
          focus:border-[#2A4150] focus:ring-2 focus:ring-[#2A4150]/10
          ${disabled ? "bg-slate-100 cursor-not-allowed text-slate-400" : "text-slate-700"}
          ${error ? "border-red-500 focus:ring-red-100" : ""}
          ${className}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#2A4150] transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>
      )}
    </div>
  );
});

SelectField.displayName = "SelectField";
export default SelectField;