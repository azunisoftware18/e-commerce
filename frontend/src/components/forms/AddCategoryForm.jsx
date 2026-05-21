"use client";

import { useForm } from "react-hook-form";
import { Tag, FileText, Upload, X, ImageIcon, Layers } from "lucide-react";
import Button from "../ui/Button";
import TextAreaField from "../ui/TextAreaField";
import InputField from "../ui/InputField";
import { useEffect, useState } from "react";
import { useCategories } from "@/lib/queries/useCategories";
import SelectField from "../ui/SelectField";

export default function AddCategoryForm({
  title = "",
  submitText = "Save Category",
  defaultValues = {},
  onSubmit,
  onCancel,
}) {
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      type: "category",
      ...defaultValues,
    },
  });

  const type = watch("type");
  const selectedImage = watch("image");
  const { data: categories = [] } = useCategories();

  // Image Preview Logic
  useEffect(() => {
    if (selectedImage && selectedImage instanceof File) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof selectedImage === "string" && selectedImage !== "") {
      setPreview(selectedImage);
    } else {
      setPreview(null);
    }
  }, [selectedImage]);

  useEffect(() => {
    reset({ type: "category", ...defaultValues });
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit?.(data);
    reset();
    setPreview(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-2">
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 text-sm">
            Manage categories and sub-categories easily.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Entity Type Dropdown */}
          <SelectField
            label="Entity Type"
            placeholder="Select Type"
            required
            options={[
              { label: "Main Category", value: "category" },
              { label: "Sub-Category", value: "subcategory" },
            ]}
            error={errors.type?.message}
            {...register("type", { required: "Type is required" })}
          />

          {/* Parent Category Dropdown (Only for Sub-Category) */}
          {type === "subcategory" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <SelectField
                label="Parent Category"
                placeholder="Select Parent"
                required
                options={categories?.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
                error={errors.categoryId?.message}
                {...register("categoryId", {
                  required:
                    type === "subcategory"
                      ? "Parent category is required"
                      : false,
                })}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={
              type === "subcategory" ? "Sub-Category Name" : "Category Name"
            }
            placeholder="e.g. Laptops"
            icon={Tag}
            isRequired
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />

          <InputField
            label="Prefix"
            placeholder="ELEC-"
            icon={Tag}
            {...register("sku")}
          />
        </div>

        {type !== "subcategory" && (
  <TextAreaField
    label="Description"
    placeholder="Enter details..."
    icon={FileText}
    isRequired
    error={errors.description?.message}
    {...register("description", {
      required:
        type !== "subcategory"
          ? "Description is required"
          : false,
    })}
  />
)}
        {/* Image Upload UI - Ab dono cases mein dikhega */}
       {type !== "subcategory" && (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
      <ImageIcon size={16} className="text-[#2A4150]" />
      Category Image
    </label>

    <div className="group relative border-2 border-dashed border-slate-200 hover:border-[#2A4150] hover:bg-slate-50 transition-all rounded-xl p-4 min-h-35 flex flex-col items-center justify-center overflow-hidden">
      {preview ? (
        <div className="relative w-full h-40">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain rounded-lg"
          />
          <button
            type="button"
            onClick={() => {
              setValue("image", null);
              setPreview(null);
            }}
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md transform translate-x-1/2 -translate-y-1/2"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="bg-slate-100 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
            <Upload size={24} className="text-[#2A4150]" />
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600 font-medium">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PNG, JPG up to 5MB
            </p>
          </div>
        </>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file)
            setValue("image", file, {
              shouldValidate: true,
            });
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  </div>
)}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
          <Button
            type="button"
            text="Discard"
            variant="secondary"
            onClick={onCancel || (() => reset())}
            className="px-6 text-slate-500 hover:bg-slate-100 border-none"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            text={
              isSubmitting
                ? type === "subcategory"
                  ? "Saving Sub-Category..."
                  : "Saving Category..."
                : defaultValues?.id
                  ? type === "subcategory"
                    ? "Update Sub-Category"
                    : "Update Category"
                  : type === "subcategory"
                    ? "Create Sub-Category"
                    : "Create Category"
            }
            className="px-8 bg-[#2A4150] hover:bg-[#1e2f3a] text-white shadow-lg disabled:opacity-70"
          />
        </div>
      </form>
    </div>
  );
}
