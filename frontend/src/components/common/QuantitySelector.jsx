"use client";

import { Plus, Minus, Trash2 } from "lucide-react";

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
  showRemove = true,
  variant = "default", // 'default' for cart, 'button' for product card
  className = "", // Extra custom classes
}) {
  // Variant base styles
  const isButton = variant === "button";

  return (
    <div
      className={`flex items-center justify-between ${!isButton ? "mt-6" : ""} ${className}`}
    >
      {/* Quantity Control Container */}
      <div
        className={`flex items-center transition-all ${
          isButton
            ? "w-full justify-between bg-[#2A4150] text-white h-full px-2" // Button style
            : "bg-slate-50 border border-[#e0e0e0] rounded-lg p-1" // Cart style
        }`}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDecrease(e);
          }}
          className={`p-1 rounded-md transition-all flex items-center justify-center ${
            isButton
              ? "hover:bg-white/20 text-white w-10 h-10"
              : "hover:bg-white hover:shadow-sm text-slate-600"
          }`}
        >
          {/* Agar quantity 1 hai to Trash icon dikhao, warna Minus */}
          {quantity === 1 ? (
            <Trash2 size={isButton ? 18 : 16} />
          ) : (
            <Minus size={isButton ? 20 : 16} />
          )}
        </button>

        <span
          className={`font-bold min-w-10 text-center ${
            isButton ? "text-lg px-2" : "text-slate-700 px-4"
          }`}
        >
          {quantity}
        </span>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onIncrease(e);
          }}
          className={`p-1 rounded-md transition-all flex items-center justify-center ${
            isButton
              ? "hover:bg-white/20 text-white w-10 h-10"
              : "hover:bg-white hover:shadow-sm text-slate-600"
          }`}
        >
          <Plus size={isButton ? 20 : 16} />
        </button>
      </div>

      {/* Remove Button (Only for Cart/Default) */}
      {showRemove && !isButton && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(e);
          }}
          className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
        >
          <Trash2 size={16} />
          Remove
        </button>
      )}
    </div>
  );
}
