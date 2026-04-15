"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUpdateProfile, useChangePassword } from "@/lib/mutations/useAuth";
import { useMe } from "@/lib/queries/useUsers";
import { useQueryClient } from "@tanstack/react-query"; // ✅ Query invalidation ke liye
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { Eye, EyeOff, User, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminProfilePage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // --- Form 1: Profile Details ---
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm({
    defaultValues: { name: "", email: "", phone: "" },
  });

  // --- Form 2: Password Change ---
  const {
    register: regPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    watch: watchPass,
    formState: { errors: passErrors, isDirty: passDirty, isValid: passValid },
  } = useForm({
    mode: "onChange",
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, resetProfile]);

  const onUpdateProfile = async (data) => {
    try {
      await updateProfile.mutateAsync(data);
      // ✅ Cache update: Taki poore app mein naya naam/email reflect ho
      queryClient.invalidateQueries({ queryKey: ["me"] });
      alert("Profile updated successfully ");
      resetProfile(data); 
    } catch (err) {
      alert(err?.response?.data?.message || "Profile update failed ❌");
    }
  };

  const onChangePass = async (data) => {
  try {
    if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
      return alert("All fields are required");
    }

    await changePassword.mutateAsync({
  currentPassword: data.oldPassword,
  newPassword: data.newPassword,
  confirmNewPassword: data.confirmPassword,
});

    alert("Password changed successfully ");
    resetPass();
  } catch (err) {
    alert(err?.response?.data?.message || "Password change failed ❌");
  }
};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
        <p className="font-medium animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-12 bg-slate-50 min-h-screen">
      <div className=" mx-auto space-y-12">
        
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your administrator account.</p>
        </header>

        {/* --- SECTION 1: PROFILE --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <User className="w-5 h-5 text-blue-600" /> Personal Info
            </h2>
            <p className="text-sm text-slate-500">Update your account's primary contact information.</p>
          </div>

          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 space-y-5">
              <InputField
                label="Full Name"
                {...regProfile("name", { required: "Name is required" })}
                error={profileErrors.name?.message}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  type="email"
                  {...regProfile("email", { required: "Email is required" })}
                  error={profileErrors.email?.message}
                />
                <InputField label="Phone" {...regProfile("phone")} />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <Button
                type="submit"
                disabled={!profileDirty || updateProfile.isPending}
                text={updateProfile.isPending ? "Saving..." : "Save Profile"}
                className="min-w-35"
              />
            </div>
          </form>
        </section>

        {/* --- SECTION 2: PASSWORD --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <ShieldCheck className="w-5 h-5 text-amber-600" /> Security
            </h2>
            <p className="text-sm text-slate-500">Ensure your account uses a secure password.</p>
          </div>

          <form onSubmit={handlePassSubmit(onChangePass)} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 space-y-5">
              <div className="relative">
                <InputField
                  label="Current Password"
                  type={showOldPass ? "text" : "password"}
                  {...regPass("oldPassword", { required: "Current password is required" })}
                  error={passErrors.oldPassword?.message}
                />
                <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-9.5 text-slate-400">
                  {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <InputField
                    label="New Password"
                    type={showNewPass ? "text" : "password"}
                    {...regPass("newPassword", {
                      required: "Required",
                      minLength: { value: 6, message: "Min 6 chars" }
                    })}
                    error={passErrors.newPassword?.message}
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-9.5 text-slate-400">
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <InputField
                  label="Confirm Password"
                  type={showNewPass ? "text" : "password"}
                  {...regPass("confirmPassword", {
  required: "Confirm password is required",
  validate: (v) =>
    v === watchPass("newPassword") || "Passwords do not match",
})}
                  error={passErrors.confirmPassword?.message}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <Button
                type="submit"
                disabled={!passDirty || !passValid || changePassword.isPending}
                text={changePassword.isPending ? "Updating..." : "Change Password"}
                className="min-w-35 bg-slate-900"
              />
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}