"use client";

import { useForm } from "react-hook-form";
import InputField from "../ui/InputField";
import TextAreaField from "../ui/TextAreaField";
import Button from "../ui/Button";
import { Upload, Package, Layers, Info } from "lucide-react";
import { useEffect } from "react";
import { useCategories } from "@/lib/queries/useCategories";
import { useCategoryWithSubCategories } from "@/lib/queries/useSubCategories";

export default function AddProductForm({
  title = "",
  submitText = "Add Product",
  onSubmit,
  onSuccess,
  onCancel,
  editData,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm();
  const selectedCategory = watch("categoryid");
  const { data: categories = [], isLoading } = useCategories();

  const { data: categoryData } = useCategoryWithSubCategories(selectedCategory);

  const subCategories = categoryData?.subCategories || [];
  const handleFormSubmit = (data) => {
    onSubmit?.(data);
    reset();
  };

  useEffect(() => {
    register("images");
  }, [register]);

  useEffect(() => {
    if (editData) {
      setValue("name", editData.name);
      setValue("description", editData.description);
      setValue("price", editData.price);
      setValue("stock", editData.stock);
      setValue("status", editData.status);
      setValue("categoryid", editData.categoryid);
    }
  }, [editData]);

  useEffect(() => {
  setValue("subCategoryId", "");
}, [selectedCategory]);

useEffect(() => {
  if (editData) {
    setValue("subCategoryId", editData.subCategoryId);
  }
}, [editData]);

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-xl font-bold text-slate-800 mb-6">{title}</h2>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#2A4150] font-semibold border-b border-slate-100 pb-2">
            <Info size={18} /> <span>Basic Information</span>
          </div>

          <InputField
            label="Product Name"
            placeholder="e.g. MacBook Air M2"
            isRequired
            error={errors.name?.message}
            {...register("name", { required: "Product name is required" })}
          />

          <TextAreaField
            label="Product Description"
            placeholder="Describe the key features and specifications..."
            isRequired
            error={errors.description?.message}
            {...register("description", {
              required: "Description is required",
            })}
          />
        </div>

        {/* Section 2: Inventory & Pricing */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-[#2A4150] font-semibold border-b border-slate-100 pb-2">
            <Package size={18} /> <span>Pricing & Inventory</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Price (₹)"
              placeholder="0.00"
              type="number"
              isRequired
              error={errors.price?.message}
              {...register("price", { required: "Price is required" })}
            />
            <InputField
              label="Stock Quantity"
              placeholder="e.g. 50"
              type="number"
              isRequired
              error={errors.stock?.message}
              {...register("stock", { required: "Stock is required" })}
            />
          </div>
        </div>

        {/* Section 3: Category & Status */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-[#2A4150] font-semibold border-b border-slate-100 pb-2">
            <Layers size={18} /> <span>Classification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Category *
              </label>
              <select
                {...register("categoryid", {
                  required: "Category is required",
                })}
                className="w-full h-11.25 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryid && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.categoryid.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Status *
              </label>
              <select
                {...register("status", { required: true })}
                className="w-full h-11.25 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Inactive">Inactive (Draft)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
  <label className="text-sm font-semibold text-slate-700">
    SubCategory *
  </label>

  <select
    {...register("subCategoryId", {
      required: "SubCategory is required",
    })}
    className="w-full h-11.25 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm"
  >
    <option value="">Select SubCategory</option>

    {subCategories.map((sub) => (
      <option key={sub.id} value={sub.id}>
        {sub.name}
      </option>
    ))}
  </select>

  {errors.subCategoryId && (
    <p className="text-red-500 text-[11px] mt-1">
      {errors.subCategoryId.message}
    </p>
  )}
</div>
        </div>

        {/* Section 4: Image Upload */}
        <div className="space-y-2 pt-4">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Upload size={18} /> Product Images
          </label>
          <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors rounded-2xl p-8 bg-slate-50/50 group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setValue("images", files, { shouldValidate: true });
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center pointer-events-none">
              <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-slate-400 group-hover:text-blue-500 transition-colors">
                <Upload size={24} />
              </div>
              <p className="text-sm text-slate-600 font-medium">
                Click to upload or drag multiple images
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG, GIF (Max 5MB per file)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            type="button"
            text="Discard"
            variant="secondary"
            onClick={onCancel || (() => reset())}
            className="px-6 border-none text-slate-500 hover:bg-slate-100"
          />
          <Button
            type="submit"
            text={submitText}
            className="px-10 bg-[#2A4150] hover:bg-[#1a2b36] text-white shadow-xl shadow-blue-900/10"
          />
        </div>
      </form>
    </div>
  );
}
