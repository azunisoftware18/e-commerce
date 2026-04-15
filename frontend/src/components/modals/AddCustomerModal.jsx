"use client";

import { X } from "lucide-react";
import AddCustomerForm from "../forms/AddCustomerForm";

export default function AddCustomerModal({ 
  open, 
  onClose, 
  onSubmit, 
  defaultValues 
}) {
  if (!open) return null;

  const isEdit = !!defaultValues;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#2A4150] px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? "Edit Customer" : "Add Customer"}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isEdit 
                ? "Update customer details" 
                : "Register a new customer"}
            </p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-8">
          <AddCustomerForm
  defaultValues={defaultValues}
  submitText={isEdit ? "Update Customer" : "Create Customer"}
  onSuccess={onClose}
  onCancel={onClose}
  onSubmit={onSubmit}
/>
        </div>
      </div>
    </div>
  );
}