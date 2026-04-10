"use client";

import { X, Sparkles } from "lucide-react";
import DietPlanForm from "../forms/DietPlanForm";

export default function DietPlanModal({ open, onClose, onSubmit, isLoading,  initialData, }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-4xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header - Fixed at top */}
        <div className="shrink-0 bg-[#2A4150] px-8 py-6 text-white relative">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
  {initialData ? "Edit Diet Plan" : "Add New Diet Plan"}
</h2>
              <p className="text-blue-200/60 text-[10px] font-medium uppercase tracking-widest mt-1">Nutrition Management</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <DietPlanForm 
            onSubmit={onSubmit} 
            isLoading={isLoading} 
            onCancel={onClose}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
}