"use client";

import { useState } from "react";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess, isModal = true }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  if (isModal && !isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email) {
      setError("Email address is required");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success("Reset link sent to your email!");
      if (onSuccess) onSuccess();
    }, 1500);

    /* 
    // Actual implementation with your mutation:
    mutate({ email }, {
      onSuccess: () => {
        setIsSent(true);
        toast.success("Reset link sent!");
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        setError(err?.response?.data?.message || "Something went wrong");
      }
    });
    */
  };

  return (
    <div
      className={`${
        isModal
          ? "fixed inset-0 z-50 flex items-center justify-center   p-4"
          : "w-full"
      }`}
    >
      <div
        className={`w-full max-w-md bg-white ${
          isModal
            ? "rounded-[2rem]  overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
            : "mx-auto my-10 border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden"
        }`}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#2A4150] to-[#1a3340] px-8 py-8 relative">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSent ? "Check Your Email" : "Forgot Password?"}
          </h2>
          <p className="text-slate-300 text-sm mt-1.5">
            {isSent
              ? "We have sent password recovery instructions to your email."
              : "No worries! Enter your email and we'll send you a reset link."}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-semibold animate-[shake_0.5s_ease-in-out]">
              {error}
            </div>
          )}

          {!isSent ? (
            /* Request Reset Form */
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Action Button */}
              <Button
                text={
                  <div className="flex items-center justify-center gap-2">
                    {isLoading ? "Sending Link..." : "Send Reset Link"}
                    {!isLoading && <ArrowRight size={16} />}
                  </div>
                }
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full font-bold py-3 rounded-xl bg-gradient-to-r from-[#2A4150] to-[#1a3340] 
                  text-white hover:from-[#1a3340] hover:to-[#2A4150] 
                  transition-all duration-300 shadow-lg shadow-[#2A4150]/20 
                  active:scale-[0.98] mt-2"
              />
            </div>
          ) : (
            /* Success State Message */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail size={28} />
              </div>
              <p className="text-sm text-slate-600 px-4">
                Did not receive the email? Check your spam folder or try resending.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="text-xs font-bold text-[#2A4150] hover:underline"
              >
                Try another email address
              </button>
            </div>
          )}

          {/* Back to Login Button */}
          <div className="text-center pt-5 mt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2A4150] transition-colors group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}