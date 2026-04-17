"use client";

import { useForm } from "react-hook-form";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  EyeOff,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AddCustomerForm({
  defaultValues,
  title = "",
  submitText = "Add Customer",
  onSubmit,
  onSuccess,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = (data) => {
    if (!data.password) {
      delete data.password; // 👈 empty password remove
    }

    onSubmit?.(data);
    onSuccess?.();
    reset();
  };

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name,
        email: defaultValues.email,
        phone: defaultValues.phone,
        location: defaultValues.location,
        status: defaultValues.status,
        joinDate: defaultValues.joinDate?.split("T")[0],
      });
    }
  }, [defaultValues, reset]);

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-xl font-bold text-slate-800 mb-6">{title}</h2>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Personal Details Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Full Name"
            placeholder="John Doe"
            icon={User}
            isRequired
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />

          <InputField
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            icon={Mail}
            isRequired
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />
        </div>

        {/* Contact & Security Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Phone Number"
            placeholder="9876543210"
            icon={Phone}
            isRequired
            error={errors.phone?.message}
            {...register("phone", { required: "Phone is required" })}
          />

          <div className="relative">
            <InputField
              label="Account Password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              icon={Lock}
              isRequired
              error={errors.password?.message}
              className="pr-10" // 👈 space for icon
              {...register("password", {
                minLength: {
                  value: 8,
                  message: "Minimum 8 characters required",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                  message: "Must include uppercase, lowercase, number & symbol",
                },
              })}
            />

            {/* 👁️ Eye Icon */}
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9.5 cursor-pointer text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <InputField
          label="Residential Location"
          placeholder="Jaipur, India"
          icon={MapPin}
          isRequired
          error={errors.location?.message}
          {...register("location", { required: "Location is required" })}
        />

        {/* Account Settings Group */}
        <div className="bg-slate-50 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-5 border border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block items-center gap-2">
              <CheckCircle size={14} /> Account Status
            </label>
            <select
              {...register("status")}
              className="w-full h-11.25 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block items-center gap-2">
              <Calendar size={14} /> Registration Date
            </label>
            <input
              type="date"
              {...register("joinDate")}
              className="w-full h-11.25 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            text="Cancel"
            variant="secondary"
            onClick={onCancel || (() => reset())}
            className="px-6 border-none text-slate-500 hover:bg-slate-100"
          />
          <Button
            type="submit"
            text={submitText}
            className="px-8 bg-[#2A4150] hover:bg-[#1a2b36] text-white shadow-xl shadow-blue-900/10"
          />
        </div>
      </form>
    </div>
  );
}
