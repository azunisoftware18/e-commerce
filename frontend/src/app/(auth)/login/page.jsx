"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { closeLogin, setUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLogin, useForgotPassword } from "@/lib/mutations/useAuth";
import { useQueryClient } from "@tanstack/react-query"; // 👈 Import for cart invalidation

export default function Login({ title, onSuccess, isModal = false }) {
  const { mutate: loginMutate, isLoading } = useLogin();
  const { mutate: forgotPasswordMutate, isLoading: isSendingEmail } = useForgotPassword();
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient(); // 👈 For cart invalidation
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  
  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    // 🔥 Get guest session ID from localStorage
    const sessionId = typeof window !== "undefined" 
      ? localStorage.getItem("cart_session_id") 
      : null;
    
    console.log("🔑 Login with sessionId:", sessionId);

    // 🔥 Send sessionId along with login data
    const loginData = {
      email: form.email,
      password: form.password,
      sessionId, // 👈 Session ID for cart merge
    };

    loginMutate(loginData, {
      onSuccess: (res) => {
        const user = res?.data?.data?.user;
        dispatch(setUser(user));
        localStorage.setItem("user", JSON.stringify(user));
        
        // 🔥 Clear guest session after successful login
        if (sessionId) {
          localStorage.removeItem("cart_session_id");
          console.log("🗑️ Cleared guest session ID after login");
        }

        // 🔥 Invalidate cart query to fetch merged cart
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        
        // 🔥 Also invalidate wishlist if needed
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });

        toast.success("Login Successful!");

        if (onSuccess) onSuccess();
        dispatch(closeLogin());

        if (user?.role?.toLowerCase?.() === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      },
      onError: (err) => {
        setError(err?.response?.data?.message || "Invalid credentials");
      },
    });
  };

  const handleForgotPassword = () => {
    setError("");
    
    if (!forgotEmail) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    forgotPasswordMutate(
      { email: forgotEmail },
      {
        onSuccess: (res) => {
          setIsEmailSent(true);
          toast.success(res?.data?.message || "Reset link sent to your email!");
        },
        onError: (err) => {
          setError(err?.response?.data?.message || "Failed to send reset link");
        },
      }
    );
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setForgotEmail("");
    setIsEmailSent(false);
    setError("");
  };

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div
        className={`w-full ${!isModal ? "max-w-md mx-auto my-10" : ""}`}
      >
        <div className="border border-slate-200 rounded-4xl shadow-xl overflow-hidden bg-white">
          {/* Header Section */}
          <div className="bg-linear-to-br from-[#2A4150] to-[#1a3340] px-8 py-8">
            <button
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Login</span>
            </button>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isEmailSent ? "Check Your Email" : "Forgot Password?"}
            </h2>
            <p className="text-slate-300 text-sm mt-1.5">
              {isEmailSent 
                ? "We've sent a reset link to your email" 
                : "Enter your email to receive a reset link"}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-semibold animate-[shake_0.5s_ease-in-out]">
                {error}
              </div>
            )}

            {isEmailSent ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Password reset link has been sent to
                  </p>
                  <p className="text-sm font-bold text-slate-800">{forgotEmail}</p>
                  <p className="text-xs text-slate-500 mt-3">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => {
                        setIsEmailSent(false);
                        setError("");
                      }}
                      className="text-[#2A4150] font-semibold hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>

                <Button
                  text="Back to Login"
                  onClick={handleBackToLogin}
                  className="w-full font-bold py-3 rounded-xl bg-linear-to-r from-[#2A4150] to-[#1a3340] 
                    text-white hover:from-[#1a3340] hover:to-[#2A4150] 
                    transition-all duration-300 shadow-lg shadow-[#2A4150]/20 
                    active:scale-[0.98]"
                />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <InputField
                      type="email"
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 pl-10 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleForgotPassword();
                      }}
                    />
                  </div>
                </div>

                <Button
                  text={
                    <div className="flex items-center justify-center gap-2">
                      {isSendingEmail ? "Sending..." : "Send Reset Link"}
                      {!isSendingEmail && <ArrowRight size={16} />}
                    </div>
                  }
                  onClick={handleForgotPassword}
                  disabled={isSendingEmail}
                  className="w-full font-bold py-3 rounded-xl bg-linear-to-r from-[#2A4150] to-[#1a3340] 
                    text-white hover:from-[#1a3340] hover:to-[#2A4150] 
                    transition-all duration-300 shadow-lg shadow-[#2A4150]/20 
                    active:scale-[0.98] mt-2"
                />

                <p className="text-center text-xs text-slate-500 mt-4">
                  Remember your password?{" "}
                  <button
                    onClick={handleBackToLogin}
                    className="font-semibold text-[#2A4150] hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Login View (Original)
  return (
    <div
      className={`w-full ${!isModal ? "max-w-md mx-auto my-10" : ""}`}
    >
      <div className="border border-slate-200 rounded-4xl shadow-xl overflow-hidden bg-white">
        {/* Header Section */}
        <div className="bg-linear-to-br from-[#2A4150] to-[#1a3340] px-8 py-8 rounded-t-4xl">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {title || "Welcome Back"}
          </h2>
          <p className="text-slate-300 text-sm mt-1.5">
            Please enter your details to continue
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-semibold animate-[shake_0.5s_ease-in-out]">
              {error}
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <InputField
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 pl-10 text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-900 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <InputField
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="rounded-xl border-slate-200 focus:border-[#2A4150] h-11 pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2A4150] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password & Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-[#2A4150] focus:ring-[#2A4150]"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>
              <button
                onClick={() => setIsForgotPassword(true)}
                className="text-xs font-semibold text-[#2A4150] hover:text-[#1a3340] hover:underline underline-offset-4 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              text={
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? "Authenticating..." : "Login to Account"}
                  {!isLoading && <ArrowRight size={16} />}
                </div>
              }
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full font-bold py-3 rounded-xl bg-linear-to-r from-[#2A4150] to-[#1a3340] 
                text-white hover:from-[#1a3340] hover:to-[#2A4150] 
                transition-all duration-300 shadow-lg shadow-[#2A4150]/20 
                active:scale-[0.98] mt-2"
            />

            {/* Create Account Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link
                  href="/sign-up"
                  onClick={() => dispatch(closeLogin())}
                  className="font-bold text-[#2A4150] hover:text-[#1a3340] hover:underline underline-offset-4 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}