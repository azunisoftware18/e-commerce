import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export default function ActionMenu({
  actions = [],
  containerClassName = "",
  menuClassName = "",
  align = "right",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Color Constants for Consistency
  const brandColor = "#2A4150";
  const brandBgLight = "#f1f5f9"; // slate-100 equivalent

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: align === "right" ? rect.right + window.scrollX : rect.left + window.scrollX,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsOpen(false);
    if (isOpen) window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  const alignmentClass = align === "right" ? "-translate-x-full" : "";

  const renderActionIcon = (icon, isDanger) => {
    if (!icon) return null;

    const baseClass = isDanger
      ? "text-red-500 group-hover:text-red-600"
      : `text-slate-400 group-hover:text-[#2A4150]`;

    return (
      <span className={`mr-3 transition-colors ${baseClass}`}>
        {React.isValidElement(icon) ? icon : <icon size={16} />}
      </span>
    );
  };

  return (
    <div className={`relative inline-block ${containerClassName}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`p-1.5 rounded-lg transition-all duration-200 focus:outline-none 
          ${isOpen 
            ? 'bg-[#2A4150] text-white shadow-md' 
            : 'hover:bg-slate-100 text-slate-500 hover:text-[#2A4150]'}`}
      >
        <MoreVertical size={18} />
      </button>

      {/* Menu Panel using Portal */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999
          }}
          className={`mt-2 w-48 rounded-xl border border-slate-100 
            bg-white shadow-xl focus:outline-none ring-1 ring-black/5
            animate-in fade-in zoom-in-95 duration-100 ${alignmentClass} ${menuClassName}`}
          role="menu"
        >
          <div className="p-1.5">
            {actions.map((action, index) => (
              <React.Fragment key={index}>
                {action.divider && <div className="my-1 border-t border-slate-100" />}
                <button
                  onClick={() => {
                    if (!action.disabled) {
                      action.onClick?.();
                      setIsOpen(false);
                    }
                  }}
                  disabled={action.disabled}
                  className={`flex w-full items-center px-3 py-2 text-[13px] rounded-lg transition-all group
                    ${action.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    ${action.isDanger
                      ? "text-red-600 hover:bg-red-50 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#2A4150] font-medium"
                    }`}
                  role="menuitem"
                >
                  {renderActionIcon(action.icon, action.isDanger)}
                  <span className="flex-1 text-left">{action.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}