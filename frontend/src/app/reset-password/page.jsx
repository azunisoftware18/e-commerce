"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useResetForgotPassword } from "@/lib/mutations/useResetForgotPassword";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const { mutate, isLoading } = useResetForgotPassword();

  const handleReset = () => {
    if (!password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    mutate(
      {
        token,
        email,
        password,
      },
      {
        onSuccess: (res) => {
          setMessage(
            res?.data?.message ||
              "Password reset successful"
          );

          setTimeout(() => {
            router.push("/login");
          }, 2000);
        },

        onError: (error) => {
          setMessage(
            error?.response?.data?.message ||
              "Something went wrong"
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#2A4150] mb-6 text-center">
          Reset Password
        </h1>

        <div className="space-y-4">
          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-[#2A4150]"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-[#2A4150]"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="w-full bg-[#2A4150] text-white py-3 rounded-lg font-semibold hover:bg-[#1d3442] transition mt-4"
        >
          {isLoading
            ? "Resetting..."
            : "Reset Password"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-slate-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}