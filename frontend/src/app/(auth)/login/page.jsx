"use client";

import { useState } from "react";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { closeLogin, setUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/mutations/useAuth";

export default function Login({ title, onSuccess, isModal = false }) {
  const { mutate, isLoading } = useLogin();
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    mutate(form, {
      onSuccess: (res) => {
        const user = res?.data?.data?.user;
        dispatch(setUser(user));
        localStorage.setItem("user", JSON.stringify(user));
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

  return (
    <div
      className={`w-full ${!isModal ? "max-w-md mx-auto my-10 border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden" : ""} bg-white`}
    >
      {/* Header Section - Modern Soft Slate background */}
      <div className="bg-[#2A4150] px-8 py-10 border-b border-slate-100">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {title || "Login"}
        </h2>
        <p className="text-slate-300 text-sm mt-2">
          Welcome back! Please enter your details.
        </p>
      </div>

      <div className="p-8 sm:p-10">
        {/* Branding Icon - Slightly larger and cleaner */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#2A4150]/5 p-6 rounded-4xl text-[#2A4150] shadow-inner">
            <Smartphone size={44} strokeWidth={1.5} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-semibold animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              Email Address
            </label>
            <InputField
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-2xl border-slate-200 focus:border-[#2A4150] h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">
              Password
            </label>
            <div className="relative">
  <InputField
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    value={form.password}
    onChange={(e) => setForm({ ...form, password: e.target.value })}
    className="rounded-2xl border-slate-200 focus:border-[#2A4150] h-12 pr-10"
  />

  {/* 👁 Toggle Button */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2A4150]"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
          </div>

          <Button
            text={isLoading ? "Authenticating..." : "LOGIN TO ACCOUNT"}
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full font-bold py-4 rounded-2xl bg-[#2A4150] text-white hover:bg-[#1a2a35] transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]"
          />

          <div className="grid justify-items-end text-xs pt-4 ">
            
            <Link
              href="/sign-up"
              className="text-[#2A4150] font-extrabold hover:underline underline-offset-4"
              onClick={() => dispatch(closeLogin())}
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer info */}
        {/* <p className="mt-12 text-[10px] text-center text-slate-300 uppercase tracking-widest font-medium">
          Secure Login • 256-bit Encryption
        </p> */}
      </div>
    </div>
  );
}
