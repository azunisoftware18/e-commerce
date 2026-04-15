"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export default function FilterDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  multi = false,
  searchable = false,
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle select
  const handleSelect = (option) => {
    if (multi) {
      const exists = value?.includes(option.value);
      const newValue = exists
        ? value.filter((v) => v !== option.value)
        : [...(value || []), option.value];

      onChange(newValue);
    } else {
      onChange(option.value);
      setOpen(false);
    }
  };

  // Filter options
  const filteredOptions = options.filter((opt) => {
  const label = typeof opt === "string" ? opt : opt?.label;

  return (label || "")
    .toLowerCase()
    .includes((search || "").toLowerCase());
});
  // Display label
  const getLabel = () => {
    if (multi) {
      if (!value?.length) return placeholder;
      return options
        .filter((o) => value.includes(o.value))
        .map((o) => o.label)
        .join(", ");
    } else {
      const selected = options.find((o) => o.value === value);
      return selected?.label || placeholder;
    }
  };

  return (
    <div ref={ref} className={`relative w-100  ${className}`}>
      {/* Button */}
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm hover:border-gray-400  disabled:bg-gray-100"
      >
        <span className="truncate text-left">{getLabel()}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-400 rounded-xl shadow-lg max-h-72 overflow-hidden">
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 px-2 py-1 border rounded-md">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full outline-none text-sm"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 && (
              <li className="p-3 text-sm text-gray-500 text-center">
                No options found
              </li>
            )}

           {filteredOptions.map((option, index) => {
  const isSelected = multi
    ? value?.includes(option.value)
    : value === option.value;

  return (
    <li
      // Use the value, but fallback to the index if value is missing
      key={option.value ?? `opt-${index}`} 
      onClick={() => handleSelect(option)}
      className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
        isSelected ? "bg-gray-50 text-gray-600" : ""
      }`}
    >
      <span>{option.label}</span>
      {isSelected && <Check size={16} />}
    </li>
  );
})}
          </ul>
        </div>
      )}
    </div>
  );
}
