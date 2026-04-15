"use client";

import React from "react";
import {
  Download,
  Tag,
  IndianRupee,
  Sparkles,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useDietPlans } from "@/lib/queries/useDietPlans";
import { useDownloadDietPlan } from "@/lib/mutations/useDietPlans";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function DietPlans() {
  const { data: plans = [], isLoading } = useDietPlans();
  const { mutate: downloadPlan } = useDownloadDietPlan();
  const router = useRouter();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2A4150] border-t-transparent"></div>
          <p className="text-[#2A4150] font-bold tracking-[0.2em] text-[10px] uppercase">
            Fetching Nutrition Guides
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      {/* Header */}
      <div className="mb-12  mx-auto">
        <div className="flex items-center gap-2 mb-3"></div>
        <h1 className="text-4xl md:text-5xl font-black text-[#2A4150] tracking-tight">
          Your Diet <span className="text-slate-400">Plans</span>
        </h1>
        <p className="text-slate-500 mt-3 text-sm max-w-xl font-medium leading-relaxed">
          Access your personalized nutrition strategies and download them as
          high-quality PDF guides.
        </p>
      </div>

      {/* Grid */}
      <div className="w-full mx-auto">
        {plans.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white text-slate-400">
            <Sparkles size={40} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-500">No plans found</p>
            <p className="text-xs mt-1">
              Check back later for your updated nutrition guide.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="group flex flex-col rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(42,65,80,0.15)] hover:-translate-y-3 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                  <img
                    src={`http://localhost:8000${plan.thumbnail}`}
                    alt={plan.name}
                    className="h-full w-full transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Floating Price Tag */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm flex items-center gap-1">
                      <IndianRupee
                        size={12}
                        className="text-[#2A4150] font-bold"
                      />
                      <span className="text-sm font-black text-[#2A4150]">
                        {plan.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Content */}
                <div className="flex flex-col grow p-7 bg-[#e0e0e0] ">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`h-2 w-2 rounded-full ${plan.type === "FREE" ? "bg-green-500" : "bg-blue-500"}`}
                    />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {plan.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#2A4150] leading-tight mb-3 group-hover:text-blue-900 transition-colors">
                    {plan.name}
                  </h3>

                  {/* Description - Added here */}
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6 font-medium">
                    {plan.description ||
                      "Detailed nutritional breakdown and meal scheduling tailored for your specific fitness goals and dietary preferences."}
                  </p>

                  <div className="mt-auto space-y-4">
                    <Button
                      text=" Download Plan"
                      icon={<Download />}
                      onClick={() => router.push(`/diet-plans/diet-plan-checkout/${plan.id}`)}
                      className="group/btn relative flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-[#2A4150] py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#1a2b36] active:scale-95 shadow-lg shadow-blue-900/10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
