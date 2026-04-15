"use client";

import { useDispatch, useSelector } from "react-redux";
import { ShieldAlert, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import { openLogin } from "@/store/slices/authSlice";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="relative w-full max-w-md">
          
          {/* Background Decorative Blur */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#2A4150]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl"></div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 text-center relative z-10">
            
            {/* Animated Icon Container */}
            <div className="w-24 h-24 bg-[#e0e0e0] rounded-4xl flex items-center justify-center mx-auto mb-8 relative transition-transform hover:scale-105 duration-500">
              <Lock size={40} className="text-[#2A4150]" />
              <div className="absolute -top-1 -right-1">
                <span className="flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 border-2 border-white items-center justify-center">
                    <ShieldAlert size={12} className="text-white" />
                  </span>
                </span>
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Authentication Required
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
              This area is restricted. Please sign in to your account to access your personal dashboard and settings.
            </p>

            {/* Actions */}
            <div className="space-y-4">
              <Button 
                onClick={() => dispatch(openLogin())}
                text="Proceed to Login"
                className="w-full py-4 bg-[#2A4150] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/10 hover:bg-[#1a2b38] transition-all flex items-center justify-center gap-2"
                icon={<ArrowRight size={16} />}
              />
              
              <button 
                onClick={() => router.push("/")}
                className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#2A4150] transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Security Note */}
          <p className="text-center mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Protected by Enterprise Security
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}