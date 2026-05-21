"use client";

import Login from "@/app/(auth)/login/page";
import { X } from "lucide-react";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const handleLoginSuccess = () => {
    if (onLoginSuccess) onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-slate-600 
            transition-colors rounded-full hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        {/* No Scroll - Clean Form */}
        <div className="w-full">
          <Login title="Welcome Back" onSuccess={handleLoginSuccess} isModal={true} />
        </div>
      </div>
    </div>
  );
}