"use client";

import React from "react";
import {
  Download,
  Tag,
  IndianRupee,
  Sparkles,
  Clock,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { useDietPlans } from "@/lib/queries/useDietPlans";
import { useDownloadDietPlan } from "@/lib/mutations/useDietPlans";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DietPlans() {
  const { data: plans = [], isLoading } = useDietPlans();
  const { mutate: downloadPlan } = useDownloadDietPlan();
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState({});

  // Helper function to get the best available image URL
  const getPlanImageUrl = (plan) => {
    // Priority: thumbnailSignedUrl > thumbnail > thumbnailKey
    if (plan.thumbnailSignedUrl) return plan.thumbnailSignedUrl;
    if (plan.thumbnail && plan.thumbnail.startsWith('http')) return plan.thumbnail;
    if (plan.thumbnailKey) {
      return `https://azzunique-fintech-node.s3.ap-south-1.amazonaws.com/${plan.thumbnailKey}`;
    }
    return null;
  };

  // Format plan name for display
  const formatPlanName = (name) => {
    return name
      ?.replace(/[-_]/g, " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) || "Untitled Plan";
  };

  const handleImageError = (planId) => {
    setImageErrors((prev) => ({ ...prev, [planId]: true }));
  };

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
    <div className="w-full mx-auto px-4 py-6 md:px-8 lg:px-10 min-h-screen bg-[#fcfcfc]">
      {/* Header */}
      <div className="mb-12 mx-auto">
        <h1 className="text-2xl md:text-3xl font-black uppercase text-[#2A4150] tracking-tight">
          Your Diet <span className="text-slate-400 font-light">Plans</span>
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
            {plans.map((plan) => {
              const imageUrl = getPlanImageUrl(plan);
              
              return (
                <div
                  key={plan.id}
                  className="group flex flex-col rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(42,65,80,0.15)] hover:-translate-y-3 overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative h-60 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
                    {imageUrl && !imageErrors[plan.id] ? (
                      <img
                        src={imageUrl}
                        alt={formatPlanName(plan.name)}
                        className="h-full w-full  transition-transform duration-700 group-hover:scale-110"
                        onError={() => handleImageError(plan.id)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
                        <ImageIcon size={48} className="text-slate-300 mb-2" />
                        <p className="text-xs text-slate-400 font-medium">
                          {formatPlanName(plan.name)}
                        </p>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                          plan.type === "FREE"
                            ? "bg-green-500/90 text-white"
                            : "bg-blue-500/90 text-white"
                        }`}
                      >
                        {plan.type}
                      </span>
                    </div>

                    {/* Price Tag (only for PAID plans) */}
                    {plan.type === "PAID" && plan.price > 0 && (
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
                    )}
                  </div>

                  {/* Info Content */}
                  <div className="flex flex-col grow p-7 bg-linear-to-b from-white to-slate-50">
                    {/* Type Indicator */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          plan.type === "FREE" ? "bg-green-500" : "bg-blue-500"
                        }`}
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {plan.type} PLAN
                      </span>
                      
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-[#2A4150] leading-tight mb-3 group-hover:text-blue-900 transition-colors">
                      {formatPlanName(plan.name)}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6 font-medium">
                      {plan.description ||
                        "Detailed nutritional breakdown and meal scheduling tailored for your specific fitness goals and dietary preferences."}
                    </p>

                    {/* Action Button */}
                    <div className="mt-auto space-y-4">
                      <Button
                        text="Download Plan"
                        icon={<Download size={16} />}
                        onClick={() =>
                          router.push(`/diet-plans/diet-plan-checkout/${plan.id}`)
                        }
                        className="group/btn relative flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-[#2A4150] py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#1a2b36] active:scale-95 shadow-lg shadow-blue-900/10"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}