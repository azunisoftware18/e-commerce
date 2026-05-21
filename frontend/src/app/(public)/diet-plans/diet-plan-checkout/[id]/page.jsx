"use client";

import React from "react";
import { useParams } from "next/navigation";
import ConsultationForm from "@/components/forms/ConsultationForm";
import { useDietPlan } from "@/lib/queries/useDietPlans";
import { useDownloadDietPlan } from "@/lib/mutations/useDietPlans";
import { useCreateConsultation } from "@/lib/mutations/useConsultation";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { ShieldCheck, ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { id } = useParams();
  const { data: plan, isLoading } = useDietPlan(id);
  const { mutateAsync: createConsultation, isPending } = useCreateConsultation();
  const { mutate: downloadPlan } = useDownloadDietPlan();

  const handleCheckoutSubmit = async (data) => {
    try {
      const payload = { ...data, dietPlanId: id };
      await createConsultation(payload);
      toast.success("Consultation registered!");
      downloadPlan(id);
      toast.success("Download started automatically");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">
      Loading checkout details...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Top Navigation Bar */}
      <div className="w-full bg-white border-b border-slate-100 px-6 py-4 mb-8">
        <div className="w-full mx-auto flex items-center justify-between">
          <Link href="/diet-plans" className="flex items-center gap-2 text-slate-500 hover:text-[#2A4150] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold uppercase tracking-wider">Back to Plans</span>
          </Link>
          
        </div>
      </div>

      <div className="w-full mx-auto px-6">
        <div className=" grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: FORM SECTION (8 Columns) */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[#2A4150] tracking-tight">Checkout</h1>
              <p className="text-slate-500 mt-1">Please provide your details to access the premium diet guide.</p>
            </div>
            
            <div >
                <ConsultationForm
                title={`Enter Information`}
                onSubmitForm={handleCheckoutSubmit}
                showSubmitButton={false}
                isSubmitting={isPending}
                />
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY (5 Columns) */}
          <div className="lg:col-span-5 sticky top-36">
            <div className="bg-[#2A4150] rounded-4xl p-8 text-white shadow-2xl shadow-blue-900/20 overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                    <ShoppingBag size={24} className="text-blue-300" />
                  </div>
                  <h2 className="text-xl font-bold">Order Summary</h2>
                </div>

                <div className="space-y-6">
                  {/* Item Detail */}
                  <div className="flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-100/80">Premium Guide</span>
                      <span className="text-lg font-bold truncate max-w-50">
  {plan?.name
    ?.replace(/[-_]/g, " ")
    ?.toLowerCase()
    ?.replace(/\b\w/g, (char) => char.toUpperCase())}
</span>
                    </div>
                    <span className="text-xl font-black">₹{plan?.price || 0}</span>
                  </div>

                  <div className="h-px w-full bg-white/10" />

                  {/* Pricing Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-blue-100/60">
                      <span>Subtotal</span>
                      <span>₹{plan?.price || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-100/60">
                      <span>Processing Fee</span>
                      <span className="text-green-400 font-bold uppercase text-[10px]">Free</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4">
                    <div className="flex justify-between items-end mb-8">
                      <span className="text-sm font-medium text-blue-100/60">Total Amount</span>
                      <span className="text-4xl font-black tracking-tighter text-white">₹{plan?.price || 0}</span>
                    </div>

                    <Button
                      text={isPending ? "Generating Access..." : "Complete & Download"}
                      type="submit"
                      form="checkout-form"
                      disabled={isPending}
                      className="w-full h-16 bg-white text-[#2A4150]! rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                      icon={<CreditCard size={20} />}
                    />
                  </div>

                  
                </div>
              </div>
            </div>

            {/* Support Note */}
            
          </div>

        </div>
      </div>
    </div>
  );
}