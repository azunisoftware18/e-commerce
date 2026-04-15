"use client";

import { X } from "lucide-react";
import AddProductForm from "../forms/AddProductForm";

export default function AddProductModal({ open, onClose, onSubmit, editData }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-4xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-[#2A4150] z-10">
          <div>
            <h2 className="text-xl font-bold text-white">{editData ? "Edit Product" : "Add Product"}</h2>
            <p className="text-xs text-slate-300 mt-0.5">Fill in the details to list a new item</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <AddProductForm
            title="" // Title modal header mein hai
            submitText="Publish Product"
            onSuccess={onClose}
            onCancel={onClose}
            onSubmit={onSubmit}
            editData={editData}
          />
        </div>
      </div>
    </div>
  );
}