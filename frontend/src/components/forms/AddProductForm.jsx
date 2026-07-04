"use client";

import { useForm } from "react-hook-form";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { Upload, Package, Layers, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCategories } from "@/lib/queries/useCategories";
import { useCategoryWithSubCategories } from "@/lib/queries/useSubCategories";
import RichTextEditor from "../ui/RichTextEditor";

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
  
  const [previewImages, setPreviewImages] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  
  const { data: categoryData } = useCategoryWithSubCategories(selectedCategory);
  const [description, setDescription] = useState("");
  const subCategories = categoryData?.subCategories || [];

  const handleFormSubmit = (data) => {
    data.images = [
      data.frontImage,
      data.backImage,
      data.leftImage,
      data.rightImage,
    ];

    onSubmit?.(data);
    reset();
    setPreviewImages({ front: null, back: null, left: null, right: null });
  };

  // Register image inputs for validation tracking
  useEffect(() => {
    register("frontImage", { required: "Front image is required" });
    register("backImage", { required: "Back image is required" });
    register("leftImage", { required: "Left image is required" });
    register("rightImage", { required: "Right image is required" });
  }, [register]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
  return () => {
    Object.values(previewImages).forEach((img) => {
      if (typeof img === "string" && img.startsWith("blob:")) {
        URL.revokeObjectURL(img);
      }
    });
  };
}, [previewImages]);

  useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        description: editData.description,
        price: editData.price,
        stock: editData.stock,
        status: editData.status,
        categoryid: editData.categoryid,
        subCategoryId: editData.subCategoryId,
      });
      setDescription(editData.description || "");
      
      // If editing, map existing image URLs to the preview states
      if (editData.images) {
        setPreviewImages({
  front:
    editData.images?.[0]?.signedUrl ||
    editData.images?.[0]?.url ||
    null,

  back:
    editData.images?.[1]?.signedUrl ||
    editData.images?.[1]?.url ||
    null,

  left:
    editData.images?.[2]?.signedUrl ||
    editData.images?.[2]?.url ||
    null,

  right:
    editData.images?.[3]?.signedUrl ||
    editData.images?.[3]?.url ||
    null,
});
      }
    }
  }, [editData, reset]);

  useEffect(() => {
  if (!editData) {
    setValue("subCategoryId", "");
    return;
  }

  if (editData.categoryid) {
    setValue("categoryid", editData.categoryid);
  }

  if (
    editData.subCategoryId &&
    subCategories.length > 0
  ) {
    setValue("subCategoryId", editData.subCategoryId);
  }
}, [
  editData,
  subCategories,
  setValue,
]);

  const handleImageChange = (key, file) => {
    if (!file) return;

    setValue(`${key}Image`, file, { shouldValidate: true });
    setPreviewImages((prev) => ({
      ...prev,
      [key]: URL.createObjectURL(file),
    }));
  };

  const removeImage = (key) => {
    setValue(`${key}Image`, null, { shouldValidate: true });
    setPreviewImages((prev) => ({
      ...prev,
      [key]: null,
    }));
  };

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
                {...register("categoryid", { required: "Category is required" })}
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
                <p className="text-red-500 text-[11px] mt-1">{errors.categoryid.message}</p>
              )}
            </div>

            <div className="space-y-1 w-full">
              <label className="text-sm font-semibold text-slate-700">
                Status *
              </label>
              <select
                {...register("status", { required: true })}
                className="w-full h-11.5 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Out_of_Stock">Out of Stock</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              SubCategory *
            </label>
            <select
              {...register("subCategoryId", { required: "SubCategory is required" })}
                className="w-full h-11.25 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              <option value="">Select SubCategory</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            {errors.subCategoryId && (
              <p className="text-red-500 text-[11px] mt-1">{errors.subCategoryId.message}</p>
            )}
          </div>
        </div>

        {/* Section 4: Enhanced Image Upload */}
        <div className="space-y-4 pt-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Upload size={18} /> Product Angle Images <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: "front", label: "Front Angle" },
              { key: "back", label: "Back Angle" },
              { key: "left", label: "Left Side" },
              { key: "right", label: "Right Side" },
            ].map((item) => {
              const hasError = errors[`${item.key}Image`];
              const preview = previewImages[item.key];

              return (
                <div key={item.key} className="flex flex-col space-y-2">
                  <div
                    className={`relative aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all overflow-hidden bg-slate-50 group group-hover:bg-white
                      ${preview ? "border-slate-200" : "border-slate-300 hover:border-blue-500"} 
                      ${hasError && !preview ? "border-red-400 bg-red-50/30" : ""}`}
                  >
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          className="w-full h-full object-cover"
                          alt={item.label}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(item.key)}
                            className="p-2 bg-white rounded-full text-red-600 shadow-md hover:scale-105 transition-transform"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-3 text-center">
                        <Upload size={20} className={`${hasError ? "text-red-400" : "text-slate-400 group-hover:text-blue-500"} mb-1.5 transition-colors`} />
                        <span className="text-xs font-semibold text-slate-700 block">{item.label}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click to browse</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(item.key, e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </div>
                  {hasError && !preview && (
                    <p className="text-red-500 text-[10px] font-medium leading-none text-center">
                      {errors[`${item.key}Image`]?.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <RichTextEditor
          label="Product Description"
          value={description}
          onChange={(val) => {
            setDescription(val);
            setValue("description", val, { shouldValidate: true });
          }}
        />

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