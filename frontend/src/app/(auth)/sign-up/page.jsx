"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import AddressForm from "@/components/forms/AddressForm";
import {
  User,
  Mail,
  Phone,
  UserCircle,
  ArrowLeft,
  EyeOff,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSignup } from "@/lib/mutations/useAuth";

export default function SignUp({ mobile }) {
  const router = useRouter();
  const { mutate, isLoading } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      phone: mobile,
    },
  });

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      location: `${data.address}, ${data.city}, ${data.state} - ${data.pincode}`,
    };

    mutate(payload, {
      onSuccess: (res) => {
        toast.success("Signup Successful ");
        router.push("/login");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Signup failed ❌");
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50/50">
      <div className="max-w-2xl bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-[#2A4150] p-3 rounded-2xl text-white">
            <UserCircle size={28} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Sign Up</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name + Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              icon={User}
              {...register("name", {
                required: "Full name is required",
                minLength: { value: 3, message: "Name too short" },
              })}
              error={errors.name?.message}
            />

            <InputField
              label="Email"
              type="email"
              icon={Mail}
              {...register("email", {
                required: "Email is required",
              })}
              error={errors.email?.message}
            />
          </div>

          {/* Phone */}
          <InputField
            label="Mobile Number"
            type="tel"
            icon={Phone}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            {...register("phone", {
              required: "Phone is required",
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: "Enter valid 10-digit Indian mobile number",
              },
            })}
            error={errors.phone?.message}
          />

          {/* Password */}
          <div className="relative">
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Min 8 characters" },
              })}
              error={errors.password?.message}
            />

            {/* 👁️ Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9.5 text-slate-400 hover:text-[#2A4150] transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Address */}
          <div className="p-6 bg-slate-50 rounded-2xl w-full">
            <h3 className="text-xs font-bold mb-4 text-slate-400">
              SECURE DELIVERY ADDRESS
            </h3>

            <AddressForm
              register={register}
              errors={errors}
              fields={{
                firstName: false,
                lastName: false,
                email: false,
                pincode: true,
                city: true,
                state: true,
                address: true,
              }}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            {/* Back */}
            <Button
              onClick={() => router.back()}
              variant="secondary"
              className="px-6 border-none text-slate-500 hover:bg-slate-100"
              text="Cancel"
            />

            <Button
              text={isLoading ? "Signing up..." : "Sign Up"}
              type="submit"
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
