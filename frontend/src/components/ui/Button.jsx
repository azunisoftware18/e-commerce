import React from "react";

export default function Button({
  text = "Button",
  icon,
  iconPosition = "left",
  onClick,
  type = "button", 
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}) {

  const baseStyle =
    "rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2";

  const variants = {
    // Aapka perfect color combination:
    primary: "bg-[#2A4150] text-white hover:bg-[#1F3342]",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline:
      "border border-[#1F3342] text-[#1F3342] hover:bg-[#1F3342] hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon && iconPosition === "left" && icon}

      {text}

      {icon && iconPosition === "right" && icon}
    </button>
  );
}