"use client";

import React from "react";

import { useDietPlans } from "@/lib/queries/useDietPlans";
import { useDeleteDietPlan, useDownloadDietPlan } from "@/lib/mutations/useDietPlans";

export default function DietPlans() {
  const { data: plans = [], isLoading } = useDietPlans();
  const { mutate: deletePlan } = useDeleteDietPlan();
  const { mutate: downloadPlan } = useDownloadDietPlan();

  if (isLoading) {
    return (
      <div className="p-6 text-slate-500">Loading diet plans...</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">
          Diet Plans
        </h1>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left w-[80px]">Image</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-slate-400"
                >
                  No diet plans found
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    <img
                      src={`http://localhost:5000${plan.thumbnail}`}
                      alt={plan.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {plan.name}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    {plan.type === "FREE" ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
                        FREE
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                        PAID
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-slate-600">
                    {plan.type === "FREE"
                      ? "FREE"
                      : `₹${plan.price}`}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 flex gap-2">
                    {/* Download */}
                    <button
                      onClick={() => downloadPlan(plan.id)}
                      className="rounded-lg bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                    >
                      Download
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="rounded-lg bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}