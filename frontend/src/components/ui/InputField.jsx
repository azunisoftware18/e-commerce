import React, { useId } from "react";

const InputField = React.forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      error,
      hint,
      icon: Icon,
      isRequired = false,
      isDisabled = false,
      className = "",
      containerClassName = "",
      maxLength,
      showButton = false,
      buttonText = "",
      onButtonClick,
      ...rest 
    },
    ref
  ) => {
    const id = useId();

    return (
      <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative w-full">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon size={18} />
            </div>
          )}

          <input
            id={id}
            ref={ref} // ✅ MOST IMPORTANT
            type={type}
            placeholder={placeholder}
            disabled={isDisabled}
            maxLength={maxLength}
            className={`
              w-full border border-slate-300 rounded-md px-3 py-2 text-sm
              outline-none transition-all bg-white
              focus:border-[#2A4150] focus:ring-2 focus:ring-[#2A4150]/10
              ${Icon ? "pl-10" : ""}
              ${showButton ? "pr-24" : ""}
              ${isDisabled ? "bg-slate-100 cursor-not-allowed" : ""}
              ${error ? "border-red-500 focus:ring-red-200" : ""}
              ${className}
            `}
            {...rest} // ✅ register props (onChange, name, ref, etc)
          />

          {showButton && (
            <button
              type="button"
              onClick={onButtonClick}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded-md bg-[#2A4150] text-white hover:bg-[#1f313c] transition"
            >
              {buttonText}
            </button>
          )}
        </div>

        <div className="text-xs mt-1">
          {error ? (
            <span className="text-red-500 font-medium">{error}</span>
          ) : (
            hint && <span className="text-slate-400">{hint}</span>
          )}
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;