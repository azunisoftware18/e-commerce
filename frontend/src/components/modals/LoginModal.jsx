"use client";

import Login from "@/app/(auth)/login/page";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const handleLoginSuccess = () => {
    if (onLoginSuccess) onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-9999 grid place-items-center p-4 backdrop-blur-sm transition-all">
      <div className="relative w-full max-w-112.5 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 text-slate-400 hover:text-black transition-colors rounded-full hover:bg-slate-100/80"
        >
          <span className="text-xl leading-none">✕</span>
        </button>

        <div className="overflow-y-auto w-full custom-scrollbar">
          <Login title="Login" onSuccess={handleLoginSuccess} isModal={true} />
        </div>
      </div>
    </div>
  );
}
