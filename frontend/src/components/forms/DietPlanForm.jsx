"use client";

import React from "react";
import { useForm } from "react-hook-form";
import {
  Type,
  Tag,
  IndianRupee,
  FileText,
  Image as ImageIcon,
  FileDown,
} from "lucide-react";
import InputField from "@/components/ui/InputField";
import TextAreaField from "@/components/ui/TextAreaField"; // 👈 Integrated your component
import Button from "@/components/ui/Button";

export default function DietPlanForm({
  onSubmit,
  isLoading,
  initialData,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {
      name: "",
      type: "FREE",
      price: 0,
      description: "",
      thumbnail: null,
      pdfFile: null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Row 1: Name & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Plan Name
          </label>
          <InputField
            placeholder="Extreme Weight Loss"
            error={errors.name?.message}
            {...register("name", { required: "Plan name is required" })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Category
          </label>
          <div className="relative">
            <Tag
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              {...register("type")}
              className="w-full h-12.5 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#2A4150]/10 outline-none appearance-none cursor-pointer text-[#2A4150] font-medium"
            >
              <option value="FREE">FREE</option>
              <option value="PAID">PAID</option> {/* FIXED */}
            </select>
          </div>
        </div>
      </div>

      {/* Row 2: Price & Thumbnail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Price (INR)
          </label>
          <InputField
            type="number"
            icon={IndianRupee}
            placeholder="0.00"
            disabled={watch("type") === "FREE"}
            error={errors.price?.message}
            {...register("price", {
              validate: (value) => {
                if (watch("type") === "PAID" && (!value || value <= 0)) {
                  return "Price is required for paid plans";
                }
                return true;
              },
            })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Thumbnail
          </label>
          <InputField
            type="file"
            icon={ImageIcon}
            accept="image/*"
            error={errors.thumbnail?.message}
            {...register("thumbnail", { required: !initialData && "Required" })}
          />
        </div>
      </div>

      {/* Row 3: PDF Upload */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-[#2A4150] uppercase tracking-widest ml-1">
          Diet Plan PDF
        </label>
        <InputField
          type="file"
          icon={FileDown}
          accept=".pdf"
          className="bg-blue-50/40 border-dashed border-2 border-blue-100"
          error={errors.pdfFile?.message}
          {...register("pdf", {
            required: !initialData && "PDF file is required",
          })}
        />
      </div>

      {/* Description using your Reusable Component */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          Description
        </label>
        <TextAreaField
          placeholder="Detailed breakdown of the meal plan, goals, and results..."
          rows={4}
          error={errors.description?.message}
          className="rounded-2xl bg-white border-slate-200" // Form style match karne ke liye
          {...register("description", { required: "Description is required" })}
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 tracking-widest uppercase transition-colors"
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={isLoading}
          text={
            isLoading
              ? "Processing..."
              : initialData
                ? "Update Plan"
                : "Publish Plan"
          }
          className="px-8 py-3.5 bg-[#2A4150] text-white rounded-xl shadow-lg shadow-blue-900/20"
        />
      </div>
    </form>
  );
}
