"use client";

import React, { useId, useRef, useState, useEffect } from "react";
import { Search, X, Loader2, User, ChevronRight } from "lucide-react";
import Button from "./Button";

export default function SearchField({
  value,
  onChange,
  onClear,
  onSearch,
  results = [],
  showResults = false,
  placeholder = "",
  isLoading = false,
  showButton = false,
  buttonText = "Search",
  className = "",
  containerClassName = "",
  onResultClick,
  ...props
}) {
  const id = useId();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    if (onClear) onClear();
    else onChange?.({ target: { value: "" } });
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${containerClassName}`} ref={containerRef}>
      {/* Main Search Container */}
      <div
        className={`
          flex w-full items-stretch 
          border border-[#2A4150] rounded-full  {/* Naya Border Color */}
          overflow-hidden bg-white
          transition-all duration-200
          focus-within:border-[#1F3342] focus-within:ring-1 focus-within:ring-[#1F3342]/20
          ${className}
        `}
      >
        <div className="relative flex-1 flex items-center">
          {/* Input */}
          <input
            id={id}
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              onChange?.(e);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
            placeholder={placeholder}
            className="w-full bg-transparent pl-6 pr-10 py-2.5 text-[15px] text-[#2A4150] outline-none placeholder:text-slate-400 rounded-l-full"
            {...props}
          />

          {/* Clear Button */}
          {value && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 p-1 text-slate-400 hover:text-[#1F3342]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Button - Inherits colors from your Button component */}
        {showButton && (
          <Button
            text={buttonText}
            icon={<Search size={18} strokeWidth={2.5} />}
            onClick={() => {
              onSearch?.();
              setShowDropdown(false);
            }}
            disabled={isLoading}
            className="
              flex items-center gap-2
              px-6 py-2
              rounded-r-full rounded-l-none 
              border-none
              -m-px 
              transition-colors
            "
          />
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && showDropdown && value && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((item, index) => (
                <div
                  key={item.id || index}
                  onClick={() => {
                    onResultClick?.(item);
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {/* Updated icon background to match theme */}
                    <div className="p-1.5 bg-slate-100 rounded text-[#2A4150] group-hover:bg-[#2A4150]/10 group-hover:text-[#1F3342]">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#1F3342]">
                      <div>
  <div className="font-medium">{item.name}</div>
  <div className="text-xs text-slate-400">
    {item.category?.name} • {item.subCategory?.name}
  </div>
</div>
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-[#1F3342]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-slate-400 italic">
              No matches found for "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}