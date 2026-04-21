"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  Mail,
  Phone,
  Globe,
  Camera,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Share2,
} from "lucide-react";

// Components
import InputField from "@/components/ui/InputField";
import TextAreaField from "@/components/ui/TextAreaField";
import Button from "@/components/ui/Button";
import FilterDropdown from "@/components/ui/FilterDropdown"; // Aapka custom dropdown

// Hooks
import { useSettings } from "@/lib/queries/useSettings";
import { useUpsertSetting } from "@/lib/mutations/useSettings";

const PLATFORM_OPTIONS = [
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "Twitter (X)", value: "twitter" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "YouTube", value: "youtube" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Website", value: "website" },
];

export default function SettingPage() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: upsertSetting, isPending: isUpdating } = useUpsertSetting();
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      address: "",
      socialLinks: [{ platform: "", url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const logoFile = watch("logo");

  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl); // cleanup
    } else if (settings?.logo) {
      // 👈 fallback to existing image
      setPreview(`http://api.herbsnglam.com${settings.logo}`);
    } else {
      setPreview(null);
    }
  }, [logoFile, settings]);

  useEffect(() => {
    if (settings) {
      reset({
        companyName: settings.companyName || "",
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        socialLinks:
          settings.socialLinks?.length > 0
            ? settings.socialLinks
            : [{ platform: "", url: "" }],
      });
      if (settings.logo) setPreview(`http://api.herbsnglam.com${settings.logo}`);
    }
  }, [settings, reset]);

  const onSubmit = (data) => {
    const payload = {
      ...data,
      image: data.logo?.[0] || null,
    };
    upsertSetting(payload, {
      onSuccess: () => toast.success("Settings saved!"),
      onError: (err) =>
        toast.error(err?.response?.data?.error || "Error saving settings"),
    });
  };

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse text-[#2A4150]">
        Loading System Settings...
      </div>
    );

  return (
    <div className="w-full mx-auto p-4 md:p-8 bg-white ">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2A4150] tracking-tight">
            System Settings
          </h1>
          <p className="text-[#2A4150]/60 mt-1">
            Configure your organization's public profile and social presence.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="space-y-6"
      >
        {/* 1. Profile & Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e0e0] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e0e0e0] bg-[#e0e0e0]/20">
            <h2 className="font-semibold text-[#2A4150]">Business Identity</h2>
          </div>

          <div className="p-6 space-y-8">
            {/* Logo Upload UI */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="group relative">
                <div className="w-32 h-32 rounded-2xl bg-[#e0e0e0]/30 border-2 border-dashed border-[#e0e0e0] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#2A4150]">
                  {preview ? (
                    <img
                      src={preview}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <Camera className="text-[#2A4150]/40 w-8 h-8" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-white shadow-md border border-[#e0e0e0] rounded-full p-2 cursor-pointer hover:bg-[#e0e0e0]/10">
                  <Plus size={16} className="text-[#2A4150]" />
                  <input
                    type="file"
                    className="hidden"
                    {...register("logo")}
                    accept="image/*"
                  />
                </label>
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-medium text-[#2A4150]">
                  Organization Logo
                </h4>
                <p className="text-xs text-[#2A4150]/60 leading-relaxed max-w-xs">
                  Upload a high-resolution square logo. Accepted formats: PNG,
                  JPG or SVG (Max 2MB).
                </p>
              </div>
            </div>

            {/* Grid Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <InputField
                label="Company Name"
                placeholder="My Business Name"
                {...register("companyName", { required: true })}
                icon={Globe}
                className="focus:border-[#2A4150]"
              />
              <InputField
                label="Contact Email"
                type="email"
                placeholder="hello@company.com"
                {...register("email")}
                icon={Mail}
                className="focus:border-[#2A4150]"
              />
              <InputField
                label="Phone Number"
                placeholder="+91 00000 00000"
                {...register("phone")}
                icon={Phone}
                className="focus:border-[#2A4150]"
              />
              <div className="md:col-span-2">
                <TextAreaField
                  label="Physical Address"
                  placeholder="Street, City, State, Country..."
                  {...register("address")}
                  className="focus:border-[#2A4150]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Social Media Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e0e0] overflow-visible">
          <div className="px-6 py-4 border-b border-[#e0e0e0] bg-[#e0e0e0]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 size={18} className="text-[#2A4150]" />
              <h2 className="font-semibold text-[#2A4150]">Social Presence</h2>
            </div>
            <Button
              type="button"
              text="Add Link"
              variant="outline"
              size="sm"
              style={{ borderColor: "#2A4150", color: "#2A4150" }}
              className="h-9 px-4 rounded-xl hover:bg-[#2A4150] hover:text-white transition-colors"
              icon={<Plus size={14} />}
              onClick={() => append({ platform: "", url: "" })}
            />
          </div>

          <div className="p-6 space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="group flex flex-col md:flex-row items-start md:items-end gap-4 p-4 rounded-xl border border-[#e0e0e0] bg-[#e0e0e0]/10 transition-all hover:border-[#2A4150]/30"
              >
                {/* Platform Dropdown Section */}
                <div className="w-full md:w-64 space-y-1.5">
                  <label className="text-xs font-semibold text-[#2A4150]/70 uppercase tracking-wider">
                    Platform
                  </label>

                  <div
                    onClick={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Controller
                      name={`socialLinks.${index}.platform`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FilterDropdown
                          options={PLATFORM_OPTIONS}
                          value={value}
                          onChange={(val) => onChange(val)}
                          placeholder="Choose..."
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>
                {/* URL Input */}
                <div className="w-full flex-1 space-y-1.5 ">
                  <label className="text-xs font-semibold text-[#2A4150]/70 uppercase tracking-wider">
                    Link / URL
                  </label>
                  <InputField
                    placeholder="https://facebook.com/your-page"
                    {...register(`socialLinks.${index}.url`)}
                    containerClassName="w-full"
                    className="focus:border-[#2A4150]"
                  />
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mb-1 p-2.5 text-[#2A4150]/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-[#e0e0e0] rounded-2xl">
                <p className="text-[#2A4150]/40 text-sm">
                  No social links added yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <Button
            text="Discard Changes"
            variant="secondary"
            className="w-full sm:w-auto px-8 bg-[#e0e0e0] text-[#2A4150] hover:bg-[#d1d1d1]"
            icon={<RotateCcw size={16} />}
            onClick={() => {
              reset();
              setPreview(settings?.logo);
            }}
            disabled={isUpdating}
          />
          <Button
            type="submit"
            text={isUpdating ? "Saving..." : "Update Settings"}
            variant="primary"
            style={{ backgroundColor: "#2A4150" }}
            className="w-full sm:w-auto px-10 shadow-lg shadow-[#2A4150]/20 text-white"
            icon={<Save size={16} />}
            disabled={isUpdating}
          />
        </div>
      </form>
    </div>
  );
}