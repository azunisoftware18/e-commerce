"use client";

import React, { useState } from "react";
import DietPlanTable from "@/components/table/DietPlanTable";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

import {
  useDeleteDietPlan,
  useCreateDietPlan,
  useUpdateDietPlan,
} from "@/lib/mutations/useDietPlans";
import { useDietPlans } from "@/lib/queries/useDietPlans";
import DietPlanModal from "@/components/modals/DietPlanModal"; // Import your modal
import toast from "react-hot-toast";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: plans = [], isLoading } = useDietPlans();
  const { mutate: deletePlan } = useDeleteDietPlan();
  const { mutate: createPlan, isLoading: isCreating } = useCreateDietPlan();
  const { mutate: updatePlan, isLoading: isUpdating } = useUpdateDietPlan();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const handleAddPlan = (data) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("type", data.type);
    formData.append("price", data.price || 0);
    formData.append("description", data.description);

    // 👇 VERY IMPORTANT (files)
    if (data.thumbnail?.[0]) {
      formData.append("thumbnail", data.thumbnail[0]);
    }

    if (data.pdf?.[0]) {
      formData.append("pdf", data.pdf[0]);
    }

    createPlan(formData, {
      onSuccess: () => {
        toast.success("Diet Plan created successfully!");
        setIsModalOpen(false);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to create plan");
      },
    });
  };

  const handleUpdatePlan = (data) => {
  updatePlan(
    { id: selectedPlan.id, data },
    {
      onSuccess: () => {
        toast.success("Diet Plan updated successfully!");
        setIsModalOpen(false);
        setSelectedPlan(null); // reset
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Update failed");
      },
    }
  );
};

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2A4150] capitalize">
            Diet Plans
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            Manage all your diet plans here.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          {/* 1. Added onClick to open modal */}
          <Button
            text="Add Diet Plan"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2A4150] text-white rounded-2xl px-6 py-3 shadow-lg shadow-blue-900/10 hover:bg-[#1a2b38] transition-all"
          />
        </div>
      </header>

      {/* Table */}
      <section className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <DietPlanTable
          data={plans}
          isLoading={isLoading}
          deletePlan={deletePlan}
          onEdit={handleEdit}
        />
      </section>

      {/* 2. Integrate the Modal Component */}
      <DietPlanModal
  open={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  }}
  onSubmit={selectedPlan ? handleUpdatePlan : handleAddPlan}
  initialData={selectedPlan} 
  isLoading={isCreating || isUpdating}
/>
    </div>
  );
}
