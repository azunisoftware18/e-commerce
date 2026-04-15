"use client";

import { X } from "lucide-react";
import AddCategoryForm from "../forms/AddCategoryForm";

export default function AddCategoryModal({
  open,
  onClose,
  onSubmit,
  defaultValues,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-4xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#2A4150] px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              {" "}
              {defaultValues?.type === "subcategory"
                ? "Edit SubCategory"
                : "Add Category"}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Create a new group for your products
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full shadow-sm transition-all text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <AddCategoryForm
            submitText="Create Category"
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
