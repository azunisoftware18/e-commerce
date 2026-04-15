"use client";

import React, { useId } from "react";

export default function TextAreaField({
  label,
  placeholder = "Enter your message...",
  error,
  hint,
  rows = 4,
  maxLength,
  isRequired = false,
  isDisabled = false,
  resize = "vertical",
  className = "",
  containerClassName = "",
  ...rest // 👈 register yahan aayega
}) {
  const id = useId();

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
      
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={isDisabled}
        {...rest} // ✅ React Hook Form connect
        className={`
          w-full border border-slate-300 rounded-md px-3 py-2 text-sm
          bg-white outline-none transition-all
          focus:border-[#2A4150] focus:ring-2 focus:ring-[#2A4150]/10
          ${resizeClasses[resize]}
          ${isDisabled ? "bg-slate-100 cursor-not-allowed" : "text-slate-700"}
          ${error ? "border-red-500 focus:ring-red-100" : ""}
          ${className}
        `}
      />

      <div className="flex justify-between items-center text-xs mt-1">
        {error ? (
          <span className="text-red-500 font-medium">{error}</span>
        ) : (
          hint && <span className="text-slate-400">{hint}</span>
        )}

        {maxLength && (
          <span className="text-slate-400">
            {/* 👇 RHF me value nahi milega direct, optional hai */}
          </span>
        )}
      </div>
    </div>
  );
}