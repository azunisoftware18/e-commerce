'use client';

import ConsultationForm from "@/components/forms/ConsultationForm";
import { useCreateConsultation } from "@/lib/mutations/useConsultation";
import toast from "react-hot-toast";

export default function Consultation() {
  const { mutate, isPending } = useCreateConsultation();

  const handleSubmit = (data) => {
    mutate(data, {
      onSuccess: (res) => {toast.success("Consultation created successfully");
      },
      onError: (err) => {
        console.log("ERROR:", err);
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#e0e0e0]">
      
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-20 bg-[#2A4150] text-white shadow-2xl z-10">
        <div className="w-full max-w-lg">
          
          <header className="mb-10">
            <span className="text-[#e0e0e0] uppercase tracking-widest text-xs font-semibold">
              Get Started
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mt-2 mb-4">
              Book a <span className="text-[#e0e0e0]">Consultation</span>
            </h1>
            <div className="h-1 w-20 bg-[#e0e0e0] mb-6"></div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Take the first step toward your goals.
            </p>
          </header>

          <div className="bg-white/5 p-1 rounded-xl backdrop-blur-sm text-[#2A4150]">
            <ConsultationForm
              onSubmitForm={handleSubmit}   // 🔥 pass handler
              isSubmitting={isPending}     // 🔥 loader
              showSubmitButton={true}
            />
          </div>
        </div>
      </section>

      {/* Right side same rahega */}
      <section className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
        <img 
          src="https://i.pinimg.com/1200x/1c/e6/48/1ce6488e1797d67b3904e71ddbd682f6.jpg" 
          alt="Professional Consultation" 
          className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700 ease-in-out"
        />
        
        {/* Thematic Overlays */}
        <div className="absolute inset-0 bg-[#2A4150]/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-linear-to-r from-[#2A4150] via-transparent to-transparent opacity-60 md:opacity-100"></div>

        {/* Floating Aesthetic Card (Desktop Only) */}
        <div className="hidden lg:block absolute bottom-12 right-12 bg-white/10 backdrop-blur-md p-6 border border-white/20 rounded-sm max-w-xs">
          <p className="text-white text-sm italic">
            "The best way to predict the future is to create it."
          </p>
        </div>
      </section>
    </main>
  );
}